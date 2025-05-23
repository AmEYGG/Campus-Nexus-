import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, CheckCircle, XCircle, AlertCircle, MessageSquare, Calendar, User } from 'lucide-react';
import { database } from '../../../config/firebase';
import { ref, onValue, update, query, orderByChild } from 'firebase/database';
import { useAuthContext } from '../../../providers/AuthProvider';
import { format } from 'date-fns';

const NotificationSystem = () => {
  const { user } = useAuthContext();
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    // Listen to system notifications
    const systemNotificationsRef = ref(database, 'systemNotifications');
    const facilityBookingsRef = ref(database, 'facilityBookings');
    
    const unsubscribeSystem = onValue(systemNotificationsRef, (snapshot) => {
      if (!snapshot.exists()) return;
      
      const systemNotifs = [];
      snapshot.forEach((child) => {
        const notification = child.val();
        // Exclude complaint notifications
        if ((notification.userType === user?.userProfile?.role?.toLowerCase() || 
            notification.userId === user.uid) &&
            !notification.type?.toLowerCase().includes('complaint')) {
          systemNotifs.push({
            id: child.key,
            type: 'system',
            ...notification
          });
        }
      });
      
      updateNotifications([...systemNotifs]);
    });

    // Listen to facility booking notifications
    const unsubscribeFacility = onValue(facilityBookingsRef, (snapshot) => {
      if (!snapshot.exists()) return;

      const bookingNotifs = [];
      snapshot.forEach((child) => {
        const booking = child.val();
        if (booking.userId === user.uid && booking.notifications?.student) {
          bookingNotifs.push({
            id: child.key,
            type: 'facility',
            ...booking,
            notification: booking.notifications.student
          });
        }
      });

      updateNotifications([...bookingNotifs]);
    });

    return () => {
      unsubscribeSystem();
      unsubscribeFacility();
    };
  }, [user]);

  const updateNotifications = (newNotifications) => {
    // Sort by date, most recent first
    newNotifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setNotifications(newNotifications);
    
    // Count unread notifications
    const unread = newNotifications.filter(n => 
      (n.type === 'system' && !n.read) || 
      (n.type === 'facility' && !n.notification?.isRead)
    ).length;
    setUnreadCount(unread);
  };

  const markAsRead = async (notification) => {
    try {
      if (notification.type === 'system') {
        const notifRef = ref(database, `systemNotifications/${notification.id}`);
        await update(notifRef, { read: true });
      } else if (notification.type === 'facility') {
        const notifRef = ref(database, `facilityBookings/${notification.id}/notifications/student`);
        await update(notifRef, { isRead: true });
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getNotificationIcon = (notification) => {
    if (notification.type === 'facility') {
      switch (notification.status) {
        case 'approved':
          return <CheckCircle className="w-5 h-5 text-green-600" />;
        case 'rejected':
          return <XCircle className="w-5 h-5 text-red-600" />;
        default:
          return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      }
    } else {
      switch (notification.notificationType) {
        case 'login':
          return <User className="w-5 h-5 text-blue-600" />;
        case 'application':
          return <MessageSquare className="w-5 h-5 text-purple-600" />;
        case 'booking':
          return <Calendar className="w-5 h-5 text-indigo-600" />;
        default:
          return <Bell className="w-5 h-5 text-gray-600" />;
      }
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-500 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg overflow-hidden z-50"
          >
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Notifications</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-full hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No notifications
                </div>
              ) : (
                notifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
                      (notification.type === 'system' && !notification.read) ||
                      (notification.type === 'facility' && !notification.notification?.isRead)
                        ? 'bg-blue-50'
                        : ''
                    }`}
                    onClick={() => markAsRead(notification)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {getNotificationIcon(notification)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {notification.type === 'facility' 
                            ? notification.facilityName 
                            : notification.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          {notification.type === 'facility'
                            ? notification.notification.message
                            : notification.message}
                        </p>
                        <div className="mt-1 text-xs text-gray-400">
                          {format(new Date(notification.createdAt), 'MMM d, yyyy h:mm a')}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationSystem; 