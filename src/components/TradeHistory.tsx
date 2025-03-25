import React from 'react';
import { useContract } from '@/contexts/ContractContext';
import { useAuth } from '@/contexts/AuthContext';

interface Trade {
  id: bigint;
  timestamp: number;
  type: 'buy' | 'sell';
  amount: bigint;
  price: bigint;
  total: bigint;
}

export function TradeHistory() {
  const { contract, orders, isLoading, error } = useContract();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-400">Please connect your wallet to view trade history</p>
      </div>
    );
  }

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

  const trades: Trade[] = orders
    .filter((order) => !order.active)
    .map((order) => ({
      id: order.id,
      timestamp: Date.now(), // TODO: Get actual timestamp from contract
      type: order.isBuy ? ('buy' as const) : ('sell' as const),
      amount: order.amount,
      price: order.price,
      total: order.amount * order.price,
    }))
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 10);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Trade History</h3>
      
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
        <div className="space-y-2">
          {trades.length > 0 ? (
            trades.map((trade) => (
              <div
                key={Number(trade.id)}
                className="flex items-center justify-between p-2 bg-gray-800/50 rounded"
              >
                <div className="flex items-center space-x-4">
                  <span className={`text-sm font-medium ${
                    trade.type === 'buy' ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {trade.type.toUpperCase()}
                  </span>
                  <span className="text-gray-300">
                    {Number(trade.amount) / 1e18} FF
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-gray-300">
                    ${Number(trade.price) / 1e18}
                  </span>
                  <span className="text-gray-400">
                    ${Number(trade.total) / 1e36}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-sm">No recent trades</p>
          )}
        </div>
      </div>
    </div>
  );
} 