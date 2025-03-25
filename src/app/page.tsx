import React from 'react';
import { MarketData } from '@/components/MarketData';
import { FourierAnalysis } from '@/components/FourierAnalysis';
import { Navbar } from '@/components/Navbar';

export default function Home() {
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
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-semibold mb-4">Fourier Analysis</h2>
              <FourierAnalysis />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 