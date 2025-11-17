'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { artistsApi } from '@/lib/api';
import { LeaderboardTable } from '@/components/leaderboard-table';
import { GenreSelector } from '@/components/genre-selector';
import { TimeWindowSelector } from '@/components/time-window-selector';
import { CommunityActivityFeed } from '@/components/community-activity';
import { Header } from '@/components/header';
import { Loader2, TrendingUp, Users } from 'lucide-react';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'community'>('leaderboard');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [timeWindow, setTimeWindow] = useState<number>(14);

  const { data, isLoading, error } = useQuery({
    queryKey: ['leaderboard', selectedGenres, timeWindow],
    queryFn: () => artistsApi.getLeaderboard(selectedGenres, timeWindow),
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">
            {activeTab === 'leaderboard' ? 'Rising Artists Leaderboard' : 'Community Activity'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {activeTab === 'leaderboard'
              ? 'Track emerging talent with real-time momentum scoring • Built for A&R students discovering the next big artists'
              : 'See what other music industry students are discovering, rating, and watching right now'
            }
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                activeTab === 'leaderboard'
                  ? 'border-spotify-green text-spotify-green'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Leaderboard
            </button>
            <button
              onClick={() => setActiveTab('community')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                activeTab === 'community'
                  ? 'border-spotify-green text-spotify-green'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <Users className="w-4 h-4" />
              Community
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'leaderboard' ? (
          <>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <GenreSelector
                selectedGenres={selectedGenres}
                onGenresChange={setSelectedGenres}
              />
              <TimeWindowSelector
                value={timeWindow}
                onChange={setTimeWindow}
              />
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-spotify-green" />
              </div>
            ) : error ? (
              <div className="text-center py-16">
                <p className="text-red-600">Failed to load leaderboard. Please try again.</p>
              </div>
            ) : data?.data ? (
              <LeaderboardTable artists={data.data} />
            ) : (
              <div className="text-center py-16">
                <p className="text-gray-600 dark:text-gray-400">No artists found</p>
              </div>
            )}
          </>
        ) : (
          <CommunityActivityFeed />
        )}
      </main>
    </div>
  );
}