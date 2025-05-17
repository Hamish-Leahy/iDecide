import React, { useState } from 'react';
import { Bell, Check, X, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { Card } from '../common/Card';
import { motion, AnimatePresence } from 'framer-motion';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: Date;
  read: boolean;
  type: 'info' | 'warning' | 'success' | 'error';
}

interface NotificationsWidgetProps {
  className?: string;
}

export function NotificationsWidget({ className = '' }: NotificationsWidgetProps) {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Document Updated',
      message: 'Your will document has been updated successfully.',
      time: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      read: false,
      type: 'success'
    },
    {
      id: '2',
      title: 'Password Expiring',
      message: 'Your password for "Banking Account" will expire in 7 days.',
      time: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      read: false,
      type: 'warning'
    },
    {
      id: '3',
      title: 'New Feature Available',
      message: 'Check out the new digital asset tracking feature.',
      time: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      read: true,
      type: 'info'
    },
    {
      id: '4',
      title: 'Security Alert',
      message: 'Unusual login attempt detected. Please verify your recent activity.',
      time: new Date(Date.now() - 1000 * 60 * 60 * 36), // 1.5 days ago
      read: true,
      type: 'error'
    }
  ]);
  
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({ ...notification, read: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'info':
        return <Info size={16} className="text-blue-500" />;
      case 'warning':
        return <AlertTriangle size={16} className="text-amber-500" />;
      case 'success':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'error':
        return <AlertTriangle size={16} className="text-red-500" />;
      default:
        return <Info size={16} className="text-blue-500" />;
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / (1000 * 60));
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return `${diffDays}d ago`;
    }
  };

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(notification => !notification.read);

  const unreadCount = notifications.filter(notification => !notification.read).length;

  return (
    <Card className={`${className}`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Bell size={18} className="text-red-500" />
            Notifications
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </h3>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setFilter(filter === 'all' ? 'unread' : 'all')}
              className={`text-xs px-2 py-1 rounded ${
                filter === 'unread' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {filter === 'all' ? 'Show Unread' : 'Show All'}
            </button>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-xs text-gray-600 hover:text-gray-800"
              >
                Mark all read
              </button>
            )}
          </div>
        </div>
        
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
          <AnimatePresence>
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map(notification => (
                <motion.div 
                  key={notification.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`p-3 rounded-lg ${
                    notification.read ? 'bg-gray-50' : 'bg-blue-50 border-l-2 border-blue-500'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex gap-2">
                      {getNotificationIcon(notification.type)}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{notification.title}</h4>
                        <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{formatTime(notification.time)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="p-1 text-gray-400 hover:text-blue-500 rounded-full hover:bg-blue-50"
                          title="Mark as read"
                        >
                          <Check size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => removeNotification(notification.id)}
                        className="p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50"
                        title="Remove"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-4 text-sm text-gray-500">
                {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Card>
  );
}