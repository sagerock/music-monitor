'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { Snapshot } from '@/lib/api';

interface TrendsChartProps {
  snapshots: Snapshot[];
}

export function TrendsChart({ snapshots }: TrendsChartProps) {
  const data = snapshots.map(snapshot => ({
    date: format(new Date(snapshot.snapshotDate), 'MMM d'),
    popularity: snapshot.popularity || 0,
    followers: Number(snapshot.followers || 0),
  }));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4">Trends Over Time</h2>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis 
              dataKey="date" 
              stroke="#9CA3AF"
              fontSize={12}
            />
            <YAxis 
              yAxisId="left"
              stroke="#9CA3AF"
              fontSize={12}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              stroke="#9CA3AF"
              fontSize={12}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#1F2937',
                border: 'none',
                borderRadius: '8px',
              }}
              labelStyle={{ color: '#9CA3AF' }}
            />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="popularity"
              stroke="#1DB954"
              strokeWidth={2}
              dot={{ fill: '#1DB954', r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="followers"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={{ fill: '#3B82F6', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}