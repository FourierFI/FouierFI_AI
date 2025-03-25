import React, { useState, useEffect } from 'react';
import { ContractInterface } from '@/utils/contractInterface';
import { ethers } from 'ethers';

interface Pool {
  token0: string;
  token1: string;
  reserve0: bigint;
  reserve1: bigint;
  totalShares: bigint;
  baseFee: number;
  dynamicFee: number;
}

interface HarmonicPoolsProps {
  contractInterface: ContractInterface;
}

export function HarmonicPools({ contractInterface }: HarmonicPoolsProps): JSX.Element {
  const [pools, setPools] = useState<Pool[]>([]);
  const [selectedPool, setSelectedPool] = useState<Pool | null>(null);
  const [amount0, setAmount0] = useState<string>('');
  const [amount1, setAmount1] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPools();
  }, []);

  const loadPools = async (): Promise<void> => {
    setLoading(true);
    try {
      // In a real implementation, we would fetch pools from the contract
      const mockPools: Pool[] = [
        {
          token0: '0x...', // ETH
          token1: '0x...', // USDT
          reserve0: BigInt(1000) * BigInt(1e18),
          reserve1: BigInt(2000000) * BigInt(1e6),
          totalShares: BigInt(1500) * BigInt(1e18),
          baseFee: 0.3,
          dynamicFee: 0.1
        },
        // Add more mock pools
      ];
      setPools(mockPools);
    } catch (error) {
      console.error('Failed to load pools:', error);
    }
    setLoading(false);
  };

  const handleAddLiquidity = async (): Promise<void> => {
    if (!selectedPool || !amount0 || !amount1) return;

    try {
      setLoading(true);
      const tx = await contractInterface.addLiquidity(
        selectedPool.token0,
        selectedPool.token1,
        ethers.parseEther(amount0),
        ethers.parseEther(amount1)
      );
      await tx.wait();
      await loadPools();
    } catch (error) {
      console.error('Failed to add liquidity:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateShare = (pool: Pool, amount0: string, amount1: string): string => {
    if (!amount0 || !amount1 || !pool.totalShares) return '0';
    
    const share0 = (BigInt(Math.floor(parseFloat(amount0) * 1e18)) * pool.totalShares) / pool.reserve0;
    const share1 = (BigInt(Math.floor(parseFloat(amount1) * 1e18)) * pool.totalShares) / pool.reserve1;
    
    return ethers.formatEther(share0 < share1 ? share0 : share1);
  };

  return (
    <div className="card p-6">
      <h2 className="text-2xl font-bold mb-6">Harmonic Pools</h2>

      {/* Pool List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {pools.map((pool: Pool, i: number) => (
          <button
            key={i}
            onClick={() => setSelectedPool(pool)}
            className={`card bg-background-dark hover:bg-background-light transition-colors ${
              selectedPool === pool ? 'border-2 border-primary' : ''
            }`}
          >
            <div className="text-lg font-semibold mb-2">
              Pool #{i + 1}
            </div>
            <div className="text-sm text-gray-400">
              <div>Reserve 0: {ethers.formatEther(pool.reserve0)} ETH</div>
              <div>Reserve 1: {ethers.formatUnits(pool.reserve1, 6)} USDT</div>
              <div>Fee: {pool.baseFee + pool.dynamicFee}%</div>
            </div>
          </button>
        ))}
      </div>

      {/* Add Liquidity Form */}
      {selectedPool && (
        <div className="card bg-background-dark p-6">
          <h3 className="text-lg font-semibold mb-4">Add Liquidity</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Amount Token 0 (ETH)
              </label>
              <input
                type="number"
                value={amount0}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount0(e.target.value)}
                className="input w-full"
                placeholder="0.0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Amount Token 1 (USDT)
              </label>
              <input
                type="number"
                value={amount1}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount1(e.target.value)}
                className="input w-full"
                placeholder="0.0"
              />
            </div>

            {amount0 && amount1 && (
              <div className="text-sm text-gray-400">
                You will receive: {calculateShare(selectedPool, amount0, amount1)} LP Tokens
              </div>
            )}

            <button
              onClick={handleAddLiquidity}
              disabled={loading || !amount0 || !amount1}
              className="btn-primary w-full"
            >
              {loading ? 'Adding Liquidity...' : 'Add Liquidity'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 