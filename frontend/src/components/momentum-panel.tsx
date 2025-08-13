'use client';

import { TrendingUp, TrendingDown, Users, Music2, Hash } from 'lucide-react';
import { cn, formatPercentage, getMomentumColor } from '@/lib/utils';
import { MomentumData } from '@/lib/api';

interface MomentumPanelProps {
  momentum: MomentumData;
}

export function MomentumPanel({ momentum }: MomentumPanelProps) {
  const momentumColor = getMomentumColor(momentum.momentumScore);
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4">Momentum Analysis</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Momentum Score</span>
            {momentum.momentumScore > 0 ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
          </div>
          <div className={cn(
            'text-2xl font-bold',
            momentum.momentumScore > 0 ? 'text-green-600' : 'text-red-600'
          )}>
            {momentum.momentumScore.toFixed(2)}
          </div>
          <div className={cn(
            'text-xs mt-1',
            `momentum-${momentumColor}`
          )}>
            {momentumColor === 'up' ? 'Rising Fast' : momentumColor === 'down' ? 'Declining' : 'Stable'}
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Popularity Change</span>
            <Music2 className="w-4 h-4 text-gray-400" />
          </div>
          <div className={cn(
            'text-2xl font-bold',
            momentum.deltaPopularity > 0 ? 'text-green-600' : momentum.deltaPopularity < 0 ? 'text-red-600' : 'text-gray-600'
          )}>
            {momentum.deltaPopularity > 0 ? '+' : ''}{momentum.deltaPopularity}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            points
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Follower Growth</span>
            <Users className="w-4 h-4 text-gray-400" />
          </div>
          <div className={cn(
            'text-2xl font-bold',
            momentum.deltaFollowersPct > 0 ? 'text-green-600' : momentum.deltaFollowersPct < 0 ? 'text-red-600' : 'text-gray-600'
          )}>
            {formatPercentage(momentum.deltaFollowersPct)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            change
          </div>
        </div>
        
        {momentum.deltaTiktokPct !== 0 && (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">TikTok Growth</span>
              <Hash className="w-4 h-4 text-gray-400" />
            </div>
            <div className={cn(
              'text-2xl font-bold',
              momentum.deltaTiktokPct > 0 ? 'text-green-600' : momentum.deltaTiktokPct < 0 ? 'text-red-600' : 'text-gray-600'
            )}>
              {formatPercentage(momentum.deltaTiktokPct)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              mentions
            </div>
          </div>
        )}
      </div>
    </div>
  );
}