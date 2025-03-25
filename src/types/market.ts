export type Timeframe = '1m' | '5m' | '15m' | '1h' | '4h' | '1d';

export interface KlineData {
  timestamp: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  closeTime: number;
  quoteVolume: string;
  trades: number;
  takerBaseVolume: string;
  takerQuoteVolume: string;
  ignore: string;
}

export interface MarketDepth {
  bids: [number, number][]; // [price, quantity]
  asks: [number, number][]; // [price, quantity]
}

export interface Ticker24h {
  symbol: string;
  priceChange: string;
  priceChangePercent: string;
  weightedAvgPrice: string;
  prevClosePrice: string;
  lastQty: string;
  bidPrice: string;
  bidQty: string;
  askPrice: string;
  askQty: string;
  openPrice: string;
  highPrice: string;
  lowPrice: string;
  volume: string;
  quoteVolume: string;
  openTime: number;
  closeTime: number;
  firstId: number;
  lastId: number;
  count: number;
}

export interface MarketDataConfig {
  symbol: string;
  interval: string;
  limit: number;
}

export interface TimeSeriesData {
  timestamp: number;
  price: number;
} 