'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi, type Notification } from '@/lib/api';
import { Header } from '@/components/header';
import { Bell, Check, Trash2, Music, MessageCircle, Star, CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/auth-provider';
import Link from 'next/link';
import { toast } from 'sonner';

export default function NotificationsPage() {
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications-page', showUnreadOnly],
    queryFn: () => notificationsApi.getNotifications(1, 50, showUnreadOnly),
    enabled: !!user,
  });

  const markAsReadMutation = useMutation({
    mutationFn: (notificationIds: string[]) => 
      notificationsApi.markAsRead(notificationIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-page'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
      setSelectedNotifications(new Set());
      toast.success('Notifications marked as read');
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationsApi.markAsRead(undefined, true),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-page'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
      toast.success('All notifications marked as read');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: notificationsApi.deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-page'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
      toast.success('Notification deleted');
    },
  });

  const deleteSelectedMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(ids.map(id => notificationsApi.deleteNotification(id)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-page'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
      setSelectedNotifications(new Set());
      toast.success('Selected notifications deleted');
    },
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'momentum_threshold':
        return <Music className="w-5 h-5 text-purple-500" />;
      case 'artist_comment':
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case 'artist_rating':
        return <Star className="w-5 h-5 text-yellow-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNotificationLink = (notification: Notification): string | null => {
    if (notification.data?.artistId) {
      return `/artist/${notification.data.artistId}`;
    }
    return null;
  };

  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedNotifications);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedNotifications(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedNotifications.size === notifications.length) {
      setSelectedNotifications(new Set());
    } else {
      setSelectedNotifications(new Set(notifications.map((n: Notification) => n.id)));
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-gray-600 dark:text-gray-400">Please log in to view notifications</p>
        </div>
      </div>
    );
  }

  const notifications = data?.data?.notifications || [];
  const unreadCount = data?.data?.unreadCount || 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Notifications</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Stay updated on your favorite artists
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showUnreadOnly}
                  onChange={(e) => setShowUnreadOnly(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Unread only</span>
              </label>
              
              {unreadCount > 0 && (
                <span className="text-sm text-gray-500">
                  {unreadCount} unread
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {selectedNotifications.size > 0 && (
                <>
                  <button
                    onClick={() => markAsReadMutation.mutate(Array.from(selectedNotifications))}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                  >
                    Mark selected as read
                  </button>
                  <button
                    onClick={() => deleteSelectedMutation.mutate(Array.from(selectedNotifications))}
                    className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                  >
                    Delete selected
                  </button>
                </>
              )}
              
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllAsReadMutation.mutate()}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Mark all as read
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-16 text-center">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {showUnreadOnly ? 'No unread notifications' : 'No notifications yet'}
              </p>
            </div>
          ) : (
            <>
              {/* Select All */}
              {notifications.length > 0 && (
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedNotifications.size === notifications.length}
                      onChange={toggleSelectAll}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-600">Select all</span>
                  </label>
                </div>
              )}

              {/* Notifications */}
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {notifications.map((notification: Notification) => {
                  const link = getNotificationLink(notification);
                  
                  return (
                    <div
                      key={notification.id}
                      className={cn(
                        'flex items-start gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors',
                        !notification.read && 'bg-blue-50/50 dark:bg-blue-900/20'
                      )}
                    >
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={selectedNotifications.has(notification.id)}
                        onChange={() => toggleSelection(notification.id)}
                        className="mt-1 rounded"
                      />

                      {/* Icon */}
                      <div className="mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {link ? (
                          <Link href={link} className="block group">
                            <h3 className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-spotify-green">
                              {notification.title}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {notification.message}
                            </p>
                          </Link>
                        ) : (
                          <>
                            <h3 className="font-medium text-gray-900 dark:text-gray-100">
                              {notification.title}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {notification.message}
                            </p>
                          </>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        {!notification.read && (
                          <button
                            onClick={() => markAsReadMutation.mutate([notification.id])}
                            className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                            title="Mark as read"
                          >
                            <CheckCircle className="w-4 h-4 text-gray-500" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteMutation.mutate(notification.id)}
                          className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}