export const config = {
  // API Configuration
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.binance.com/api/v3',
    wsUrl: process.env.NEXT_PUBLIC_WS_URL || 'wss://stream.binance.com:9443/ws',
    apiKey: process.env.NEXT_PUBLIC_API_KEY || '',
  },

  // Market Data Configuration
  marketData: {
    defaultSymbol: 'BTCUSDT',
    defaultInterval: '1h' as const,
    defaultLimit: 1000,
    updateInterval: 5000, // 5 seconds
  },

  // Fourier Analysis Configuration
  fourier: {
    windowSize: 1024,
    samplingRate: 1,
    dominantFrequencyThreshold: 0.1,
    harmonicRatioThreshold: 0.1,
  },

  // Trading Configuration
  trading: {
    minOrderSize: 0.001,
    maxOrderSize: 100,
    defaultSlippage: 0.001, // 0.1%
    maxSlippage: 0.01, // 1%
  },

  // UI Configuration
  ui: {
    theme: {
      primary: '#D9A91A',
      secondary: '#1A82D9',
      background: '#0A0F1F',
      backgroundDark: '#060B17',
      backgroundLight: '#0E1529',
    },
    chart: {
      defaultTimeframe: '1h',
      timeframes: ['1m', '5m', '15m', '1h', '4h', '1d'],
      defaultLimit: 100,
    },
  },
}; 