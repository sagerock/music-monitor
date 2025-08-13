'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { followApi } from '@/lib/api';
import { ClickableUsername } from '@/components/clickable-username';
import { FollowButton } from '@/components/follow-button';
import { UserCheck, Loader2, X } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';

interface FollowingListProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface User {
  id: string;
  name: string | null;
  email: string;
  avatarUrl: string | null;
  bio: string | null;
}

export function FollowingList({ userId, isOpen, onClose }: FollowingListProps) {
  const { user } = useAuth();
  const [page, setPage] = useState(1);

  const { data: followingData, isLoading } = useQuery({
    queryKey: ['following', userId, page],
    queryFn: () => followApi.getFollowing(userId, page),
    enabled: isOpen,
  });

  const following = followingData?.data || [];
  const pagination = followingData?.pagination;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Following</h2>
            {pagination && (
              <span className="text-sm text-gray-500">({pagination.total})</span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-spotify-green" />
          </div>
        )}

        {/* Following List */}
        {!isLoading && (
          <>
            {following.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <UserCheck className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Not following anyone yet</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-3">
                {following.map((followingUser: User) => (
                  <div key={followingUser.id} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                        {followingUser.avatarUrl ? (
                          <img
                            src={followingUser.avatarUrl}
                            alt={followingUser.name || 'Avatar'}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-medium">
                            {(followingUser.name || followingUser.email)[0].toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <ClickableUsername 
                          user={followingUser} 
                          className="font-medium text-sm"
                        />
                        {followingUser.bio && (
                          <p className="text-xs text-gray-500 truncate mt-1">
                            {followingUser.bio}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Follow Button */}
                    {user && user.id !== followingUser.id && (
                      <FollowButton 
                        userId={followingUser.id} 
                        size="sm" 
                        variant="outline"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm">
                  {page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
                  disabled={page === pagination.totalPages}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}