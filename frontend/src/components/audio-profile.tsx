'use client';

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { normalizeAudioFeature } from '@/lib/utils';

interface AudioProfileProps {
  profile: {
    energy: number;
    danceability: number;
    valence: number;
    tempo: number;
    acousticness: number;
    instrumentalness: number;
  };
}

export function AudioProfile({ profile }: AudioProfileProps) {
  const data = [
    {
      feature: 'Energy',
      value: normalizeAudioFeature(profile.energy, 'energy'),
    },
    {
      feature: 'Danceability',
      value: normalizeAudioFeature(profile.danceability, 'danceability'),
    },
    {
      feature: 'Valence',
      value: normalizeAudioFeature(profile.valence, 'valence'),
    },
    {
      feature: 'Tempo',
      value: normalizeAudioFeature(profile.tempo, 'tempo'),
    },
    {
      feature: 'Acousticness',
      value: normalizeAudioFeature(profile.acousticness, 'acousticness'),
    },
    {
      feature: 'Instrumentalness',
      value: normalizeAudioFeature(profile.instrumentalness, 'instrumentalness'),
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4">Audio Profile</h2>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data}>
            <PolarGrid stroke="#374151" />
            <PolarAngleAxis 
              dataKey="feature" 
              stroke="#9CA3AF"
              fontSize={12}
            />
            <PolarRadiusAxis 
              domain={[0, 100]}
              stroke="#9CA3AF"
              fontSize={10}
            />
            <Radar
              name="Audio Features"
              dataKey="value"
              stroke="#1DB954"
              fill="#1DB954"
              fillOpacity={0.3}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="grid grid-cols-2 gap-2 mt-4">
        {Object.entries(profile).map(([key, value]) => (
          <div key={key} className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400 capitalize">{key}:</span>
            <span className="font-medium">
              {key === 'tempo' ? `${value.toFixed(0)} BPM` : value.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}