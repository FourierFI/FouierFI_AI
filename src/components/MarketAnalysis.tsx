import React, { useState, useEffect } from 'react';
import { useMarketData } from '@/hooks/useMarketData';
import { PriceChart } from './PriceChart';
import { FourierAnalysis } from './FourierAnalysis';
import { MarketDepth } from './MarketDepth';
import { VolumeChart } from './VolumeChart';

interface MarketStats {
  volume24h: number;
  priceChange24h: number;
  high24h: number;
  low24h: number;
}

export function MarketAnalysis() {
  const { price, volume, isLoading, error } = useMarketData();
  const [timeframe, setTimeframe] = useState<'1h' | '24h' | '7d'>('24h');
  const [stats, setStats] = useState<MarketStats>({
    volume24h: 0,
    priceChange24h: 0,
    high24h: 0,
    low24h: 0,
  });

  useEffect(() => {
    // TODO: Fetch market stats from API
    setStats({
      volume24h: 1000000,
      priceChange24h: 5.2,
      high24h: 1.05,
      low24h: 0.95,
    });
  }, []);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-700 rounded mb-4"></div>
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-6 bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4 bg-red-500/10 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Market Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
          <h4 className="text-sm font-medium text-gray-300">24h Volume</h4>
          <p className="text-2xl font-bold text-white">
            ${stats.volume24h.toLocaleString()}
          </p>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
          <h4 className="text-sm font-medium text-gray-300">24h Change</h4>
          <p className={`text-2xl font-bold ${
            stats.priceChange24h >= 0 ? 'text-green-500' : 'text-red-500'
          }`}>
            {stats.priceChange24h >= 0 ? '+' : ''}{stats.priceChange24h}%
          </p>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
          <h4 className="text-sm font-medium text-gray-300">24h High</h4>
          <p className="text-2xl font-bold text-white">
            ${stats.high24h.toFixed(2)}
          </p>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
          <h4 className="text-sm font-medium text-gray-300">24h Low</h4>
          <p className="text-2xl font-bold text-white">
            ${stats.low24h.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Price Chart */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Price Chart</h3>
          <div className="flex space-x-2">
            {(['1h', '24h', '7d'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  timeframe === tf
                    ? 'bg-primary text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
        <PriceChart timeframe={timeframe} />
      </div>

      {/* Fourier Analysis */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
        <h3 className="text-lg font-semibold mb-4">Fourier Analysis</h3>
        <FourierAnalysis />
      </div>

      {/* Market Depth */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
        <h3 className="text-lg font-semibold mb-4">Market Depth</h3>
        <MarketDepth />
      </div>

      {/* Trading Volume */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
        <h3 className="text-lg font-semibold mb-4">Trading Volume</h3>
        <VolumeChart />
      </div>
    </div>
  );
} 