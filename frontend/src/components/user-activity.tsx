'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { profileApi } from '@/lib/api';
import { MessageCircle, Star, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

interface UserActivityProps {
  userId: string;
}

export function UserActivity({ userId }: UserActivityProps) {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['user-activity', userId, page],
    queryFn: () => profileApi.getUserActivity(userId, page, 20),
  });

  if (isLoading) {
    return (
      <div className="text-center py-8 text-gray-500">
        Loading activity...
      </div>
    );
  }

  const activity = data?.data;
  const pagination = data?.pagination;

  if (!activity || (activity.comments.length === 0 && activity.ratings.length === 0)) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
        <p className="text-gray-500">No activity yet</p>
        <p className="text-sm text-gray-400 mt-2">
          Start exploring artists and sharing your thoughts!
        </p>
      </div>
    );
  }

  // Combine and sort activities by date
  const allActivities = [
    ...activity.comments.map(c => ({ type: 'comment' as const, item: c, date: c.createdAt })),
    ...activity.ratings.map(r => ({ type: 'rating' as const, item: r, date: r.createdAt })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-4">
      {allActivities.map((activity, index) => (
        <div
          key={`${activity.type}-${activity.item.id}-${index}`}
          className="bg-white dark:bg-gray-800 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          {activity.type === 'comment' ? (
            // Comment Activity
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <MessageCircle className="w-5 h-5 text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm text-gray-500">
                    Commented on
                  </span>
                  <Link
                    href={`/artist/${activity.item.artistId}`}
                    className="font-medium hover:text-spotify-green transition-colors"
                  >
                    {activity.item.artist.name}
                  </Link>
                  {activity.item.parent && (
                    <span className="text-xs text-gray-400">
                      (reply to {activity.item.parent.user.name || activity.item.parent.user.email?.split('@')[0] || 'Unknown User'})
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                  {activity.item.content}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatDistanceToNow(new Date(activity.item.createdAt), { addSuffix: true })}
                </p>
              </div>
              <Link
                href={`/artist/${activity.item.artistId}`}
                className="flex-shrink-0"
              >
                {activity.item.artist.imageUrl ? (
                  <img
                    src={activity.item.artist.imageUrl}
                    alt={activity.item.artist.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                )}
              </Link>
            </div>
          ) : (
            // Rating Activity
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm text-gray-500">
                    Rated
                  </span>
                  <Link
                    href={`/artist/${activity.item.artistId}`}
                    className="font-medium hover:text-spotify-green transition-colors"
                  >
                    {activity.item.artist.name}
                  </Link>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < activity.item.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'fill-gray-200 text-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                {activity.item.review && (
                  <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                    {activity.item.review}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {formatDistanceToNow(new Date(activity.item.createdAt), { addSuffix: true })}
                </p>
              </div>
              <Link
                href={`/artist/${activity.item.artistId}`}
                className="flex-shrink-0"
              >
                {activity.item.artist.imageUrl ? (
                  <img
                    src={activity.item.artist.imageUrl}
                    alt={activity.item.artist.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                )}
              </Link>
            </div>
          )}
        </div>
      ))}

      {/* Load More */}
      {pagination && (pagination.commentsTotal > page * 20 || pagination.ratingsTotal > page * 20) && (
        <button
          onClick={() => setPage(p => p + 1)}
          className="w-full py-3 text-center text-spotify-green hover:text-green-600 font-medium transition-colors flex items-center justify-center gap-2"
        >
          Load More Activity
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}