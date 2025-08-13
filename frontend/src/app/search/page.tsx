'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Header } from '@/components/header';
import { useAuth } from '@/components/auth-provider';
import { Search, Loader2, Plus, Check, Music, Users, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { formatNumber } from '@/lib/utils';
import Link from 'next/link';
import { useDebounce } from '@/hooks/use-debounce';
import { supabase } from '@/lib/supabase';

interface SpotifyArtist {
  id: string;
  name: string;
  genres: string[];
  popularity: number;
  followers: number;
  images: { url: string; height: number; width: number }[];
  spotifyUrl: string;
  isTracked: boolean;
}

export default function SearchPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 500);
  
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

  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery) return null;
      const { data } = await api.get(`/api/search/artists?q=${encodeURIComponent(debouncedQuery)}`);
      return data;
    },
    enabled: debouncedQuery.length > 0,
  });

  const addArtistMutation = useMutation({
    mutationFn: async (spotifyId: string) => {
      const { data } = await api.post('/api/search/artists/add', { spotifyId });
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Artist added successfully!');
      queryClient.invalidateQueries(['search']);
      queryClient.invalidateQueries(['watchlist']);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to add artist');
    },
  });

  const handleAddArtist = (spotifyId: string) => {
    if (!user) {
      toast.info('Please sign in to add artists');
      return;
    }
    addArtistMutation.mutate(spotifyId);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">Add Artists</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Search for artists on Spotify and add them to your tracking list
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for an artist..."
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-spotify-green focus:border-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 animate-spin text-spotify-green" />
            )}
          </div>
        </div>

        {/* Search Results */}
        {searchResults?.data && searchResults.data.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResults.data.map((artist: SpotifyArtist) => (
              <div
                key={artist.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                {/* Artist Image */}
                <div className="aspect-square relative bg-gray-100 dark:bg-gray-700">
                  {artist.images[0] ? (
                    <img
                      src={artist.images[0].url}
                      alt={artist.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Music className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                  {artist.isTracked && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Tracked
                    </div>
                  )}
                </div>

                {/* Artist Info */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-1 text-gray-900 dark:text-gray-100">{artist.name}</h3>
                  
                  {artist.genres.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {artist.genres.slice(0, 3).map((genre) => (
                        <span
                          key={genre}
                          className="inline-flex px-2 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-full"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="space-y-1 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Popularity</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{artist.popularity}/100</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Followers</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {formatNumber(artist.followers)}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {artist.isTracked ? (
                      <Link
                        href={`/artist/${artist.id}`}
                        className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-center"
                      >
                        View Details
                      </Link>
                    ) : (
                      <button
                        onClick={() => handleAddArtist(artist.id)}
                        disabled={addArtistMutation.isLoading}
                        className="flex-1 px-4 py-2 bg-spotify-green text-white font-medium rounded-lg hover:bg-spotify-green/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {addArtistMutation.isLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Plus className="w-4 h-4" />
                            Add Artist
                          </>
                        )}
                      </button>
                    )}
                    <a
                      href={artist.spotifyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {searchQuery && !isSearching && searchResults?.data?.length === 0 && (
          <div className="text-center py-16">
            <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">No artists found</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Try searching with a different name
            </p>
          </div>
        )}

        {/* Initial State */}
        {!searchQuery && (
          <div className="text-center py-16">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">Search for artists</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Start typing to search for artists on Spotify
            </p>
          </div>
        )}
      </main>
    </div>
  );
}