import React, { useEffect, useRef } from 'react';
import { useMarketData } from '@/hooks/useMarketData';

interface VolumeData {
  timestamp: number;
  volume: number;
}

export function VolumeChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { volume, isLoading, error } = useMarketData();
  const [data, setData] = React.useState<VolumeData[]>([]);

  useEffect(() => {
    // TODO: Fetch historical volume data
    const mockData = Array.from({ length: 100 }, (_, i) => ({
      timestamp: Date.now() - (100 - i) * 60000,
      volume: Math.random() * 1000000,
    }));

    setData(mockData);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const padding = 40;

    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, width, height);

    // Calculate volume range
    const maxVolume = Math.max(...data.map(d => d.volume));
    const minTimestamp = Math.min(...data.map(d => d.timestamp));
    const maxTimestamp = Math.max(...data.map(d => d.timestamp));
    const timeRange = maxTimestamp - minTimestamp;

    // Draw grid
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = padding + (height - 2 * padding) * (1 - i / 5);
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Draw volume bars
    const barWidth = (width - 2 * padding) / data.length;
    data.forEach((d, i) => {
      const x = padding + i * barWidth;
      const barHeight = (d.volume / maxVolume) * (height - 2 * padding);
      const y = height - padding - barHeight;

      ctx.fillStyle = '#44ff44';
      ctx.fillRect(x, y, barWidth - 1, barHeight);
    });

    // Draw volume labels
    ctx.fillStyle = '#fff';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const volume = (maxVolume * i) / 5;
      const y = padding + (height - 2 * padding) * (1 - i / 5);
      ctx.fillText(volume.toLocaleString(), padding - 5, y);
    }
  }, [data]);

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-64 flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={800}
        height={300}
        className="w-full h-64 bg-gray-900 rounded-lg"
      />
    </div>
  );
} 