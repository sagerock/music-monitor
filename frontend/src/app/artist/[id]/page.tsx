'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { artistsApi } from '@/lib/api';
import { Header } from '@/components/header';
import { ArtistHero } from '@/components/artist-hero';
import { MomentumPanel } from '@/components/momentum-panel';
import { AudioProfile } from '@/components/audio-profile';
import { TrendsChart } from '@/components/trends-chart';
import { TracksList } from '@/components/tracks-list';
import { WatchlistButton } from '@/components/watchlist-button';
import { AlertButton } from '@/components/alert-button';
import { SocialLinksPanel } from '@/components/social-links-panel';
import { RatingPanel } from '@/components/rating-panel';
import { CommentsPanel } from '@/components/comments-panel';
import { Loader2 } from 'lucide-react';

export default function ArtistPage() {
  const params = useParams();
  const artistId = params.id as string;

  const { data, isLoading, error } = useQuery({
    queryKey: ['artist', artistId],
    queryFn: () => artistsApi.getArtist(artistId),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 animate-spin text-spotify-green" />
        </div>
      </div>
    );
  }

  if (error || !data?.data) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="text-center py-32">
          <p className="text-red-600">Failed to load artist. Please try again.</p>
        </div>
      </div>
    );
  }

  const artist = data.data;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <ArtistHero artist={artist} />
        
        <div className="flex gap-4 mb-8">
          <WatchlistButton artistId={artist.id} />
          <AlertButton artistId={artist.id} />
        </div>

        {artist.momentum && (
          <div className="mb-8">
            <MomentumPanel momentum={artist.momentum} />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {artist.snapshots.length > 0 && (
            <TrendsChart snapshots={artist.snapshots} />
          )}
          
          {artist.audioProfile && (
            <AudioProfile profile={artist.audioProfile} />
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <SocialLinksPanel artistId={artist.id} artistName={artist.name} />
          <RatingPanel artistId={artist.id} artistName={artist.name} />
        </div>

        <div className="mb-8">
          <CommentsPanel artistId={artist.id} artistName={artist.name} />
        </div>

        {artist.tracks.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Recent Tracks</h2>
            <TracksList tracks={artist.tracks} />
          </div>
        )}
      </main>
    </div>
  );
}