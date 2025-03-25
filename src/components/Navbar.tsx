'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export function Navbar() {
  const pathname = usePathname();
  const { isAuthenticated, address, connect, disconnect } = useAuth();

  const isActive = (path: string) => pathname === path;

  return (
    <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-primary">
              FourierFi
            </Link>
          </div>

          <nav className="flex items-center space-x-4">
            <Link
              href="/"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/') ? 'text-white' : 'text-gray-300 hover:text-white'
              }`}
            >
              Markets
            </Link>
            <Link
              href="/analysis"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/analysis') ? 'text-white' : 'text-gray-300 hover:text-white'
              }`}
            >
              Analysis
            </Link>
            <Link
              href="/trade"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/trade') ? 'text-white' : 'text-gray-300 hover:text-white'
              }`}
            >
              Trade
            </Link>
            <Link
              href="/settings"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/settings') ? 'text-white' : 'text-gray-300 hover:text-white'
              }`}
            >
              Settings
            </Link>

            <div className="ml-4">
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-300">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </span>
                  <button
                    onClick={disconnect}
                    className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={connect}
                  className="px-3 py-2 rounded-md text-sm font-medium bg-primary text-white hover:opacity-90 transition-opacity"
                >
                  Connect Wallet
                </button>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
} 