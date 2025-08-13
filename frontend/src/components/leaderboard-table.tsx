'use client';

import Link from 'next/link';
import { MomentumData } from '@/lib/api';
import { cn, formatNumber, formatPercentage, getMomentumColor, getMomentumIcon } from '@/lib/utils';
import { ExternalLink, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Sparkline } from './sparkline';

interface LeaderboardTableProps {
  artists: MomentumData[];
}

export function LeaderboardTable({ artists }: LeaderboardTableProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Rank
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Artist
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Genres
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Popularity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Followers
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Momentum
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Trend
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
            {artists.map((artist, index) => {
              const momentumColor = getMomentumColor(artist.momentumScore);
              const MomentumIcon = artist.momentumScore > 0.5 ? TrendingUp : artist.momentumScore < -0.5 ? TrendingDown : Minus;
              
              return (
                <tr key={artist.artistId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                    #{index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      href={`/artist/${artist.artistId}`}
                      className="text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-spotify-green"
                    >
                      {artist.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {artist.genres.slice(0, 3).map((genre) => (
                        <span
                          key={genre}
                          className="inline-flex px-2 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-full"
                        >
                          {genre}
                        </span>
                      ))}
                      {artist.genres.length > 3 && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          +{artist.genres.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {artist.currentPopularity}
                      </div>
                      <div className={cn(
                        'text-xs',
                        artist.deltaPopularity > 0 ? 'text-green-600' : artist.deltaPopularity < 0 ? 'text-red-600' : 'text-gray-500'
                      )}>
                        {artist.deltaPopularity > 0 ? '+' : ''}{artist.deltaPopularity}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {formatNumber(artist.currentFollowers)}
                      </div>
                      <div className={cn(
                        'text-xs',
                        artist.deltaFollowersPct > 0 ? 'text-green-600' : artist.deltaFollowersPct < 0 ? 'text-red-600' : 'text-gray-500'
                      )}>
                        {formatPercentage(artist.deltaFollowersPct)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={cn(
                      'inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full',
                      `momentum-${momentumColor}`
                    )}>
                      <MomentumIcon className="w-3 h-3" />
                      {artist.momentumScore.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-20 h-8">
                      <Sparkline data={artist.sparkline} />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      href={`/artist/${artist.artistId}`}
                      className="text-spotify-green hover:text-spotify-green/80 inline-flex items-center gap-1"
                    >
                      <span className="text-sm">View</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}