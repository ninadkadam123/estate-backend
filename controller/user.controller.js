import prisma from '../lib/prisma.js';
import bcrypt from 'bcrypt';

export const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    const listUsers = [];
    users.forEach((user) => {
      const { password, ...userA } = user;
      listUsers.push(userA);
    });
    return res.status(200).json(listUsers);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Failed to get Users!!!' });
  }
};

export const getUser = async (req, res) => {
  const id = req.params.id;
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        postDetail: true,
        user: { select: { username: true, avatar: true } },
      },
    });

    return res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get User!!!' });
  }
};
export const updateUser = async (req, res) => {
  const id = req.params.id;
  const tokenUserId = req.userId;
  const { password, ...input } = req.body;

  if (id !== tokenUserId) {
    res.status(403).json({ message: 'You are Not authorized!!!' });
  }
  let updatedPassword = null;
  if (password) {
    updatedPassword = bcrypt.hash(password, 10);
  }

  try {
    const updateUser = await prisma.user.update({
      where: { id },
      data: {
        ...input,
        ...(updatedPassword && { password: updatedPassword }),
      },
    });

    const { password: userPassword, ...rest } = updateUser;

    res.status(200).json(rest);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Failed to update Users!!!' });
  }
};
export const deleteUser = async (req, res) => {
  const id = req.params.id;
  const tokenUserId = req.userId;
  if (id !== tokenUserId) {
    return res.status(403).json({ message: 'Not authorised!!!' });
  }
  try {
    await prisma.user.delete({ where: { id } });
    return res.status(200).json({ message: 'User has been Deleted' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Failed to delete Users!!!' });
  }
};

export const savePost = async (req, res) => {
  const postId = req.body.postId;
  const tokenUserId = req.userId;
  try {
    const savedPost = await prisma.savedPost.findUnique({
      where: {
        userId_postId: {
          userId: tokenUserId,
          postId,
        },
      },
    });

    if (savedPost) {
      await prisma.savedPost.delete({ where: { id: savedPost.id } });
      return res
        .status(200)
        .json({ message: 'Post removed from saved List' });
    } else {
      await prisma.savedPost.create({
        data: { userId: tokenUserId, postId },
      });

      return res.status(200).json({ message: 'Post Saved' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Failed to delete Users!!!' });
  }
};

export const profilePosts = async (req, res) => {
  const tokenUserId = req.params.userId;
  console.log('in profileposts');
  try {
    const userPosts = await prisma.post.findMany({
      where: { userId: tokenUserId },
    });
    const saved = await prisma.savedPost.findMany({
      where: { userId: tokenUserId },
      include: { post: true },
    });

    const savedPosts = saved.map((item) => item.post);
    return res.status(200).json({ userPosts, savedPosts });
  } catch (error) {
    console.log('in profileposts');
    res.status(500).json({ message: 'Failed to get User!!!' });
  }
};
