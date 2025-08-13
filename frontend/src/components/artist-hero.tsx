'use client';

import Image from 'next/image';
import { ExternalLink, Music } from 'lucide-react';
import { formatNumber } from '@/lib/utils';

interface ArtistHeroProps {
  artist: any;
}

export function ArtistHero({ artist }: ArtistHeroProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="flex-shrink-0">
          {artist.imageUrl ? (
            <Image
              src={artist.imageUrl}
              alt={artist.name}
              width={200}
              height={200}
              className="rounded-lg object-cover"
            />
          ) : (
            <div className="w-48 h-48 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <Music className="w-16 h-16 text-gray-400" />
            </div>
          )}
        </div>
        
        <div className="flex-grow">
          <h1 className="text-3xl font-bold mb-2">{artist.name}</h1>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {artist.genres.map((genre: string) => (
              <span
                key={genre}
                className="inline-flex px-3 py-1 text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full"
              >
                {genre}
              </span>
            ))}
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Popularity</p>
              <p className="text-2xl font-bold">{artist.popularity || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Followers</p>
              <p className="text-2xl font-bold">{formatNumber(artist.followers || 0)}</p>
            </div>
            {artist.country && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Country</p>
                <p className="text-2xl font-bold">{artist.country}</p>
              </div>
            )}
          </div>
          
          {artist.spotifyUrl && (
            <a
              href={artist.spotifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-spotify-green text-white font-medium rounded-full hover:bg-spotify-green/90 transition-colors"
            >
              <span>Open in Spotify</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}