import { useEffect, useState } from 'react';
import { MarketDataService } from '@/services/marketData';
import { KlineData, MarketDataConfig, MarketDepth, Ticker24h } from '@/types/market';

export function useHistoricalData(config: MarketDataConfig) {
  const [data, setData] = useState<KlineData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const marketData = MarketDataService.getInstance();
        const result = await marketData.fetchHistoricalData(config);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch historical data'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [config.symbol, config.interval, config.limit, config.startTime, config.endTime]);

  return { data, loading, error };
}

export function useRealTimeData(symbol: string, interval: string) {
  const [data, setData] = useState<KlineData | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const marketData = MarketDataService.getInstance();
    
    const handleData = (newData: KlineData) => {
      setData(newData);
    };

    marketData.subscribeToRealTimeData(symbol, interval, handleData);

    return () => {
      marketData.unsubscribe();
    };
  }, [symbol, interval]);

  return { data, error };
}

export function useMarketDepth(symbol: string, limit: number = 100) {
  const [data, setData] = useState<MarketDepth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const marketData = MarketDataService.getInstance();
        const result = await marketData.fetchMarketDepth(symbol, limit);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch market depth'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [symbol, limit]);

  return { data, loading, error };
}

export function useTicker24h(symbol: string) {
  const [data, setData] = useState<Ticker24h | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const marketData = MarketDataService.getInstance();
        const result = await marketData.fetchTicker24h(symbol);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch 24h ticker'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [symbol]);

  return { data, loading, error };
}

interface MarketData {
  price: number;
  volume: number;
  timestamp: number;
}

export function useMarketData() {
  const [data, setData] = useState<MarketData>({
    price: 0,
    volume: 0,
    timestamp: Date.now(),
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // TODO: Replace with actual API call
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/ticker/24hr?symbol=FFUSDT`);
        if (!response.ok) {
          throw new Error('Failed to fetch market data');
        }

        const result = await response.json();
        setData({
          price: parseFloat(result.lastPrice),
          volume: parseFloat(result.volume),
          timestamp: Date.now(),
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch market data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return {
    price: data.price,
    volume: data.volume,
    isLoading,
    error,
  };
} 