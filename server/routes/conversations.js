import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import Conversation from '../models/Conversation.js';

const router = express.Router();

router.post('/', protect, async (req, res) => {
  const { receiverId } = req.body;
  const senderId = req.user.id;

  if (!receiverId) {
    return res.status(400).json({ message: 'Receiver ID is required' });
  }

  if (receiverId === senderId) {
    return res.status(400).json({ message: "You cannot start a chat with yourself" });
  }

  try {
    let convo = await Conversation.findOne({
      members: { $all: [senderId, receiverId] },
    });

    if (!convo) {
      convo = new Conversation({
        members: [senderId, receiverId],
      });
      await convo.save();
    }

    res.status(200).json(convo);
  } catch (error) {
    console.error('Start Conversation Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/', protect, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      members: { $in: [req.user.id] },
    })
    .populate('members', 'username profilePicture')
    .populate({
      path: 'lastMessage',
      populate: { path: 'sender', select: 'username' }
    })
    .sort({ updatedAt: -1 });

    const processedConversations = conversations.map(convo => {
      const otherMember = convo.members.find(
        (member) => member._id.toString() !== req.user.id
      );
      return {
        _id: convo._id,
        otherMember: otherMember,
        lastMessage: convo.lastMessage,
        updatedAt: convo.updatedAt,
      };
    });

    res.status(200).json(processedConversations);
  } catch (error) {
    console.error('Get Conversations Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;