import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import Message from '../models/Message.js';

const router = express.Router();

router.get('/:conversationId', protect, async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId,
    })
    .populate('sender', 'username profilePicture')
    .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error('Get Messages Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;