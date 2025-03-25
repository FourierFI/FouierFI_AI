import React from 'react';
import { useHistoricalData, useTicker24h } from '@/hooks/useMarketData';
import { PriceChart } from '@/components/PriceChart';
import { config } from '@/config';
import { TimeSeriesData } from '@/types/market';

export function MarketData() {
  const { data: historicalData, loading: historicalLoading, error: historicalError } = useHistoricalData({
    symbol: config.marketData.defaultSymbol,
    interval: config.marketData.defaultInterval,
    limit: config.marketData.defaultLimit,
  });

  const { data: tickerData, loading: tickerLoading, error: tickerError } = useTicker24h(
    config.marketData.defaultSymbol
  );

  if (historicalLoading || tickerLoading) {
    return <div>Loading market data...</div>;
  }

  if (historicalError || tickerError) {
    return <div>Error: {historicalError?.message || tickerError?.message}</div>;
  }

  if (!historicalData || !tickerData) {
    return <div>No market data available</div>;
  }

  // Convert historical data to TimeSeriesData format
  const timeSeriesData: TimeSeriesData[] = historicalData.map(item => ({
    timestamp: item.timestamp,
    price: parseFloat(item.close),
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-700/50 rounded p-4">
          <div className="text-sm text-gray-400">Price</div>
          <div className="text-xl font-semibold">${parseFloat(tickerData.lastQty).toFixed(2)}</div>
        </div>
        <div className="bg-gray-700/50 rounded p-4">
          <div className="text-sm text-gray-400">24h Change</div>
          <div className={`text-xl font-semibold ${parseFloat(tickerData.priceChangePercent) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {parseFloat(tickerData.priceChangePercent).toFixed(2)}%
          </div>
        </div>
        <div className="bg-gray-700/50 rounded p-4">
          <div className="text-sm text-gray-400">24h Volume</div>
          <div className="text-xl font-semibold">${parseFloat(tickerData.volume).toLocaleString()}</div>
        </div>
        <div className="bg-gray-700/50 rounded p-4">
          <div className="text-sm text-gray-400">24h High/Low</div>
          <div className="text-xl font-semibold">
            ${parseFloat(tickerData.highPrice).toFixed(2)} / ${parseFloat(tickerData.lowPrice).toFixed(2)}
          </div>
        </div>
      </div>

      <div className="bg-gray-700/50 rounded p-4">
        <PriceChart historicalData={timeSeriesData} />
      </div>
    </div>
  );
} 