'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { artistsApi } from '@/lib/api';
import { Check, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GenreSelectorProps {
  selectedGenres: string[];
  onGenresChange: (genres: string[]) => void;
}

export function GenreSelector({ selectedGenres, onGenresChange }: GenreSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const { data: genresData } = useQuery({
    queryKey: ['genres'],
    queryFn: () => artistsApi.getGenres(30),
  });

  const genres = genresData?.data || [];

  const toggleGenre = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      onGenresChange(selectedGenres.filter(g => g !== genre));
    } else {
      onGenresChange([...selectedGenres, genre]);
    }
  };

  const clearGenres = () => {
    onGenresChange([]);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {selectedGenres.length === 0
            ? 'All genres'
            : `${selectedGenres.length} genre${selectedGenres.length > 1 ? 's' : ''} selected`}
        </span>
        <ChevronDown className={cn('w-4 h-4 transition-transform', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-2 w-80 max-h-96 overflow-auto bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-20">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Filter by Genre</span>
              {selectedGenres.length > 0 && (
                <button
                  onClick={clearGenres}
                  className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  Show all
                </button>
              )}
            </div>
            
            <div className="p-2">
              {genres.map((item: any) => (
                <button
                  key={item.genre}
                  onClick={() => toggleGenre(item.genre)}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors',
                    selectedGenres.includes(item.genre)
                      ? 'bg-spotify-green/10 text-spotify-green'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100'
                  )}
                >
                  <span>{item.genre}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{item.count}</span>
                    {selectedGenres.includes(item.genre) && (
                      <Check className="w-4 h-4" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {selectedGenres.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedGenres.map(genre => (
            <span
              key={genre}
              className="inline-flex items-center gap-1 px-2 py-1 bg-spotify-green/10 text-spotify-green text-xs font-medium rounded-full"
            >
              {genre}
              <button
                onClick={() => toggleGenre(genre)}
                className="hover:bg-spotify-green/20 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}