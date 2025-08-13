'use client';

import { useQuery } from '@tanstack/react-query';
import { watchlistApi } from '@/lib/api';
import { Header } from '@/components/header';
import Link from 'next/link';
import { formatNumber, getMomentumColor, getMomentumIcon } from '@/lib/utils';
import { Loader2, Star, TrendingUp, TrendingDown, Minus, LogIn } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/auth-provider';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function WatchlistPage() {
  const { user, loading: authLoading } = useAuth();
  const isLoggedIn = !!user;

  useEffect(() => {
    // Set the Supabase token in localStorage for API calls
    const getToken = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        localStorage.setItem('auth_token', session.access_token);
      }
    };
    if (user) getToken();
  }, [user]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['watchlist'],
    queryFn: watchlistApi.getWatchlist,
    enabled: isLoggedIn,
    retry: false,
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Watchlist</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your favorite artists and their momentum
          </p>
        </div>

        {authLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-spotify-green" />
          </div>
        ) : !isLoggedIn ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
              <LogIn className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Sign in to use watchlist</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Create an account to save and track your favorite artists
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-spotify-green text-white font-medium rounded-full hover:bg-spotify-green/90 transition-colors"
            >
              Sign In
            </Link>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-spotify-green" />
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-gray-600 dark:text-gray-400">Unable to load watchlist</p>
          </div>
        ) : data?.data && data.data.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.data.map((item: any) => {
              const momentumColor = getMomentumColor(item.momentumChange || 0);
              const MomentumIcon = item.momentumChange > 0.5 ? TrendingUp : item.momentumChange < -0.5 ? TrendingDown : Minus;
              
              return (
                <Link
                  key={item.artist.id}
                  href={`/artist/${item.artist.id}`}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-1">{item.artist.name}</h3>
                      <div className="flex flex-wrap gap-1">
                        {item.artist.genres?.slice(0, 2).map((genre: string) => (
                          <span
                            key={genre}
                            className="inline-flex px-2 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-full"
                          >
                            {genre}
                          </span>
                        ))}
                      </div>
                    </div>
                    <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Popularity</span>
                      <span className="font-medium">{item.artist.popularity || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Followers</span>
                      <span className="font-medium">{formatNumber(item.artist.followers || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Momentum</span>
                      <div className={cn(
                        'inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full',
                        `momentum-${momentumColor}`
                      )}>
                        <MomentumIcon className="w-3 h-3" />
                        {item.momentumChange ? item.momentumChange.toFixed(2) : '0.00'}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
              <Star className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Your watchlist is empty</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Start adding artists from the leaderboard to track their momentum
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 bg-spotify-green text-white font-medium rounded-lg hover:bg-spotify-green/90 transition-colors"
            >
              Browse Artists
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}