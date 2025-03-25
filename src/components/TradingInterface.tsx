import React, { useState } from 'react';
import { useContract } from '@/contexts/ContractContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import { OrderBook } from './OrderBook';

interface OrderForm {
  type: 'market' | 'limit';
  side: 'buy' | 'sell';
  amount: string;
  price: string;
}

export function TradingInterface() {
  const { contract, balance, isLoading, error, refreshBalances, refreshOrders } = useContract();
  const { isAuthenticated } = useAuth();
  const { addNotification } = useNotification();
  const [orderForm, setOrderForm] = useState<OrderForm>({
    type: 'limit',
    side: 'buy',
    amount: '',
    price: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contract || !isAuthenticated) return;

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      const amount = BigInt(Math.floor(parseFloat(orderForm.amount) * 1e18));
      const price = BigInt(Math.floor(parseFloat(orderForm.price) * 1e18));

      await contract.placeOrder(amount, price, orderForm.side === 'buy');
      await refreshOrders();
      await refreshBalances();

      // Reset form
      setOrderForm({
        type: 'limit',
        side: 'buy',
        amount: '',
        price: '',
      });

      addNotification(
        'success',
        `${orderForm.side === 'buy' ? 'Buy' : 'Sell'} order placed successfully`
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to place order';
      setSubmitError(errorMessage);
      addNotification('error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-400">Please connect your wallet to trade</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Order Form */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold mb-4">Place Order</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => setOrderForm({ ...orderForm, type: 'market' })}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
                orderForm.type === 'market'
                  ? 'bg-primary text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Market
            </button>
            <button
              type="button"
              onClick={() => setOrderForm({ ...orderForm, type: 'limit' })}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
                orderForm.type === 'limit'
                  ? 'bg-primary text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Limit
            </button>
          </div>

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => setOrderForm({ ...orderForm, side: 'buy' })}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
                orderForm.side === 'buy'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Buy
            </button>
            <button
              type="button"
              onClick={() => setOrderForm({ ...orderForm, side: 'sell' })}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
                orderForm.side === 'sell'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Sell
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Amount (FF)
            </label>
            <input
              type="number"
              step="0.000000000000000001"
              value={orderForm.amount}
              onChange={(e) => setOrderForm({ ...orderForm, amount: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          {orderForm.type === 'limit' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Price (USD)
              </label>
              <input
                type="number"
                step="0.000000000000000001"
                value={orderForm.price}
                onChange={(e) => setOrderForm({ ...orderForm, price: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
          )}

          {submitError && (
            <div className="text-red-500 text-sm">{submitError}</div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className={`w-full py-2 px-4 rounded-md text-white font-medium ${
              isSubmitting || isLoading
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-primary hover:opacity-90'
            }`}
          >
            {isSubmitting ? 'Placing Order...' : 'Place Order'}
          </button>
        </form>
      </div>

      {/* Balance */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold mb-4">Your Balance</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-300">FF Balance</span>
            <span className="text-white">
              {isLoading ? '...' : `${Number(balance) / 1e18} FF`}
            </span>
          </div>
          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}
        </div>
      </div>

      {/* Order Book */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
        <OrderBook symbol="FF" />
      </div>
    </div>
  );
} 