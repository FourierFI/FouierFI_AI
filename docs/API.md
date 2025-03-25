# FourierFi API Documentation

## Overview

The FourierFi API provides access to our frequency domain analysis and trading features. All API endpoints are RESTful and return JSON responses.

## Authentication

All API requests require authentication using an API key. Include your API key in the request header:

```
Authorization: Bearer YOUR_API_KEY
```

## Endpoints

### Market Data

#### Get Price Data
```http
GET /api/v1/market/price
```

Returns the current price and historical price data.

**Parameters:**
- `symbol` (string): Trading pair symbol (e.g., "BTC/USD")
- `timeframe` (string): Time interval (e.g., "1h", "24h", "7d")
- `limit` (number): Number of data points to return (default: 100)

**Response:**
```json
{
  "success": true,
  "data": {
    "current": 50000.00,
    "history": [
      {
        "timestamp": 1616169600000,
        "price": 50000.00,
        "volume": 100.5
      }
    ]
  }
}
```

### Technical Analysis

#### Get Frequency Domain Analysis
```http
GET /api/v1/analysis/frequency
```

Returns frequency domain analysis results.

**Parameters:**
- `symbol` (string): Trading pair symbol
- `timeframe` (string): Time interval
- `indicators` (array): Array of indicators to include

**Response:**
```json
{
  "success": true,
  "data": {
    "spectrum": [...],
    "harmonics": [...],
    "phase": [...],
    "indicators": {
      "sma": [...],
      "rsi": [...],
      "macd": [...]
    }
  }
}
```

### Trading

#### Place Order
```http
POST /api/v1/trading/order
```

Place a new trading order.

**Request Body:**
```json
{
  "symbol": "BTC/USD",
  "side": "buy",
  "type": "limit",
  "price": 50000.00,
  "amount": 0.1,
  "timeInForce": "GTC"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "orderId": "123456",
    "status": "open",
    "filled": 0,
    "remaining": 0.1
  }
}
```

## Error Handling

All API responses follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description"
  }
}
```

Common error codes:
- `INVALID_API_KEY`: Invalid or missing API key
- `INVALID_PARAMETERS`: Invalid request parameters
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `SERVER_ERROR`: Internal server error

## Rate Limiting

API requests are limited to:
- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated users

## WebSocket API

For real-time data, use our WebSocket API:

```javascript
const ws = new WebSocket('wss://api.fourierfi.io/ws');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // Handle real-time data
};
```

Available WebSocket channels:
- `price`: Real-time price updates
- `orderbook`: Order book updates
- `trades`: Recent trades
- `analysis`: Real-time analysis updates

## SDK Support

Official SDKs are available for:
- JavaScript/TypeScript
- Python
- Java
- Go

See our [SDK documentation](SDK.md) for more details. 