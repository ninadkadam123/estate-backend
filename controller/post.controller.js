import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';

export const getPosts = async (req, res) => {
  const query = req.query;

  try {
    const posts = await prisma.post.findMany({
      where: {
        city: query.city || undefined,
        type: query.type || undefined,
        property: query.property || undefined,
        bedroom: parseInt(query.bedroom) || undefined,
        price: {
          gte: parseInt(query.minPrice) || undefined,
          lte: parseInt(query.maxPrice) || undefined,
        },
      },
    });
    res.status(200).json(posts);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Failed to get posts!!!' });
  }
};

export const getPost = async (req, res) => {
  const id = req.params.id;

  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        postDetail: true,
        user: {
          select: {
            username: true,
            avatar: true,
          },
        },
      },
    });

    let userId;
    const token = req.cookies?.token;
    // console.log(`token ${!token}`);
    if (token) {
      jwt.verify(
        token,
        process.env.JWT_SECRET_KEY,
        async (err, payload) => {
          if (!err) {
            userId = payload.id;
            const savedPost = await prisma.savedPost.findUnique({
              where: {
                userId_postId: {
                  userId,
                  postId: id,
                },
              },
            });
            return res
              .status(200)
              .json({ ...post, isSaved: saved ? true : false });
          }
        }
      );
    }
    return res.status(200).json({ ...post, isSaved: false });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Failed to get post!!!' });
  }
};
export const addPost = async (req, res) => {
  const body = req.body;

  const tokenId = req.userId;
  try {
    const newPost = await prisma.post.create({
      data: {
        ...body.postData,
        userId: tokenId,

        postDetail: {
          create: body.postDetail,
        },
      },
    });

    res.status(200).json(newPost);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Failed to create post!!!' });
  }
};
export const updatePost = async (req, res) => {
  const id = req.patram.id;
  const tokenId = req.userId;
  try {
    res.status(200).json();
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Failed to update posts!!!' });
  }
};

export const deletePost = async (req, res) => {
  const id = req.param.id;
  const tokenId = req.userId;
  try {
    const post = await prisma.post.findUnique({ where: { id } });

    if (post.userId != tokenId) {
      return res.status(403).json({ message: 'Not Authorised!!!' });
    }

    await prisma.post.delete({ where: { id } });
    res.status(200).json({ message: 'Post deleted!!!!' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Failed to delete posts!!!' });
  }
};
