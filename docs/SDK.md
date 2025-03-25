# FourierFi SDK Documentation

## Overview

The FourierFi SDK provides a simple and powerful way to interact with the FourierFi platform. This documentation covers the official SDKs for various programming languages.

## JavaScript/TypeScript SDK

### Installation

```bash
npm install @fourierfi/sdk
# or
yarn add @fourierfi/sdk
```

### Basic Usage

```typescript
import { FourierFi } from '@fourierfi/sdk';

const fourier = new FourierFi({
  apiKey: 'YOUR_API_KEY',
  network: 'mainnet' // or 'testnet'
});

// Get market data
const priceData = await fourier.market.getPrice('BTC/USD', '1h');

// Get frequency domain analysis
const analysis = await fourier.analysis.getFrequency('BTC/USD', {
  timeframe: '24h',
  indicators: ['sma', 'rsi', 'macd']
});

// Place an order
const order = await fourier.trading.placeOrder({
  symbol: 'BTC/USD',
  side: 'buy',
  type: 'limit',
  price: 50000.00,
  amount: 0.1
});
```

### WebSocket Usage

```typescript
import { FourierFi } from '@fourierfi/sdk';

const fourier = new FourierFi({
  apiKey: 'YOUR_API_KEY'
});

// Subscribe to real-time price updates
fourier.ws.subscribe('price', 'BTC/USD', (data) => {
  console.log('Price update:', data);
});

// Subscribe to order book updates
fourier.ws.subscribe('orderbook', 'BTC/USD', (data) => {
  console.log('Order book update:', data);
});
```

## Python SDK

### Installation

```bash
pip install fourierfi-sdk
```

### Basic Usage

```python
from fourierfi import FourierFi

fourier = FourierFi(api_key='YOUR_API_KEY')

# Get market data
price_data = fourier.market.get_price('BTC/USD', '1h')

# Get frequency domain analysis
analysis = fourier.analysis.get_frequency('BTC/USD', {
    'timeframe': '24h',
    'indicators': ['sma', 'rsi', 'macd']
})

# Place an order
order = fourier.trading.place_order({
    'symbol': 'BTC/USD',
    'side': 'buy',
    'type': 'limit',
    'price': 50000.00,
    'amount': 0.1
})
```

### WebSocket Usage

```python
from fourierfi import FourierFi

fourier = FourierFi(api_key='YOUR_API_KEY')

def on_price_update(data):
    print('Price update:', data)

def on_orderbook_update(data):
    print('Order book update:', data)

# Subscribe to real-time updates
fourier.ws.subscribe('price', 'BTC/USD', on_price_update)
fourier.ws.subscribe('orderbook', 'BTC/USD', on_orderbook_update)
```

## Java SDK

### Installation

Add to your `pom.xml`:

```xml
<dependency>
    <groupId>io.fourierfi</groupId>
    <artifactId>fourierfi-sdk</artifactId>
    <version>1.0.0</version>
</dependency>
```

### Basic Usage

```java
import io.fourierfi.FourierFi;

FourierFi fourier = new FourierFi("YOUR_API_KEY");

// Get market data
PriceData priceData = fourier.market().getPrice("BTC/USD", "1h");

// Get frequency domain analysis
Analysis analysis = fourier.analysis().getFrequency("BTC/USD", 
    new AnalysisRequest()
        .setTimeframe("24h")
        .setIndicators(Arrays.asList("sma", "rsi", "macd")));

// Place an order
Order order = fourier.trading().placeOrder(
    new OrderRequest()
        .setSymbol("BTC/USD")
        .setSide("buy")
        .setType("limit")
        .setPrice(50000.00)
        .setAmount(0.1));
```

## Go SDK

### Installation

```bash
go get github.com/fourierfi/sdk-go
```

### Basic Usage

```go
package main

import (
    "github.com/fourierfi/sdk-go"
)

func main() {
    fourier := fourierfi.New("YOUR_API_KEY")

    // Get market data
    priceData, err := fourier.Market.GetPrice("BTC/USD", "1h")
    if err != nil {
        panic(err)
    }

    // Get frequency domain analysis
    analysis, err := fourier.Analysis.GetFrequency("BTC/USD", fourierfi.AnalysisRequest{
        Timeframe:  "24h",
        Indicators: []string{"sma", "rsi", "macd"},
    })
    if err != nil {
        panic(err)
    }

    // Place an order
    order, err := fourier.Trading.PlaceOrder(fourierfi.OrderRequest{
        Symbol: "BTC/USD",
        Side:   "buy",
        Type:   "limit",
        Price:  50000.00,
        Amount: 0.1,
    })
    if err != nil {
        panic(err)
    }
}
```

## Error Handling

All SDKs provide consistent error handling:

```typescript
try {
    const data = await fourier.market.getPrice('BTC/USD', '1h');
} catch (error) {
    if (error.code === 'INVALID_API_KEY') {
        // Handle invalid API key
    } else if (error.code === 'RATE_LIMIT_EXCEEDED') {
        // Handle rate limiting
    }
}
```

## Rate Limiting

SDKs automatically handle rate limiting and retry logic. You can configure the retry behavior:

```typescript
const fourier = new FourierFi({
    apiKey: 'YOUR_API_KEY',
    retryOptions: {
        maxRetries: 3,
        retryDelay: 1000, // ms
        backoffFactor: 2
    }
});
```

## Best Practices

1. Always use environment variables for API keys
2. Implement proper error handling
3. Use WebSocket connections for real-time data
4. Implement rate limiting handling
5. Keep SDK versions up to date

## Support

For SDK support:
- GitHub Issues: [https://github.com/fourierfi/sdk/issues](https://github.com/fourierfi/sdk/issues)
- Documentation: [https://docs.fourierfi.io](https://docs.fourierfi.io)
- Discord: [FourierFi Community](https://discord.gg/fourierfi) 