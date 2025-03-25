import { useMemo } from 'react';

interface PriceData {
  timestamp: number;
  price: number;
  volume: number;
  high?: number;
  low?: number;
  close?: number;
}

export function useTechnicalIndicators(data: PriceData[], period: number = 14) {
  return useMemo(() => {
    if (data.length < period) return null;

    const prices = data.map(d => d.price);
    const volumes = data.map(d => d.volume);
    const highs = data.map(d => d.high || d.price);
    const lows = data.map(d => d.low || d.price);
    const closes = data.map(d => d.close || d.price);

    // Calculate SMA (Simple Moving Average)
    const sma = prices.reduce((sum, price) => sum + price, 0) / prices.length;

    // Calculate EMA (Exponential Moving Average)
    const multiplier = 2 / (period + 1);
    const ema = prices.reduce((sum, price, i) => {
      if (i === 0) return price;
      return (price - sum) * multiplier + sum;
    }, prices[0]);

    // Calculate RSI (Relative Strength Index)
    const changes = prices.slice(1).map((price, i) => price - prices[i]);
    const gains = changes.map(change => change > 0 ? change : 0);
    const losses = changes.map(change => change < 0 ? -change : 0);
    const avgGain = gains.slice(-period).reduce((sum, gain) => sum + gain, 0) / period;
    const avgLoss = losses.slice(-period).reduce((sum, loss) => sum + loss, 0) / period;
    const rs = avgGain / avgLoss;
    const rsi = 100 - (100 / (1 + rs));

    // Calculate MACD (Moving Average Convergence Divergence)
    const fastPeriod = 12;
    const slowPeriod = 26;
    const signalPeriod = 9;
    
    const fastEMA = prices.reduce((sum, price, i) => {
      if (i === 0) return price;
      return (price - sum) * (2 / (fastPeriod + 1)) + sum;
    }, prices[0]);

    const slowEMA = prices.reduce((sum, price, i) => {
      if (i === 0) return price;
      return (price - sum) * (2 / (slowPeriod + 1)) + sum;
    }, prices[0]);

    const macd = fastEMA - slowEMA;
    const signal = macd * (2 / (signalPeriod + 1));
    const histogram = macd - signal;

    // Calculate Bollinger Bands
    const stdDev = Math.sqrt(
      prices.reduce((sum, price) => sum + Math.pow(price - sma, 2), 0) / prices.length
    );
    const upperBand = sma + (2 * stdDev);
    const lowerBand = sma - (2 * stdDev);

    // Calculate Volume SMA
    const volumeSMA = volumes.reduce((sum, volume) => sum + volume, 0) / volumes.length;

    // Calculate ATR (Average True Range)
    const trueRanges = prices.map((price, i) => {
      if (i === 0) return highs[i] - lows[i];
      const prevClose = prices[i - 1];
      return Math.max(
        highs[i] - lows[i],
        Math.abs(highs[i] - prevClose),
        Math.abs(lows[i] - prevClose)
      );
    });
    const atr = trueRanges.slice(-period).reduce((sum, tr) => sum + tr, 0) / period;

    // Calculate KDJ
    const kdjPeriod = 9;
    const rsv = prices.map((price, i) => {
      if (i < kdjPeriod - 1) return 0;
      const periodHigh = Math.max(...highs.slice(i - kdjPeriod + 1, i + 1));
      const periodLow = Math.min(...lows.slice(i - kdjPeriod + 1, i + 1));
      return ((price - periodLow) / (periodHigh - periodLow)) * 100;
    });
    const k = rsv.reduce((sum, value, i) => {
      if (i === 0) return 50;
      return (2/3) * sum + (1/3) * value;
    }, 50);
    const d = rsv.reduce((sum, value, i) => {
      if (i === 0) return 50;
      return (2/3) * sum + (1/3) * k;
    }, 50);
    const j = 3 * k - 2 * d;

    return {
      sma,
      ema,
      rsi,
      macd,
      signal,
      histogram,
      upperBand,
      lowerBand,
      volumeSMA,
      atr,
      kdj: {
        k,
        d,
        j,
      },
    };
  }, [data, period]);
} 