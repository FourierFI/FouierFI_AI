import React from 'react';
import { TradingInterface } from '@/components/TradingInterface';
import { MarketData } from '@/components/MarketData';
import { Positions } from '@/components/Positions';
import { Navbar } from '@/components/Navbar';

export default function TradePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-semibold mb-4">Market Overview</h2>
              <MarketData />
            </div>
          </div>
          <div className="lg:col-span-4">
            <div className="space-y-6">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
                <h2 className="text-xl font-semibold mb-4">Trading Interface</h2>
                <TradingInterface />
              </div>
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
                <h2 className="text-xl font-semibold mb-4">Positions</h2>
                <Positions />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 