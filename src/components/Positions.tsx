import React, { useState } from 'react';
import { useContract } from '@/contexts/ContractContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import { TradeHistory } from './TradeHistory';

export function Positions() {
  const { contract, balance, poolBalance, poolAPY, isLoading, error, refreshBalances } = useContract();
  const { isAuthenticated } = useAuth();
  const { addNotification } = useNotification();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [amount, setAmount] = useState('');

  const handleDeposit = async () => {
    if (!contract || !isAuthenticated || !amount) return;

    try {
      setIsSubmitting(true);
      const depositAmount = BigInt(Math.floor(parseFloat(amount) * 1e18));
      await contract.deposit(depositAmount);
      await refreshBalances();
      setAmount('');
      addNotification('success', 'Successfully deposited to pool');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to deposit';
      addNotification('error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWithdraw = async () => {
    if (!contract || !isAuthenticated || !amount) return;

    try {
      setIsSubmitting(true);
      const withdrawAmount = BigInt(Math.floor(parseFloat(amount) * 1e18));
      await contract.withdraw(withdrawAmount);
      await refreshBalances();
      setAmount('');
      addNotification('success', 'Successfully withdrew from pool');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to withdraw';
      addNotification('error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-400">Please connect your wallet to view positions</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-700 rounded mb-4"></div>
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
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
      <h3 className="text-lg font-semibold">Your Positions</h3>
      
      {/* FF Balance */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="text-sm font-medium text-gray-300">FF Balance</h4>
            <p className="text-2xl font-bold text-white">
              {Number(balance) / 1e18} FF
            </p>
          </div>
          <div className="text-right">
            <h4 className="text-sm font-medium text-gray-300">Value</h4>
            <p className="text-2xl font-bold text-white">
              ${(Number(balance) * 1) / 1e18}
            </p>
          </div>
        </div>
      </div>

      {/* Pool Position */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="text-sm font-medium text-gray-300">Pool Position</h4>
            <p className="text-2xl font-bold text-white">
              {Number(poolBalance) / 1e18} FF
            </p>
          </div>
          <div className="text-right">
            <h4 className="text-sm font-medium text-gray-300">APY</h4>
            <p className="text-2xl font-bold text-green-500">
              {Number(poolAPY) / 1e18}%
            </p>
          </div>
        </div>
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Amount (FF)
            </label>
            <input
              type="number"
              step="0.000000000000000001"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter amount"
            />
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleDeposit}
              disabled={isSubmitting || !amount}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
                isSubmitting || !amount
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-primary text-white hover:opacity-90'
              }`}
            >
              {isSubmitting ? 'Depositing...' : 'Deposit'}
            </button>
            <button
              onClick={handleWithdraw}
              disabled={isSubmitting || !amount}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
                isSubmitting || !amount
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-gray-700 text-white hover:bg-gray-600'
              }`}
            >
              {isSubmitting ? 'Withdrawing...' : 'Withdraw'}
            </button>
          </div>
        </div>
      </div>

      {/* Trade History */}
      <TradeHistory />
    </div>
  );
} 
} 