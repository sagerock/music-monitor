'use client';

interface SparklineProps {
  data: number[];
  color?: string;
}

export function Sparkline({ data, color = '#1DB954' }: SparklineProps) {
  if (!data || data.length === 0) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  
  const width = 80;
  const height = 32;
  const strokeWidth = 2;
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * (height - strokeWidth * 2) - strokeWidth;
    return `${x},${y}`;
  }).join(' ');

  const trend = data[data.length - 1] > data[0];

  return (
    <svg
      width={width}
      height={height}
      className="inline-block"
      viewBox={`0 0 ${width} ${height}`}
    >
      <polyline
        points={points}
        fill="none"
        stroke={trend ? '#10B981' : '#EF4444'}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}