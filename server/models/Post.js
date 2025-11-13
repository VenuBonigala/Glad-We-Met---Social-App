import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      // required: true, <-- This was the bug.
      // We remove `required: true` because a post can be just an image.
      // Our route handler in posts.js already checks if *both* content and media are missing.
      max: 500,
    },
    mediaUrl: {
      type: String, // This will store the URL from a service like Cloudinary
      default: '',
    },
    likes: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'User',
      default: [],
    },
    comments: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Comment',
      default: [],
    },
  },
  { timestamps: true }
);

const Post = mongoose.model('Post', PostSchema);
export default Post;