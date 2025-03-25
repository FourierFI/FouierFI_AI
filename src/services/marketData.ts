import { config as appConfig } from '@/config';
import { KlineData, MarketDataConfig, MarketDepth, Ticker24h } from '@/types/market';

export class MarketDataService {
  private static instance: MarketDataService;
  private ws: WebSocket | null = null;

  private constructor() {}

  public static getInstance(): MarketDataService {
    if (!MarketDataService.instance) {
      MarketDataService.instance = new MarketDataService();
    }
    return MarketDataService.instance;
  }

  public async fetchHistoricalData(config: MarketDataConfig): Promise<KlineData[]> {
    const { symbol, interval, limit = 1000, startTime, endTime } = config;
    const params = new URLSearchParams({
      symbol,
      interval,
      limit: limit.toString(),
      ...(startTime && { startTime: startTime.toString() }),
      ...(endTime && { endTime: endTime.toString() }),
    });

    const response = await fetch(`${appConfig.api.baseUrl}/klines?${params}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch historical data: ${response.statusText}`);
    }

    const data = await response.json();
    return data.map((item: any[]) => ({
      timestamp: item[0],
      open: parseFloat(item[1]),
      high: parseFloat(item[2]),
      low: parseFloat(item[3]),
      close: parseFloat(item[4]),
      volume: parseFloat(item[5]),
      closeTime: item[6],
      quoteVolume: parseFloat(item[7]),
      trades: parseInt(item[8]),
      takerBaseVolume: parseFloat(item[9]),
      takerQuoteVolume: parseFloat(item[10]),
    }));
  }

  public subscribeToRealTimeData(symbol: string, interval: string, callback: (data: KlineData) => void): void {
    if (this.ws) {
      this.ws.close();
    }

    this.ws = new WebSocket(appConfig.api.wsUrl);

    this.ws.onopen = () => {
      const subscribeMessage = {
        method: 'SUBSCRIBE',
        params: [`${symbol.toLowerCase()}@kline_${interval}`],
        id: 1,
      };
      this.ws?.send(JSON.stringify(subscribeMessage));
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.e === 'kline') {
        const kline = data.k;
        callback({
          timestamp: kline.t,
          open: parseFloat(kline.o),
          high: parseFloat(kline.h),
          low: parseFloat(kline.l),
          close: parseFloat(kline.c),
          volume: parseFloat(kline.v),
          closeTime: kline.T,
          quoteVolume: parseFloat(kline.q),
          trades: parseInt(kline.n),
          takerBaseVolume: parseFloat(kline.V),
          takerQuoteVolume: parseFloat(kline.Q),
        });
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.ws.onclose = () => {
      console.log('WebSocket connection closed');
    };
  }

  public async fetchMarketDepth(symbol: string, limit: number = 100): Promise<MarketDepth> {
    const response = await fetch(`${appConfig.api.baseUrl}/depth?symbol=${symbol}&limit=${limit}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch market depth: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      bids: data.bids.map((bid: string[]) => [parseFloat(bid[0]), parseFloat(bid[1])]),
      asks: data.asks.map((ask: string[]) => [parseFloat(ask[0]), parseFloat(ask[1])]),
    };
  }

  public async fetchTicker24h(symbol: string): Promise<Ticker24h> {
    const response = await fetch(`${appConfig.api.baseUrl}/ticker/24hr?symbol=${symbol}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch 24h ticker: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      symbol: data.symbol,
      priceChange: parseFloat(data.priceChange),
      priceChangePercent: parseFloat(data.priceChangePercent),
      weightedAvgPrice: parseFloat(data.weightedAvgPrice),
      prevClosePrice: parseFloat(data.prevClosePrice),
      lastQty: parseFloat(data.lastQty),
      bidPrice: parseFloat(data.bidPrice),
      bidQty: parseFloat(data.bidQty),
      askPrice: parseFloat(data.askPrice),
      askQty: parseFloat(data.askQty),
      openPrice: parseFloat(data.openPrice),
      highPrice: parseFloat(data.highPrice),
      lowPrice: parseFloat(data.lowPrice),
      volume: parseFloat(data.volume),
      quoteVolume: parseFloat(data.quoteVolume),
      openTime: data.openTime,
      closeTime: data.closeTime,
      firstId: data.firstId,
      lastId: data.lastId,
      count: data.count,
    };
  }

  public unsubscribe(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
} 