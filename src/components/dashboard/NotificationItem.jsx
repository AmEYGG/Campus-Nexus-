import React from 'react';
import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';

const NotificationItem = ({ id, message, timestamp, isRead, link }) => {
  return (
    <Link to={link} className="block">
      <div className={`p-3 hover:bg-gray-50 rounded-lg transition-colors ${!isRead ? 'bg-blue-50' : ''}`}>
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-0.5">
            <Bell className={`h-5 w-5 ${!isRead ? 'text-blue-500' : 'text-gray-400'}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm ${!isRead ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
              {message}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {timestamp}
            </p>
          </div>
          {!isRead && (
            <div className="flex-shrink-0">
              <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default NotificationItem; 