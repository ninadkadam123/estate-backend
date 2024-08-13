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
  console.log('It Works');
  try {
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Failed to delete Users!!!' });
  }
};
