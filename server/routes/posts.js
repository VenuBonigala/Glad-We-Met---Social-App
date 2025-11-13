import express from 'express';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import User from '../models/User.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';
import cloudinary from '../config/cloudinary.js';
import streamifier from 'streamifier';
import Notification from '../models/Notification.js'; // --- 1. IMPORT NOTIFICATION ---

const router = express.Router();

// ... (POST / route is unchanged) ...
router.post('/', protect, upload.single('media'), async (req, res) => {
  try {
    const { content } = req.body;
    let mediaUrl = '';

    if (!content && !req.file) {
      return res.status(400).json({ message: 'Post must have content or an image' });
    }

    if (req.file) {
      const uploadPromise = new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'social_app_posts' },
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

      mediaUrl = await uploadPromise;
    }

    const newPost = new Post({
      user: req.user.id,
      content: content || '',
      mediaUrl: mediaUrl,
    });

    const savedPost = await newPost.save();
    
    await savedPost.populate('user', 'username profilePicture');

    res.status(201).json(savedPost);
  } catch (error) {
    console.error('Create Post Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ... (GET / and GET /feed routes are unchanged) ...
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('user', 'username profilePicture')
      .populate('comments')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(posts);
  } catch (error) {
    console.error('Get Posts Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/feed', protect, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    const followingList = currentUser.following;

    const posts = await Post.find({ user: { $in: followingList } })
      .populate('user', 'username profilePicture')
      .populate('comments')
      .sort({ createdAt: -1 })
      .limit(20);
      
    res.json(posts);
  } catch (error) {
    console.error('Get Feed Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.get('/:postId', async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId)
      .populate('user', 'username profilePicture')
      .populate({
        path: 'comments',
        populate: {
          path: 'user',
          select: 'username profilePicture',
        },
        options: { sort: { createdAt: 1 } }
      });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    console.error('Get Single Post Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.put('/:postId/like', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const isLiked = post.likes.includes(req.user.id);
    
    if (isLiked) {
      post.likes = post.likes.filter(
        (userId) => userId.toString() !== req.user.id
      );
    } else {
      post.likes.push(req.user.id);
    }

    await post.save();
    
    // --- 2. CREATE & EMIT NOTIFICATION (only on like, not unlike) ---
    if (!isLiked && post.user.toString() !== req.user.id) {
      try {
        const newNotification = new Notification({
          recipient: post.user,
          sender: req.user.id,
          type: 'like',
          post: post._id,
        });
        await newNotification.save();
        await newNotification.populate('sender', 'username profilePicture');

        const io = req.app.get('socketio');
        const receiverSocket = io.onlineUsers.find(user => user.userId === post.user.toString());

        if (receiverSocket) {
          io.to(receiverSocket.socketId).emit('getNotification', newNotification);
        }
      } catch (err) {
        console.error('Like Notification error:', err);
      }
    }
    // --- END NEW ---
    
    res.json({ likes: post.likes });

  } catch (error) {
    console.error('Like Post Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/:postId/comment', protect, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: 'Comment text cannot be empty' });
    }

    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const newComment = new Comment({
      user: req.user.id,
      post: req.params.postId,
      text,
    });
    const savedComment = await newComment.save();

    post.comments.push(savedComment._id);
    await post.save();
    
    await savedComment.populate('user', 'username profilePicture');

    // --- 3. CREATE & EMIT NOTIFICATION ---
    if (post.user.toString() !== req.user.id) {
      try {
        const newNotification = new Notification({
          recipient: post.user,
          sender: req.user.id,
          type: 'comment',
          post: post._id,
        });
        await newNotification.save();
        await newNotification.populate('sender', 'username profilePicture');

        const io = req.app.get('socketio');
        const receiverSocket = io.onlineUsers.find(user => user.userId === post.user.toString());

        if (receiverSocket) {
          io.to(receiverSocket.socketId).emit('getNotification', newNotification);
        }
      } catch (err) {
        console.error('Comment Notification error:', err);
      }
    }
    // --- END NEW ---

    res.status(201).json(savedComment);

  } catch (error) {
    console.error('Comment Post Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ... (DELETE /:postId route is unchanged) ...
router.delete('/:postId', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(4404).json({ message: 'Post not found' });
    }

    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    
    if (post.mediaUrl) {
      try {
        const publicId = post.mediaUrl.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`social_app_posts/${publicId}`);
      } catch (err) {
        console.error("Cloudinary delete error:", err);
      }
    }

    await Comment.deleteMany({ post: post._id });
    
    await post.remove(); // Use remove() for middleware triggers if any

    res.json({ message: 'Post and associated comments removed' });
  } catch (error)
 {
    console.error('Delete Post Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;