import React, { createContext, useContext, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { signIn, signOut, useSession } from 'next-auth/react';

interface AuthContextType {
  isAuthenticated: boolean;
  address: string | null;
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  address: null,
  provider: null,
  signer: null,
  connect: async () => {},
  disconnect: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      setProvider(provider);
    }
  }, []);

  useEffect(() => {
    if (provider && session?.user?.address) {
      provider.getSigner().then(setSigner);
    }
  }, [provider, session?.user?.address]);

  const connect = async () => {
    try {
      if (!provider) {
        throw new Error('No provider available');
      }

      const accounts = await provider.send('eth_requestAccounts', []);
      const address = accounts[0];

      const message = `Sign in to FourierFi with address ${address}`;
      const signer = await provider.getSigner();
      const signature = await signer.signMessage(message);

      await signIn('credentials', {
        address,
        signature,
        redirect: false,
      });
    } catch (error) {
      console.error('Failed to connect:', error);
      throw error;
    }
  };

  const disconnect = async () => {
    await signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: status === 'authenticated',
        address: session?.user?.address || null,
        provider,
        signer,
        connect,
        disconnect,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
} 