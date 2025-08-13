'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { artistsApi } from '@/lib/api';
import { LeaderboardTable } from '@/components/leaderboard-table';
import { GenreSelector } from '@/components/genre-selector';
import { TimeWindowSelector } from '@/components/time-window-selector';
import { Header } from '@/components/header';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
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
          <h1 className="text-3xl font-bold mb-2">Rising Artists Leaderboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Discover fast-rising artists based on momentum scores • Filter by genre to refine results
          </p>
        </div>

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
      </main>
    </div>
  );
}