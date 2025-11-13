import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notifications');
        setNotifications(res.data);
      } catch (err) {
        console.error('Failed to fetch notifications', err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const getNotificationText = (noti) => {
    switch (noti.type) {
      case 'like':
        return (
          <>
            <span className="font-semibold">{noti.sender.username}</span> liked your post.
          </>
        );
      case 'comment':
        return (
          <>
            <span className="font-semibold">{noti.sender.username}</span> commented on your post.
          </>
        );
      case 'follow':
        return (
          <>
            <span className="font-semibold">{noti.sender.username}</span> started following you.
          </>
        );
      default:
        return 'You have a new notification.';
    }
  };

  const getNotificationLink = (noti) => {
    if (noti.type === 'follow') {
      return `/profile/${noti.sender.username}`;
    }
    return `/post/${noti.post?._id || noti.post}`;
  };

  if (loading) {
    return <div className="text-center text-gray-500">Loading notifications...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Notifications</h1>
      {notifications.length === 0 ? (
        <p className="text-gray-500">You have no notifications.</p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {notifications.map((noti) => (
            <li
              key={noti._id}
              className={`py-4 ${!noti.read ? 'bg-blue-50' : ''}`}
            >
              <Link to={getNotificationLink(noti)} className="flex items-center space-x-4">
                <img
                  src={noti.sender.profilePicture || `https://placehold.co/40x40/E2E8F0/718096?text=${noti.sender.username[0]}`}
                  alt={noti.sender.username}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1">
                  <p className="text-sm">{getNotificationText(noti)}</p>
                  <p className="text-xs text-blue-500">
                    {formatDistanceToNow(new Date(noti.createdAt))} ago
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}