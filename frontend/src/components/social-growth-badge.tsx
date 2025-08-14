'use client';

import { cn, formatPercentage } from '@/lib/utils';
import { Instagram, Youtube } from 'lucide-react';

// Custom TikTok icon as Lucide doesn't have one
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

interface SocialGrowthBadgeProps {
  tiktok?: number;
  instagram?: number;
  youtube?: number;
  compact?: boolean;
}

export function SocialGrowthBadge({ tiktok = 0, instagram = 0, youtube = 0, compact = false }: SocialGrowthBadgeProps) {
  const hasData = tiktok !== 0 || instagram !== 0 || youtube !== 0;
  
  if (!hasData && compact) return null;

  const getColor = (value: number) => {
    if (value > 0.05) return 'text-green-600';
    if (value > 0) return 'text-green-500';
    if (value < -0.05) return 'text-red-600';
    if (value < 0) return 'text-red-500';
    return 'text-gray-400';
  };

  if (compact) {
    // Compact view for table cells
    return (
      <div className="flex items-center gap-2 text-xs">
        {instagram !== 0 && (
          <div className={cn('flex items-center gap-0.5', getColor(instagram))}>
            <Instagram className="w-3 h-3" />
            <span>{formatPercentage(instagram)}</span>
          </div>
        )}
        {tiktok !== 0 && (
          <div className={cn('flex items-center gap-0.5', getColor(tiktok))}>
            <TikTokIcon className="w-3 h-3" />
            <span>{formatPercentage(tiktok)}</span>
          </div>
        )}
        {youtube !== 0 && (
          <div className={cn('flex items-center gap-0.5', getColor(youtube))}>
            <Youtube className="w-3 h-3" />
            <span>{formatPercentage(youtube)}</span>
          </div>
        )}
      </div>
    );
  }

  // Full view for detail pages
  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-1">
          <Instagram className="w-4 h-4 text-purple-600" />
          <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Instagram</span>
        </div>
        <div className={cn('text-lg font-semibold', getColor(instagram))}>
          {instagram !== 0 ? formatPercentage(instagram) : 'N/A'}
        </div>
      </div>
      
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-1">
          <TikTokIcon className="w-4 h-4 text-black dark:text-white" />
          <span className="text-xs font-medium text-gray-600 dark:text-gray-300">TikTok</span>
        </div>
        <div className={cn('text-lg font-semibold', getColor(tiktok))}>
          {tiktok !== 0 ? formatPercentage(tiktok) : 'N/A'}
        </div>
      </div>
      
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-1">
          <Youtube className="w-4 h-4 text-red-600" />
          <span className="text-xs font-medium text-gray-600 dark:text-gray-300">YouTube</span>
        </div>
        <div className={cn('text-lg font-semibold', getColor(youtube))}>
          {youtube !== 0 ? formatPercentage(youtube) : 'N/A'}
        </div>
      </div>
    </div>
  );
}