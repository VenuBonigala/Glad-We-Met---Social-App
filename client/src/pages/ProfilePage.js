import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import EditProfileModal from '../components/EditProfileModal'; // 1. IMPORT MODAL

export default function ProfilePage() {
  const { username } = useParams();
  const { user: currentUser, updateUser: updateAuthUser } = useAuth();
  const navigate = useNavigate(); 
  
  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]); // 2. ADD POSTS STATE
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false); // 3. ADD MODAL STATE
  const fileInputRef = useRef(null);

  const isFollowing = currentUser && currentUser.following && currentUser.following.includes(profileUser?.id);
  const isOwnProfile = currentUser?.username === profileUser?.username;

  useEffect(() => {
    const fetchProfileAndPosts = async () => {
      setLoading(true);
      setError('');
      try {
        // Fetch profile
        const profileRes = await api.get(`/users/${username}`);
        setProfileUser(profileRes.data);
        
        // Fetch posts
        const postsRes = await api.get(`/users/${username}/posts`);
        setPosts(postsRes.data);

      } catch (err) {
        console.error('Failed to fetch profile:', err);
        setError(err.response?.data?.message || 'Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndPosts();
  }, [username]); // Re-fetch all data if username changes

  // ... (handleFollow and handleUnfollow are the same)
  const handleFollow = async () => {
    try {
      const response = await api.post(`/users/${profileUser.id}/follow`);
      updateAuthUser({ ...currentUser, following: response.data.following });
      setProfileUser(prev => ({
        ...prev,
        followersCount: prev.followersCount + 1,
      }));
    } catch (err) {
      console.error('Follow error:', err);
    }
  };

  const handleUnfollow = async () => {
    try {
      const response = await api.post(`/users/${profileUser.id}/unfollow`);
      updateAuthUser({ ...currentUser, following: response.data.following });
      setProfileUser(prev => ({
        ...prev,
        followersCount: prev.followersCount - 1,
      }));
    } catch (err) {
      console.error('Unfollow error:', err);
    }
  };

  const handleStartMessage = async () => {
    try {
      await api.post('/conversations', { receiverId: profileUser.id });
      navigate('/chat');
    } catch (err) {
      console.error('Failed to start conversation', err);
    }
  };

  const handleProfilePicClick = () => {
    if (isOwnProfile) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e) => {
    // ... (This function is unchanged)
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('media', file);

    try {
      const response = await api.put('/users/me/picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      const updatedUser = response.data;
      
      updateAuthUser(updatedUser);
      setProfileUser(prev => ({ ...prev, profilePicture: updatedUser.profilePicture }));

    } catch (err) {
      console.error('Failed to upload profile picture:', err);
    }
  };
  
  // 4. NEW: Handle profile update from modal
  const handleProfileUpdate = (updatedUser) => {
    setProfileUser(prev => ({ ...prev, bio: updatedUser.bio }));
  };

  if (loading) {
    return <div className="text-center text-gray-500">Loading profile...</div>;
  }
  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }
  if (!profileUser) {
    return null;
  }

  return (
    <>
      {/* 5. RENDER THE MODAL */}
      {showEditModal && (
        <EditProfileModal 
          onClose={() => setShowEditModal(false)}
          onProfileUpdate={handleProfileUpdate}
        />
      )}

      <div className="max-w-3xl mx-auto">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*"
        />
        
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="flex flex-col sm:flex-row items-center sm:items-start">
            <img
              src={profileUser.profilePicture || `https://placehold.co/150x150/E2E8F0/718096?text=${profileUser.username[0]}`}
              alt={profileUser.username}
              className={`w-32 h-32 rounded-full mr-0 sm:mr-8 mb-4 sm:mb-0 ${isOwnProfile ? 'cursor-pointer hover:opacity-80' : ''}`}
              onClick={handleProfilePicClick}
            />
            <div className="flex-1 w-full text-center sm:text-left">
              <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
                <h1 className="text-3xl font-bold">{profileUser.username}</h1>
                
                {currentUser && !isOwnProfile && (
                  <div className="flex space-x-2 mt-4 sm:mt-0">
                    {isFollowing ? (
                      <button
                        onClick={handleUnfollow}
                        className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-md hover:bg-gray-300"
                      >
                        Unfollow
                      </button>
                    ) : (
                      <button
                        onClick={handleFollow}
                        className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700"
                      >
                        Follow
                      </button>
                    )}
                    <button
                      onClick={handleStartMessage}
                      className="bg-gray-800 text-white font-semibold py-2 px-4 rounded-md hover:bg-gray-900"
                    >
                      Message
                    </button>
                  </div>
                )}
                
                {currentUser && isOwnProfile && (
                  // 6. MAKE BUTTON OPEN MODAL
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-md hover:bg-gray-300 mt-4 sm:mt-0"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
              
              <div className="flex justify-center sm:justify-start space-x-6 mb-4">
                <div className="text-center">
                  {/* 7. MAKE POST COUNT DYNAMIC */}
                  <span className="font-bold text-lg">{posts.length}</span>
                  <span className="text-gray-500"> Posts</span>
                </div>
                <div className="text-center">
                  <span className="font-bold text-lg">{profileUser.followersCount}</span>
                  <span className="text-gray-500"> Followers</span>
                </div>
                <div className="text-center">
                  <span className="font-bold text-lg">{profileUser.followingCount}</span>
                  <span className="text-gray-500"> Following</span>
                </div>
              </div>
              
              <p className="text-gray-700">{profileUser.bio || "No bio yet."}</p>
            </div>
          </div>
        </div>

        {/* 8. RENDER THE POSTS GRID */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4 text-center">Posts</h2>
          {posts.length > 0 ? (
            <div className="grid grid-cols-3 gap-1">
              {posts.map(post => (
                <Link key={post._id} to={`/post/${post._id}`} className="relative aspect-square">
                  {post.mediaUrl ? (
                    <img 
                      src={post.mediaUrl} 
                      alt="Post" 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center p-2">
                      <p className="text-xs text-gray-500 text-center overflow-hidden">
                        {post.content.substring(0, 50)}...
                      </p>
                    </div>
                  )}
                  {/* You could add a "hover" overlay here if you want */}
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 mt-10">
              <p>No posts yet.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}