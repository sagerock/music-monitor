'use client';

import { cn } from '@/lib/utils';

interface TimeWindowSelectorProps {
  value: number;
  onChange: (value: number) => void;
}

export function TimeWindowSelector({ value, onChange }: TimeWindowSelectorProps) {
  const options = [
    { value: 1, label: '24h' },
    { value: 7, label: '7d' },
    { value: 14, label: '14d' },
    { value: 30, label: '30d' },
    { value: 60, label: '60d' },
    { value: 90, label: '90d' },
    { value: 180, label: '180d' },
    { value: 365, label: '1y' },
  ];

  return (
    <div className="inline-flex bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-1">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            'px-4 py-1.5 text-sm font-medium rounded-md transition-colors',
            value === option.value
              ? 'bg-spotify-green text-white'
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}