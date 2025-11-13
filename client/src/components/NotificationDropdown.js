import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationDropdown({ notifications }) {
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
    return `/post/${noti.post}`;
  };

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-20">
      <div className="py-2">
        <h3 className="font-semibold px-4 py-2">Notifications</h3>
        <div className="max-h-64 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="px-4 py-2 text-gray-500">No new notifications.</p>
          ) : (
            notifications.map((noti) => (
              <Link
                key={noti._id}
                to={getNotificationLink(noti)}
                className={`block px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 ${
                  !noti.read ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={noti.sender.profilePicture || `https://placehold.co/40x40/E2E8F0/718096?text=${noti.sender.username[0]}`}
                    alt={noti.sender.username}
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="flex-1">
                    <p>{getNotificationText(noti)}</p>
                    <p className="text-xs text-blue-500">
                      {formatDistanceToNow(new Date(noti.createdAt))} ago
                    </p>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
        <Link
          to="/notifications"
          className="block text-center text-sm font-medium text-blue-600 px-4 py-2 hover:bg-gray-100 border-t"
        >
          View All Notifications
        </Link>
      </div>
    </div>
  );
}