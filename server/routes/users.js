import express from 'express';
import User from '../models/User.js';
import Post from '../models/Post.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';
import cloudinary from '../config/cloudinary.js';
import streamifier from 'streamifier';
import Notification from '../models/Notification.js';

const router = express.Router();

// --- 1. ADD NEW SEARCH ROUTE ---
router.get('/search', protect, async (req, res) => {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ message: 'Search query is required' });
  }

  try {
    const users = await User.find({
      username: { $regex: q, $options: 'i' }, // 'i' for case-insensitive
    })
    .select('username profilePicture') // Only send public, needed info
    .limit(10); // Limit results to 10

    res.json(users);
  } catch (error) {
    console.error('Search Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
// --- END NEW ROUTE ---


// ... (GET /:username route is unchanged) ...
router.get('/:username', async (req, res) => {
// ... (rest of route)
// ...
  try {
    const user = await User.findOne({ username: req.params.username }).select(
      '-password'
    );

    if (user) {
      res.json({
        id: user._id,
        username: user.username,
        profilePicture: user.profilePicture,
        bio: user.bio,
        followersCount: user.followers.length,
        followingCount: user.following.length,
        followers: user.followers,
        createdAt: user.createdAt,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Get User Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ... (GET /:username/posts route is unchanged) ...
router.get('/:username/posts', async (req, res) => {
// ... (rest of route)
// ...
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const posts = await Post.find({ user: user._id })
      .sort({ createdAt: -1 })
      .populate('user', 'username profilePicture');
      
    res.json(posts);
  } catch (error) {
    console.error('Get User Posts Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ... (PUT /me/update route is unchanged) ...
router.put('/me/update', protect, async (req, res) => {
// ... (rest of route)
// ...
  try {
    const { bio } = req.body;
    const user = await User.findById(req.user.id);

    if (user) {
      user.bio = bio || user.bio;
      const updatedUser = await user.save();

      res.json({
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        profilePicture: updatedUser.profilePicture,
        bio: updatedUser.bio,
        followers: updatedUser.followers,
        following: updatedUser.following,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ... (PUT /me/picture route is unchanged) ...
router.put('/me/picture', protect, upload.single('media'), async (req, res) => {
// ... (rest of route)
// ...
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    const uploadPromise = new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'social_app_profiles' },
        (error, result) => {
          if (result) {
            resolve(result.secure_url);
          } else {
            reject(error);
          }
        }
      );
      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });

    const mediaUrl = await uploadPromise;

    const user = await User.findById(req.user.id);
    user.profilePicture = mediaUrl;
    const updatedUser = await user.save();

    res.json({
      id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      profilePicture: updatedUser.profilePicture,
      bio: updatedUser.bio,
      followers: updatedUser.followers,
      following: updatedUser.following,
    });

  } catch (error) {
    console.error('Update Picture Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ... (POST /:userId/follow route is unchanged) ...
router.post('/:userId/follow', protect, async (req, res) => {
// ... (rest of route)
// ...
  try {
    const userToFollow = await User.findById(req.params.userId);
    const currentUser = await User.findById(req.user.id);

    if (!userToFollow || !currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.params.userId === req.user.id) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    if (currentUser.following.includes(req.params.userId)) {
      return res.status(400).json({ message: 'You are already following this user' });
    }

    currentUser.following.push(req.params.userId);
    userToFollow.followers.push(req.user.id);

    await currentUser.save();
    await userToFollow.save();

    // --- 2. CREATE & EMIT NOTIFICATION ---
    try {
      if (req.params.userId !== req.user.id) { // Don't notify self
        const newNotification = new Notification({
          recipient: req.params.userId,
          sender: req.user.id,
          type: 'follow',
        });
        await newNotification.save();
        await newNotification.populate('sender', 'username profilePicture');

        const io = req.app.get('socketio');
        const receiverSocket = io.onlineUsers.find(user => user.userId === req.params.userId);

        if (receiverSocket) {
          io.to(receiverSocket.socketId).emit('getNotification', newNotification);
        }
      }
    } catch (err) {
      console.error('Notification error:', err);
    }
    // --- END NEW ---

    res.json({ following: currentUser.following });

  } catch (error) {
    console.error('Follow Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ... (POST /:userId/unfollow route is unchanged) ...
router.post('/:userId/unfollow', protect, async (req, res) => {
// ... (rest of route)
// ...
  try {
    const userToUnfollow = await User.findById(req.params.userId);
    const currentUser = await User.findById(req.user.id);

    if (!userToUnfollow || !currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.params.userId === req.user.id) {
      return res.status(400).json({ message: "You cannot unfollow yourself" });
    }

    if (!currentUser.following.includes(req.params.userId)) {
      return res.status(400).json({ message: 'You are not following this user' });
    }

    currentUser.following = currentUser.following.filter(
      (id) => id.toString() !== req.params.userId
    );
    userToUnfollow.followers = userToUnfollow.followers.filter(
      (id) => id.toString() !== req.user.id
    );

    await currentUser.save();
    await userToUnfollow.save();

    res.json({ following: currentUser.following });

  } catch (error) {
    console.error('Unfollow Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;