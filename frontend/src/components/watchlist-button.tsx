'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { watchlistApi } from '@/lib/api';
import { Star, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/auth-provider';
import { supabase } from '@/lib/supabase';

interface WatchlistButtonProps {
  artistId: string;
}

export function WatchlistButton({ artistId }: WatchlistButtonProps) {
  const queryClient = useQueryClient();
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const { user } = useAuth();

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

  const { data: watchlistData } = useQuery({
    queryKey: ['watchlist'],
    queryFn: watchlistApi.getWatchlist,
    enabled: !!user, // Only fetch if logged in
    retry: false,
    onSuccess: (data) => {
      if (data?.data) {
        const inList = data.data.some((item: any) => item.artist.id === artistId);
        setIsInWatchlist(inList);
      }
    },
    onError: () => {
      // User not logged in, that's okay
    },
  });

  const addMutation = useMutation({
    mutationFn: () => watchlistApi.addToWatchlist(artistId),
    onSuccess: () => {
      setIsInWatchlist(true);
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
      toast.success('Added to watchlist');
    },
    onError: () => {
      toast.error('Failed to add to watchlist');
    },
  });

  const removeMutation = useMutation({
    mutationFn: () => watchlistApi.removeFromWatchlist(artistId),
    onSuccess: () => {
      setIsInWatchlist(false);
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
      toast.success('Removed from watchlist');
    },
    onError: () => {
      toast.error('Failed to remove from watchlist');
    },
  });

  const handleToggle = () => {
    if (!user) {
      toast.info('Please log in to use watchlist');
      return;
    }
    if (isInWatchlist) {
      removeMutation.mutate();
    } else {
      addMutation.mutate();
    }
  };

  const isLoading = addMutation.isLoading || removeMutation.isLoading;

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={cn(
        'inline-flex items-center gap-2 px-4 py-2 font-medium rounded-lg transition-colors',
        isInWatchlist
          ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
      )}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Star className={cn('w-4 h-4', isInWatchlist && 'fill-current')} />
      )}
      <span>{isInWatchlist ? 'In Watchlist' : 'Add to Watchlist'}</span>
    </button>
  );
}