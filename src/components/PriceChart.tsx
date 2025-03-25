import React, { useEffect, useRef, useState } from 'react';
import { useMarketData } from '@/hooks/useMarketData';
import { useTechnicalIndicators } from '@/hooks/useTechnicalIndicators';
import { ChartInteractions } from './ChartInteractions';
import { DataExport } from './DataExport';

interface PriceChartProps {
  timeframe: '1h' | '24h' | '7d';
}

interface ChartData {
  timestamp: number;
  price: number;
  volume: number;
}

export function PriceChart({ timeframe }: PriceChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const kdjCanvasRef = useRef<HTMLCanvasElement>(null);
  const { price, isLoading, error } = useMarketData();
  const [data, setData] = useState<ChartData[]>([]);
  const [selectedIndicators, setSelectedIndicators] = useState<string[]>(['sma', 'rsi']);
  const [showVolume, setShowVolume] = useState(true);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; data: ChartData | null }>({
    x: 0,
    y: 0,
    data: null,
  });
  const [zoom, setZoom] = useState({ start: 0, end: 1 });
  const [pan, setPan] = useState(0);

  const indicators = useTechnicalIndicators(data);

  useEffect(() => {
    // TODO: Fetch historical price data based on timeframe
    const mockData = Array.from({ length: 100 }, (_, i) => ({
      price: 1 + Math.random() * 0.1,
      timestamp: Date.now() - (100 - i) * 60000,
      volume: Math.random() * 1000000,
    }));

    setData(mockData);
  }, [timeframe]);

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

    // Calculate visible data range
    const startIndex = Math.floor(zoom.start * data.length);
    const endIndex = Math.floor(zoom.end * data.length);
    const visibleData = data.slice(startIndex, endIndex);

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

    // Calculate price range
    const minPrice = Math.min(...visibleData.map(d => d.price));
    const maxPrice = Math.max(...visibleData.map(d => d.price));
    const priceRange = maxPrice - minPrice;
    const scaleY = (height - 2 * padding) / priceRange;

    // Draw price line
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;
    ctx.beginPath();
    visibleData.forEach((d, i) => {
      const x = padding + (width - 2 * padding) * (i / (visibleData.length - 1)) + pan;
      const y = height - padding - (d.price - minPrice) * scaleY;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Draw technical indicators
    if (indicators) {
      // Draw SMA
      if (selectedIndicators.includes('sma')) {
        ctx.strokeStyle = '#ff00ff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        visibleData.forEach((_, i) => {
          const x = padding + (width - 2 * padding) * (i / (visibleData.length - 1)) + pan;
          const y = height - padding - (indicators.sma - minPrice) * scaleY;
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });
        ctx.stroke();
      }

      // Draw Bollinger Bands
      if (selectedIndicators.includes('bollinger')) {
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        visibleData.forEach((_, i) => {
          const x = padding + (width - 2 * padding) * (i / (visibleData.length - 1)) + pan;
          const upperY = height - padding - (indicators.upperBand - minPrice) * scaleY;
          const lowerY = height - padding - (indicators.lowerBand - minPrice) * scaleY;
          if (i === 0) {
            ctx.moveTo(x, upperY);
            ctx.lineTo(x, lowerY);
          } else {
            ctx.lineTo(x, upperY);
            ctx.lineTo(x, lowerY);
          }
        });
        ctx.stroke();
      }

      // Draw ATR
      if (selectedIndicators.includes('atr')) {
        ctx.strokeStyle = '#ffff00';
        ctx.lineWidth = 1;
        ctx.beginPath();
        visibleData.forEach((_, i) => {
          const x = padding + (width - 2 * padding) * (i / (visibleData.length - 1)) + pan;
          const y = height - padding - (indicators.atr - minPrice) * scaleY;
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });
        ctx.stroke();
      }
    }

    // Draw price labels
    ctx.fillStyle = '#fff';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const price = minPrice + (priceRange * i) / 5;
      const y = padding + (height - 2 * padding) * (1 - i / 5);
      ctx.fillText(price.toFixed(2), padding - 5, y);
    }

    // Draw tooltip
    if (tooltip.data) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(tooltip.x + 10, tooltip.y + 10, 150, 60);
      ctx.fillStyle = '#fff';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`Price: ${tooltip.data.price.toFixed(2)}`, tooltip.x + 15, tooltip.y + 25);
      ctx.fillText(`Time: ${new Date(tooltip.data.timestamp).toLocaleString()}`, tooltip.x + 15, tooltip.y + 45);
      ctx.fillText(`Volume: ${tooltip.data.volume.toLocaleString()}`, tooltip.x + 15, tooltip.y + 65);
    }

    // Draw indicator legend
    ctx.fillStyle = '#fff';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'left';
    let y = padding;
    if (selectedIndicators.includes('sma')) {
      ctx.fillStyle = '#ff00ff';
      ctx.fillText('SMA', width - 100, y);
      y += 20;
    }
    if (selectedIndicators.includes('bollinger')) {
      ctx.fillStyle = '#00ffff';
      ctx.fillText('Bollinger Bands', width - 100, y);
      y += 20;
    }
    if (selectedIndicators.includes('atr')) {
      ctx.fillStyle = '#ffff00';
      ctx.fillText('ATR', width - 100, y);
    }
  }, [data, indicators, selectedIndicators, zoom, pan, tooltip]);

  // Draw KDJ chart
  useEffect(() => {
    const canvas = kdjCanvasRef.current;
    if (!canvas || !indicators?.kdj || !selectedIndicators.includes('kdj')) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const padding = 20;

    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, width, height);

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

    // Draw KDJ lines
    const { k, d, j } = indicators.kdj;
    const scaleY = (height - 2 * padding) / 100;

    // Draw K line
    ctx.strokeStyle = '#ff00ff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, height - padding - k * scaleY);
    ctx.lineTo(width - padding, height - padding - k * scaleY);
    ctx.stroke();

    // Draw D line
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, height - padding - d * scaleY);
    ctx.lineTo(width - padding, height - padding - d * scaleY);
    ctx.stroke();

    // Draw J line
    ctx.strokeStyle = '#ffff00';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, height - padding - j * scaleY);
    ctx.lineTo(width - padding, height - padding - j * scaleY);
    ctx.stroke();

    // Draw labels
    ctx.fillStyle = '#fff';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const value = (100 * i) / 5;
      const y = padding + (height - 2 * padding) * (1 - i / 5);
      ctx.fillText(value.toString(), padding - 5, y);
    }

    // Draw legend
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ff00ff';
    ctx.fillText('K', width - 100, padding);
    ctx.fillStyle = '#00ffff';
    ctx.fillText('D', width - 100, padding + 20);
    ctx.fillStyle = '#ffff00';
    ctx.fillText('J', width - 100, padding + 40);
  }, [indicators?.kdj, selectedIndicators]);

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
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectedIndicators.includes('sma')}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedIndicators([...selectedIndicators, 'sma']);
                } else {
                  setSelectedIndicators(selectedIndicators.filter(i => i !== 'sma'));
                }
              }}
              className="form-checkbox h-4 w-4 text-primary"
            />
            <span className="text-sm text-gray-300">SMA</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectedIndicators.includes('bollinger')}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedIndicators([...selectedIndicators, 'bollinger']);
                } else {
                  setSelectedIndicators(selectedIndicators.filter(i => i !== 'bollinger'));
                }
              }}
              className="form-checkbox h-4 w-4 text-primary"
            />
            <span className="text-sm text-gray-300">Bollinger Bands</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectedIndicators.includes('atr')}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedIndicators([...selectedIndicators, 'atr']);
                } else {
                  setSelectedIndicators(selectedIndicators.filter(i => i !== 'atr'));
                }
              }}
              className="form-checkbox h-4 w-4 text-primary"
            />
            <span className="text-sm text-gray-300">ATR</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectedIndicators.includes('kdj')}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedIndicators([...selectedIndicators, 'kdj']);
                } else {
                  setSelectedIndicators(selectedIndicators.filter(i => i !== 'kdj'));
                }
              }}
              className="form-checkbox h-4 w-4 text-primary"
            />
            <span className="text-sm text-gray-300">KDJ</span>
          </label>
        </div>
        <DataExport data={data} indicators={indicators || undefined} />
      </div>
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={800}
          height={300}
          className="w-full h-64 bg-gray-900 rounded-lg"
        />
        <ChartInteractions
          onZoom={(start, end) => setZoom({ start, end })}
          onPan={(offset) => setPan(offset)}
          onTooltip={(x, y, data) => setTooltip({ x, y, data })}
          width={800}
          height={300}
          data={data}
        />
      </div>
      {selectedIndicators.includes('kdj') && (
        <div className="relative h-32">
          <canvas
            ref={kdjCanvasRef}
            width={800}
            height={128}
            className="w-full h-32 bg-gray-900 rounded-lg"
          />
        </div>
      )}
    </div>
  );
} 