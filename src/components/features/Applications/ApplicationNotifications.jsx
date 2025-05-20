import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { calculatePriority } from './ApplicationPriority';

const ApplicationNotifications = ({ applications }) => {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    // Check for priority escalations and status changes
    const checkUpdates = () => {
      const newNotifications = [];

      applications.forEach(application => {
        const currentPriority = calculatePriority(application);
        
        // Check if priority has escalated
        if (currentPriority !== application.priority) {
          newNotifications.push({
            id: `${application.id}-${Date.now()}`,
            type: 'priority',
            title: 'Priority Escalated',
            message: `Application "${application.title}" has been escalated to ${currentPriority} priority`,
            timestamp: new Date(),
            application: application
          });
        }

        // Check for recent status changes
        if (application.statusUpdateTime && 
            new Date() - new Date(application.statusUpdateTime) < 24 * 60 * 60 * 1000) {
          newNotifications.push({
            id: `${application.id}-status-${Date.now()}`,
            type: 'status',
            title: 'Status Updated',
            message: `Application "${application.title}" status changed to ${application.status}`,
            timestamp: new Date(application.statusUpdateTime),
            application: application
          });
        }
      });

      setNotifications(prev => [...newNotifications, ...prev].slice(0, 10)); // Keep last 10 notifications
    };

    checkUpdates();
    const interval = setInterval(checkUpdates, 5 * 60 * 1000); // Check every 5 minutes

    return () => clearInterval(interval);
  }, [applications]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'priority':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'status':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Clock className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
        onClick={() => setShowNotifications(!showNotifications)}
      >
        <Bell className="h-6 w-6" />
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {notifications.length}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg z-50"
          >
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No new notifications
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="p-4 hover:bg-gray-50"
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="ml-3 flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </p>
                          <p className="mt-1 text-sm text-gray-500">
                            {notification.message}
                          </p>
                          <p className="mt-1 text-xs text-gray-400">
                            {new Date(notification.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {notifications.length > 0 && (
              <div className="p-4 border-t border-gray-200">
                <button
                  onClick={() => setNotifications([])}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear all notifications
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ApplicationNotifications; 