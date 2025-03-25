import React, { useEffect, useState } from 'react';
import { useHistoricalData } from '@/hooks/useMarketData';
import { FourierEngine, FourierAnalysisResult } from '@/utils/fourierEngine';
import { config } from '@/config';

export function FourierAnalysis() {
  const [analysis, setAnalysis] = useState<FourierAnalysisResult | null>(null);
  
  const { data: historicalData, loading, error } = useHistoricalData({
    symbol: config.marketData.defaultSymbol,
    interval: config.marketData.defaultInterval,
    limit: config.fourier.windowSize,
  });

  useEffect(() => {
    if (historicalData && historicalData.length > 0) {
      const engine = new FourierEngine(
        config.fourier.windowSize,
        config.fourier.samplingRate
      );
      
      const timeSeriesData = historicalData.map(item => ({
        timestamp: item.timestamp,
        price: item.close,
      }));
      
      const result = engine.performFFT(timeSeriesData);
      setAnalysis(result);
    }
  }, [historicalData]);

  if (loading) {
    return <div>Loading analysis...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!analysis) {
    return <div>No analysis available</div>;
  }

  // Find dominant cycles in days
  const dominantCycles = analysis.dominantFrequencies.map(freq => 
    (1 / freq / 24).toFixed(1)
  );

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Dominant Cycles</h3>
        <div className="grid grid-cols-2 gap-4">
          {dominantCycles.map((cycle, i) => (
            <div key={i} className="bg-gray-700/50 rounded p-3">
              <div className="text-sm text-gray-400">Cycle {i + 1}</div>
              <div className="text-lg font-semibold">{cycle} days</div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-2">Market State</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-700/50 rounded p-3">
            <div className="text-sm text-gray-400">Phase Consistency</div>
            <div className="text-lg font-semibold">
              {(analysis.phaseConsistency * 100).toFixed(1)}%
            </div>
          </div>
          <div className="bg-gray-700/50 rounded p-3">
            <div className="text-sm text-gray-400">Seasonal Strength</div>
            <div className="text-lg font-semibold">
              {(analysis.seasonalStrength * 100).toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-2">Harmonic Relations</h3>
        <div className="bg-gray-700/50 rounded p-3">
          {analysis.harmonicRelations.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {analysis.harmonicRelations.map((ratio, i) => (
                <div key={i} className="text-sm bg-gray-600/50 rounded px-2 py-1">
                  {ratio.toFixed(2)}x
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-400">No significant harmonic relations found</div>
          )}
        </div>
      </div>
    </div>
  );
} 