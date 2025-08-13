import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

export function formatPercentage(value: number): string {
  const formatted = (value * 100).toFixed(1);
  return value > 0 ? `+${formatted}%` : `${formatted}%`;
}

export function getMomentumColor(score: number): 'up' | 'down' | 'neutral' {
  if (score > 0.5) return 'up';
  if (score < -0.5) return 'down';
  return 'neutral';
}

export function getMomentumIcon(score: number): string {
  if (score > 0.5) return '↑';
  if (score < -0.5) return '↓';
  return '→';
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(d);
}

export function getRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}

export function normalizeAudioFeature(value: number, feature: string): number {
  const ranges: Record<string, [number, number]> = {
    tempo: [60, 180],
    loudness: [-60, 0],
    energy: [0, 1],
    danceability: [0, 1],
    valence: [0, 1],
    acousticness: [0, 1],
    instrumentalness: [0, 1],
    speechiness: [0, 1],
  };

  const [min, max] = ranges[feature] || [0, 1];
  return ((value - min) / (max - min)) * 100;
}

export function genreColor(genre: string): string {
  const colors: Record<string, string> = {
    pop: 'bg-pink-500',
    rock: 'bg-red-500',
    'hip hop': 'bg-purple-500',
    electronic: 'bg-blue-500',
    indie: 'bg-indigo-500',
    country: 'bg-yellow-500',
    jazz: 'bg-orange-500',
    classical: 'bg-gray-500',
    metal: 'bg-gray-800',
    folk: 'bg-green-500',
  };

  for (const [key, color] of Object.entries(colors)) {
    if (genre.toLowerCase().includes(key)) {
      return color;
    }
  }

  return 'bg-gray-400';
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}