import prisma from '../lib/prisma.js';
export const addMessage = async (req, res) => {
  const tokenUserId = req.userId;
  const chatId = req.params.chatId;
  const text = req.body.text;
  try {
    const chat = prisma.chat.findUnique({
      where: {
        id: chatId,
        usetrIDs: {
          hasSome: [tokenUserId],
        },
      },
    });
    if (!chat) {
      return res.status(404).json({ message: 'chat not found!!!' });
    }

    const mesage = await prisma.message.create({
      data: { text, chatId, userId: tokenUserId },
    });
    await prisma.chat.update({
      where: { id: chatId },
      data: { seenBy: [tokenUserId], lastMessage: text },
    });

    res.status(200).json(mesage);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Failed to create messages!!!' });
  }
};
