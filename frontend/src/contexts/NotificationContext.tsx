import React, { createContext, useContext, useState, ReactNode } from 'react';

interface NotificationData {
  id: string;
  title: string;
  timestamp: Date;
  isRead: boolean;
}

interface NotificationContextType {
  notifications: NotificationData[];
  addNotification: (title: string) => void;
  markAsRead: (id: string) => void;
  clearNotifications: () => void;
  hasUnreadNotifications: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  const addNotification = (title: string) => {
    const newNotification: NotificationData = {
      id: Date.now().toString(),
      title,
      timestamp: new Date(),
      isRead: false
    };

    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const hasUnreadNotifications = notifications.some(notification => !notification.isRead);

  return (
    <NotificationContext.Provider 
      value={{
        notifications,
        addNotification,
        markAsRead,
        clearNotifications,
        hasUnreadNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
