import React, { useEffect, useRef } from 'react';
import { useContract } from '@/contexts/ContractContext';

interface OrderBookEntry {
  price: bigint;
  amount: bigint;
  total: bigint;
}

export function MarketDepth() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { contract, orders } = useContract();
  const [bids, setBids] = React.useState<OrderBookEntry[]>([]);
  const [asks, setAsks] = React.useState<OrderBookEntry[]>([]);

  useEffect(() => {
    if (!contract) return;

    // Group orders by price and calculate totals
    const bidOrders = orders.filter(order => order.isBuy && order.active);
    const askOrders = orders.filter(order => !order.isBuy && order.active);

    const groupOrders = (orders: typeof bidOrders) => {
      const grouped = orders.reduce((acc, order) => {
        const priceKey = order.price.toString();
        if (!acc[priceKey]) {
          acc[priceKey] = { price: order.price, amount: BigInt(0), total: BigInt(0) };
        }
        acc[priceKey].amount += order.amount;
        acc[priceKey].total += order.amount * order.price;
        return acc;
      }, {} as Record<string, OrderBookEntry>);

      return Object.values(grouped).sort((a, b) => 
        Number(b.price - a.price)
      );
    };

    setBids(groupOrders(bidOrders));
    setAsks(groupOrders(askOrders));
  }, [contract, orders]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || (bids.length === 0 && asks.length === 0)) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const padding = 40;

    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, width, height);

    // Calculate price range
    const allPrices = [...bids, ...asks].map(order => Number(order.price));
    const minPrice = Math.min(...allPrices);
    const maxPrice = Math.max(...allPrices);
    const priceRange = maxPrice - minPrice;

    // Calculate max total
    const maxTotal = Math.max(
      ...bids.map(order => Number(order.total)),
      ...asks.map(order => Number(order.total))
    );

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

    // Draw asks (red)
    ctx.strokeStyle = '#ff4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    asks.forEach((ask, i) => {
      const x = padding + (width - 2 * padding) * (Number(ask.price) - minPrice) / priceRange;
      const y = height - padding - (Number(ask.total) / maxTotal) * (height - 2 * padding);
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Draw bids (green)
    ctx.strokeStyle = '#44ff44';
    ctx.lineWidth = 2;
    ctx.beginPath();
    bids.forEach((bid, i) => {
      const x = padding + (width - 2 * padding) * (Number(bid.price) - minPrice) / priceRange;
      const y = height - padding - (Number(bid.total) / maxTotal) * (height - 2 * padding);
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Draw price labels
    ctx.fillStyle = '#fff';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const price = minPrice + (priceRange * i) / 5;
      const y = padding + (height - 2 * padding) * (1 - i / 5);
      ctx.fillText(price.toFixed(2), padding - 5, y);
    }
  }, [bids, asks]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={800}
        height={300}
        className="w-full h-64 bg-gray-900 rounded-lg"
      />
    </div>
  );
} 