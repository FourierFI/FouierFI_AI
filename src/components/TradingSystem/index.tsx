import React, { useState, useEffect } from 'react';
import { NeuralSpectrum, NeuralPrediction } from '@/utils/neuralSpectrum';
import { TimeSeriesData, FourierAnalysisResult } from '@/utils/fourierEngine';
import { ContractInterface } from '@/utils/contractInterface';

interface TradingSystemProps {
  data: TimeSeriesData[];
  analysis: FourierAnalysisResult;
  contractInterface: ContractInterface;
}

export function TradingSystem({ data, analysis, contractInterface }: TradingSystemProps) {
  const [neuralSystem] = useState(() => new NeuralSpectrum());
  const [prediction, setPrediction] = useState<NeuralPrediction | null>(null);
  const [isTraining, setIsTraining] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState<number | null>(null);
  const [orderSize, setOrderSize] = useState<string>('');

  useEffect(() => {
    async function initializeSystem() {
      await neuralSystem.initialize();
      const historicalData = data.slice(0, -10); // Use last 10 points for validation
      const actualPrices = historicalData.map(d => d.price);
      
      setIsTraining(true);
      await neuralSystem.train(
        Array(historicalData.length).fill(analysis),
        actualPrices
      );
      setIsTraining(false);

      const latestPrediction = await neuralSystem.predict(analysis);
      setPrediction(latestPrediction);
    }

    initializeSystem();
  }, [data, analysis, neuralSystem]);

  const handleStrategySelect = async (strategyId: number) => {
    setSelectedStrategy(strategyId);
    const performance = await contractInterface.getStrategyPerformance(strategyId);
    console.log('Strategy Performance:', performance.toString());
  };

  const handleTrade = async (action: 'buy' | 'sell') => {
    if (!prediction || !orderSize || !selectedStrategy) return;

    try {
      const amount = BigInt(Math.floor(parseFloat(orderSize) * 1e18));
      
      if (action === 'buy') {
        // Implement buy logic using smart contracts
        console.log('Executing buy order:', amount.toString());
      } else {
        // Implement sell logic using smart contracts
        console.log('Executing sell order:', amount.toString());
      }
    } catch (error) {
      console.error('Trade execution failed:', error);
    }
  };

  return (
    <div className="card p-6">
      <h2 className="text-2xl font-bold mb-6">FourierFi Pulse Trading System</h2>

      {/* Prediction Display */}
      {prediction && (
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card bg-background-dark">
              <h3 className="text-lg font-semibold mb-4 text-primary">
                Price Prediction
              </h3>
              <div className="text-3xl font-bold text-secondary">
                {prediction.predictedPrice.toFixed(2)}
              </div>
              <div className="text-sm text-gray-400 mt-2">
                Confidence: {(prediction.confidence * 100).toFixed(1)}%
              </div>
            </div>

            <div className="card bg-background-dark">
              <h3 className="text-lg font-semibold mb-4 text-primary">
                Supporting Factors
              </h3>
              <ul className="space-y-2">
                {prediction.supportingFactors.map((factor, i) => (
                  <li key={i} className="text-gray-300">
                    • {factor}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Trading Interface */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-4 text-primary">
            Trading Controls
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Order Size
              </label>
              <input
                type="number"
                value={orderSize}
                onChange={(e) => setOrderSize(e.target.value)}
                className="input w-full"
                placeholder="Enter amount..."
              />
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => handleTrade('buy')}
                className="btn-primary flex-1"
                disabled={isTraining || !prediction}
              >
                Buy
              </button>
              <button
                onClick={() => handleTrade('sell')}
                className="btn-secondary flex-1"
                disabled={isTraining || !prediction}
              >
                Sell
              </button>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4 text-primary">
            Active Strategies
          </h3>
          <div className="space-y-2">
            {[1, 2, 3].map((strategyId) => (
              <button
                key={strategyId}
                onClick={() => handleStrategySelect(strategyId)}
                className={`w-full p-4 rounded-lg transition-colors ${
                  selectedStrategy === strategyId
                    ? 'bg-primary text-white'
                    : 'bg-background-dark text-gray-300 hover:bg-background-light'
                }`}
              >
                Strategy #{strategyId}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Training Status */}
      {isTraining && (
        <div className="mt-6 text-center text-gray-400">
          Training neural network... Please wait.
        </div>
      )}
    </div>
  );
} 