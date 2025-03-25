import React, { createContext, useContext, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { FourierFiContract } from '@/contracts/FourierFi';
import { useAuth } from './AuthContext';

interface ContractContextType {
  contract: FourierFiContract | null;
  balance: bigint;
  poolBalance: bigint;
  poolAPY: bigint;
  orders: Array<{
    id: bigint;
    amount: bigint;
    price: bigint;
    isBuy: boolean;
    trader: string;
    active: boolean;
  }>;
  isLoading: boolean;
  error: string | null;
  refreshBalances: () => Promise<void>;
  refreshOrders: () => Promise<void>;
}

const ContractContext = createContext<ContractContextType>({
  contract: null,
  balance: BigInt(0),
  poolBalance: BigInt(0),
  poolAPY: BigInt(0),
  orders: [],
  isLoading: false,
  error: null,
  refreshBalances: async () => {},
  refreshOrders: async () => {},
});

export function ContractProvider({ children }: { children: React.ReactNode }) {
  const { address, provider, signer } = useAuth();
  const [contract, setContract] = useState<FourierFiContract | null>(null);
  const [balance, setBalance] = useState<bigint>(BigInt(0));
  const [poolBalance, setPoolBalance] = useState<bigint>(BigInt(0));
  const [poolAPY, setPoolAPY] = useState<bigint>(BigInt(0));
  const [orders, setOrders] = useState<Array<{
    id: bigint;
    amount: bigint;
    price: bigint;
    isBuy: boolean;
    trader: string;
    active: boolean;
  }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (provider && signer && process.env.NEXT_PUBLIC_CONTRACT_ADDRESS) {
      const fourierFi = new FourierFiContract(
        process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
        provider,
        signer
      );
      setContract(fourierFi);

      // Set up event listeners
      fourierFi.onOrderPlaced(async (orderId, trader, amount, price, isBuy) => {
        if (trader.toLowerCase() === address?.toLowerCase()) {
          await refreshOrders();
        }
      });

      fourierFi.onOrderCancelled(async (orderId, trader) => {
        if (trader.toLowerCase() === address?.toLowerCase()) {
          await refreshOrders();
        }
      });

      fourierFi.onOrderFilled(async (orderId, buyer, seller, amount, price) => {
        if (
          buyer.toLowerCase() === address?.toLowerCase() ||
          seller.toLowerCase() === address?.toLowerCase()
        ) {
          await refreshBalances();
          await refreshOrders();
        }
      });

      fourierFi.onPoolDeposit(async (user, amount) => {
        if (user.toLowerCase() === address?.toLowerCase()) {
          await refreshBalances();
        }
      });

      fourierFi.onPoolWithdraw(async (user, amount) => {
        if (user.toLowerCase() === address?.toLowerCase()) {
          await refreshBalances();
        }
      });

      return () => {
        fourierFi.removeAllListeners();
      };
    }
  }, [provider, signer, address]);

  const refreshBalances = async () => {
    if (!contract || !address) return;

    try {
      setIsLoading(true);
      setError(null);

      const [newBalance, newPoolBalance, newPoolAPY] = await Promise.all([
        contract.getBalance(address),
        contract.getPoolBalance(address),
        contract.getPoolAPY(),
      ]);

      setBalance(newBalance);
      setPoolBalance(newPoolBalance);
      setPoolAPY(newPoolAPY);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh balances');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshOrders = async () => {
    if (!contract || !address) return;

    try {
      setIsLoading(true);
      setError(null);

      const orderIds = await contract.getOrdersByTrader(address);
      const orderPromises = orderIds.map((id) => contract.getOrder(id));
      const orderDetails = await Promise.all(orderPromises);

      setOrders(
        orderDetails.map((order, index) => ({
          id: orderIds[index],
          ...order,
        }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh orders');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (address) {
      refreshBalances();
      refreshOrders();
    }
  }, [address]);

  return (
    <ContractContext.Provider
      value={{
        contract,
        balance,
        poolBalance,
        poolAPY,
        orders,
        isLoading,
        error,
        refreshBalances,
        refreshOrders,
      }}
    >
      {children}
    </ContractContext.Provider>
  );
}

export function useContract() {
  return useContext(ContractContext);
} 