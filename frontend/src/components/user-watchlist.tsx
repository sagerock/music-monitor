'use client';

import { useQuery } from '@tanstack/react-query';
import { profileApi } from '@/lib/api';
import { Music, Users } from 'lucide-react';
import Link from 'next/link';

interface UserWatchlistProps {
  userId: string;
}

export function UserWatchlist({ userId }: UserWatchlistProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['user-watchlist', userId],
    queryFn: () => profileApi.getUserWatchlist(userId),
  });

  if (isLoading) {
    return (
      <div className="text-center py-8 text-gray-500">
        Loading watchlist...
      </div>
    );
  }

  const artists = data?.data || [];

  if (artists.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
        <Music className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">No artists in watchlist yet</p>
        <p className="text-sm text-gray-400 mt-2">
          Start following artists to track their growth!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {artists.map((artist) => (
        <Link
          key={artist.id}
          href={`/artist/${artist.id}`}
          className="bg-white dark:bg-gray-800 rounded-lg p-4 hover:shadow-md transition-all hover:-translate-y-1"
        >
          <div className="flex items-start gap-3">
            {artist.imageUrl ? (
              <img
                src={artist.imageUrl}
                alt={artist.name}
                className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{artist.name}</h3>
              {artist.genres.length > 0 && (
                <p className="text-xs text-gray-500 truncate">
                  {artist.genres.slice(0, 2).join(', ')}
                </p>
              )}
              <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                {artist.followers && (
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span>{(artist.followers / 1000).toFixed(0)}K</span>
                  </div>
                )}
                {artist.popularity && (
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-spotify-green rounded-full" />
                    <span>{artist.popularity}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}