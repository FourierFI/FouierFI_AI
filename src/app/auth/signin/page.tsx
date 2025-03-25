'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { ethers } from 'ethers';

export default function SignIn() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      setError(null);

      if (!window.ethereum) {
        throw new Error('Please install MetaMask to connect your wallet');
      }

      // Request account access
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      // Create and sign message
      const message = `Sign in to FourierFi with address: ${address}`;
      const signature = await signer.signMessage(message);

      // Sign in with NextAuth
      const result = await signIn('credentials', {
        address,
        signature,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center">
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-8 border border-gray-700 max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-8">Connect to FourierFi</h1>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-md p-4 mb-6">
            {error}
          </div>
        )}

        <button
          onClick={handleConnect}
          disabled={isConnecting}
          className={`w-full py-3 px-4 rounded-md text-white font-medium bg-primary hover:opacity-90 transition-opacity ${
            isConnecting ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </button>

        <p className="mt-6 text-center text-sm text-gray-400">
          By connecting, you agree to our{' '}
          <a href="#" className="text-primary hover:underline">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="text-primary hover:underline">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
} 