import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import PostCard from '../components/PostCard';
import Comment from '../components/Comment';
import AddComment from '../components/AddComment';

export default function SinglePostPage() {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/posts/${postId}`);
        setPost(response.data);
        setComments(response.data.comments);
        setError('');
      } catch (err) {
        console.error('Failed to fetch post:', err);
        setError(err.response?.data?.message || 'Failed to load post.');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  const handleCommentAdded = (newComment) => {
    setComments([...comments, newComment]);
  };

  if (loading) {
    return <div className="text-center text-gray-500">Loading post...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  if (!post) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <PostCard post={post} />
      
      <div className="bg-white p-5 rounded-lg shadow-md mt-4">
        <h2 className="text-xl font-semibold mb-4">Comments</h2>
        
        <AddComment postId={post._id} onCommentAdded={handleCommentAdded} />
        
        <div className="mt-6 space-y-4">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <Comment key={comment._id} comment={comment} />
            ))
          ) : (
            <p className="text-gray-500 text-center">No comments yet. Be the first!</p>
          )}
        </div>
      </div>
    </div>
  );
}