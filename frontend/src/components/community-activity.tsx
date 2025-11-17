'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { activityApi, CommunityActivity } from '@/lib/api';
import { ClickableUsername } from '@/components/clickable-username';
import { MessageCircle, Star, Eye, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

export function CommunityActivityFeed() {
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, error } = useQuery({
    queryKey: ['community-activity', page],
    queryFn: () => activityApi.getGlobalActivity(page, limit),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-spotify-green" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-red-600 dark:text-red-400">Failed to load community activity</p>
      </div>
    );
  }

  const activities = data?.data || [];
  const hasMore = data?.pagination?.hasMore || false;

  if (activities.length === 0) {
    return (
      <div className="text-center py-16">
        <MessageCircle className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          No activity yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Be the first to comment, rate, or add an artist to your watchlist!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity: CommunityActivity) => (
        <ActivityItem key={`${activity.type}-${activity.id}`} activity={activity} />
      ))}

      {hasMore && (
        <div className="text-center pt-4">
          <button
            onClick={() => setPage(page + 1)}
            className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
}

function ActivityItem({ activity }: { activity: CommunityActivity }) {
  const getIcon = () => {
    switch (activity.type) {
      case 'comment':
        return <MessageCircle className="w-4 h-4 text-blue-500" />;
      case 'rating':
        return <Star className="w-4 h-4 text-yellow-500" />;
      case 'watchlist':
        return <Eye className="w-4 h-4 text-spotify-green" />;
    }
  };

  const getActionText = () => {
    switch (activity.type) {
      case 'comment':
        return 'commented on';
      case 'rating':
        return 'rated';
      case 'watchlist':
        return 'is watching';
    }
  };

  const getRatingStars = (rating: number) => {
    return '⭐'.repeat(rating);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:border-spotify-green dark:hover:border-spotify-green transition-colors">
      <div className="flex items-start gap-3">
        {/* Artist Thumbnail */}
        <Link href={`/artist/${activity.artistId}`} className="flex-shrink-0">
          {activity.artist.imageUrl ? (
            <img
              src={activity.artist.imageUrl}
              alt={activity.artist.name}
              className="w-12 h-12 rounded object-cover"
            />
          ) : (
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
              <span className="text-xl">🎵</span>
            </div>
          )}
        </Link>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {getIcon()}
            <ClickableUsername
              user={activity.user}
              className="font-medium text-gray-900 dark:text-gray-100"
            />
            <span className="text-gray-600 dark:text-gray-400">{getActionText()}</span>
            <Link
              href={`/artist/${activity.artistId}`}
              className="font-medium text-spotify-green hover:underline"
            >
              {activity.artist.name}
            </Link>
          </div>

          {/* Activity-specific content */}
          {activity.type === 'comment' && activity.content && (
            <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 mb-1">
              {activity.content}
            </p>
          )}

          {activity.type === 'rating' && (
            <div className="mb-1">
              <span className="text-sm">{getRatingStars(activity.rating || 0)}</span>
              {activity.review && (
                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 mt-1">
                  {activity.review}
                </p>
              )}
            </div>
          )}

          {/* Timestamp */}
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
          </p>
        </div>
      </div>
    </div>
  );
}
