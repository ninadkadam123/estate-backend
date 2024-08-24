import prisma from '../lib/prisma.js';

export const getChats = async (req, res) => {
  const tokenUserId = req.userId;

  try {
    const chats = await prisma.chat.findMany({
      where: { usetrIDs: { hasSome: [tokenUserId] } },
    });

    for (const chat of chats) {
      const receiverId = chat.usetrIDs.find(
        (id) => id !== tokenUserId
      );

      const receiver = await prisma.user.findUnique({
        where: { id: receiverId },
        select: {
          id: true,
          username: true,
          avatar: true,
        },
      });

      chat.receiver = receiver;
    }
    res.status(200).json(chats);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Failed to get Chats!!!' });
  }
};

export const getChat = async (req, res) => {
  const tokenUserId = req.userId;
  const chatId = req.params.id;

  if (!chatId) {
    return res.status(405).json('Chat Id not found !!!!');
  }

  try {
    const chat = await prisma.chat.findUnique({
      where: {
        id: chatId,
        usetrIDs: {
          hasSome: [tokenUserId],
        },
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    await prisma.chat.update({
      where: {
        id: chatId,
      },
      data: {
        seenBy: {
          push: [tokenUserId],
        },
      },
    });

    res.status(200).json(chat);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Failed to get Chats!!!' });
  }
};

export const addChat = async (req, res) => {
  const tokenUserId = req.userId;
  const receiverId = req.body.receiverId;
  if (!receiverId) {
    return res.status(405).json('Receiver Id not found !!!!');
  }
  try {
    const newChat = await prisma.chat.create({
      data: {
        usetrIDs: [tokenUserId, receiverId],
      },
    });
    res.status(200).json(newChat);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Failed to get Chats!!!' });
  }
};

export const readChat = async (req, res) => {
  const tokenUserId = req.userId;
  const chatId = req.params.id;
  try {
    const chat = await prisma.chat.update({
      where: {
        id: chatId,
        usetrIDs: {
          hasSome: [tokenUserId],
        },
      },
      data: {
        seenBy: {
          set: [tokenUserId],
        },
      },
    });
    res.status(200).json(posts);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Failed to get Chats!!!' });
  }
};
