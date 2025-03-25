import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { analyzeTimeSeries, predictFuture, calculatePhase } from '@/utils/fourierEngine';
import type { TimeSeriesData, FourierAnalysisResult } from '@/utils/fourierEngine';

interface SpectrumDashboardProps {
  data: TimeSeriesData[];
  onPredictionGenerated?: (predictions: number[]) => void;
}

export function SpectrumDashboard({ data, onPredictionGenerated }: SpectrumDashboardProps) {
  const [analysis, setAnalysis] = useState<FourierAnalysisResult | null>(null);
  const [predictions, setPredictions] = useState<number[]>([]);
  const [currentPhase, setCurrentPhase] = useState<number>(0);

  useEffect(() => {
    if (data.length > 0) {
      // Perform Fourier analysis
      const result = analyzeTimeSeries(data);
      setAnalysis(result);

      // Generate predictions
      const currentTime = data[data.length - 1].timestamp;
      const horizons = Array.from({ length: 10 }, (_, i) => i + 1);
      const futurePrices = predictFuture(result, currentTime, horizons);
      setPredictions(futurePrices);
      onPredictionGenerated?.(futurePrices);

      // Calculate current market phase
      const phase = calculatePhase(result, currentTime);
      setCurrentPhase(phase);
    }
  }, [data, onPredictionGenerated]);

  const chartData = React.useMemo(() => {
    if (!data || !predictions) return [];

    const historicalData = data.map(d => ({
      timestamp: new Date(d.timestamp * 1000).toLocaleDateString(),
      price: d.price,
      type: 'historical'
    }));

    const lastPrice = data[data.length - 1].price;
    const predictionData = predictions.map((p, i) => ({
      timestamp: new Date((data[data.length - 1].timestamp + (i + 1) * 86400) * 1000).toLocaleDateString(),
      price: lastPrice + p,
      type: 'prediction'
    }));

    return [...historicalData, ...predictionData];
  }, [data, predictions]);

  return (
    <div className="card p-6">
      <h2 className="text-2xl font-bold mb-6">Spectrum Analytics Dashboard</h2>

      {/* Price Chart */}
      <div className="h-96 mb-8">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="timestamp"
              tick={{ fill: '#9CA3AF' }}
              tickLine={{ stroke: '#9CA3AF' }}
            />
            <YAxis
              tick={{ fill: '#9CA3AF' }}
              tickLine={{ stroke: '#9CA3AF' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2833',
                border: '1px solid #374151'
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#D9A91A"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Analysis Results */}
      {analysis && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Dominant Cycles */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 text-primary">
              Dominant Cycles
            </h3>
            <ul className="space-y-2">
              {analysis.dominantCycles.map((cycle, i) => (
                <li key={i} className="text-gray-300">
                  {Math.round(cycle)} units
                </li>
              ))}
            </ul>
          </div>

          {/* Market Phase */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 text-primary">
              Market Phase
            </h3>
            <div className="flex items-center space-x-4">
              <div className="w-24 h-24 relative">
                <div
                  className="w-2 h-12 bg-secondary absolute left-1/2 top-1/2 -translate-y-1/2"
                  style={{
                    transform: `rotate(${currentPhase}rad) translateY(-50%)`
                  }}
                />
              </div>
              <div className="text-gray-300">
                {getPhaseDescription(currentPhase)}
              </div>
            </div>
          </div>

          {/* Signal Metrics */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 text-primary">
              Signal Metrics
            </h3>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-400">Trend Strength</div>
                <div className="text-xl">
                  {Math.round(analysis.trendStrength * 100)}%
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Noise Level</div>
                <div className="text-xl">
                  {Math.round(analysis.noiseLevel * 100)}%
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getPhaseDescription(phase: number): string {
  const normalizedPhase = phase / (2 * Math.PI);
  if (normalizedPhase < 0.25) return 'Accumulation';
  if (normalizedPhase < 0.5) return 'Markup';
  if (normalizedPhase < 0.75) return 'Distribution';
  return 'Markdown';
} 