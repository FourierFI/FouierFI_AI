import React from 'react';
import { useContract } from '@/contexts/ContractContext';

interface OrderBookProps {
  symbol: string;
}

export function OrderBook({ symbol }: OrderBookProps) {
  const { orders, isLoading, error } = useContract();

  const buyOrders = orders
    .filter((order) => order.isBuy && order.active)
    .sort((a, b) => Number(b.price - a.price));

  const sellOrders = orders
    .filter((order) => !order.isBuy && order.active)
    .sort((a, b) => Number(a.price - b.price));

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-700 rounded mb-4"></div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
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
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Order Book</h3>
      
      {/* Sell Orders */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-red-500">Sell Orders</h4>
        {sellOrders.length > 0 ? (
          sellOrders.map((order) => (
            <div
              key={Number(order.id)}
              className="flex items-center justify-between p-2 bg-gray-800/50 rounded"
            >
              <div className="flex items-center space-x-4">
                <span className="text-red-500">SELL</span>
                <span className="text-gray-300">
                  {Number(order.amount) / 1e18} {symbol}
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-gray-300">
                  ${Number(order.price) / 1e18}
                </span>
                <span className="text-gray-400">
                  ${(Number(order.price) * Number(order.amount)) / 1e36}
                </span>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-400 text-sm">No sell orders</p>
        )}
      </div>

      {/* Buy Orders */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-green-500">Buy Orders</h4>
        {buyOrders.length > 0 ? (
          buyOrders.map((order) => (
            <div
              key={Number(order.id)}
              className="flex items-center justify-between p-2 bg-gray-800/50 rounded"
            >
              <div className="flex items-center space-x-4">
                <span className="text-green-500">BUY</span>
                <span className="text-gray-300">
                  {Number(order.amount) / 1e18} {symbol}
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-gray-300">
                  ${Number(order.price) / 1e18}
                </span>
                <span className="text-gray-400">
                  ${(Number(order.price) * Number(order.amount)) / 1e36}
                </span>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-400 text-sm">No buy orders</p>
        )}
      </div>
    </div>
  );
} 