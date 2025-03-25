import { FourierEngine, TimeSeriesData } from '../fourierEngine';

describe('FourierEngine', () => {
  let engine: FourierEngine;

  beforeEach(() => {
    engine = new FourierEngine(1024, 1);
  });

  test('should perform FFT on time series data', () => {
    // Generate sample data with a known frequency
    const data: TimeSeriesData[] = Array.from({ length: 1024 }, (_, i) => ({
      timestamp: i,
      price: Math.sin(2 * Math.PI * 0.1 * i)
    }));

    const result = engine.performFFT(data);

    // Check if we have the expected number of frequencies
    expect(result.frequencies.length).toBe(512); // Half of window size
    expect(result.amplitudes.length).toBe(512);
    expect(result.phases.length).toBe(512);

    // Check if we can identify the dominant frequency
    const dominantFreqIndex = result.amplitudes.indexOf(Math.max(...result.amplitudes));
    expect(Math.abs(result.frequencies[dominantFreqIndex] - 0.1)).toBeLessThan(0.01);
  });

  test('should predict future prices', () => {
    // Generate sample data
    const data: TimeSeriesData[] = Array.from({ length: 1024 }, (_, i) => ({
      timestamp: i,
      price: Math.sin(2 * Math.PI * 0.1 * i)
    }));

    const result = engine.performFFT(data);
    const predictions = engine.predictFuturePrices(
      data,
      result.dominantFrequencies,
      result.phases,
      10
    );

    expect(predictions.length).toBe(10);
    expect(predictions.every(p => typeof p === 'number')).toBe(true);
  });

  test('should calculate phase consistency', () => {
    const data: TimeSeriesData[] = Array.from({ length: 1024 }, (_, i) => ({
      timestamp: i,
      price: Math.sin(2 * Math.PI * 0.1 * i)
    }));

    const result = engine.performFFT(data);
    expect(result.phaseConsistency).toBeGreaterThan(0);
    expect(result.phaseConsistency).toBeLessThanOrEqual(1);
  });

  test('should calculate seasonal strength', () => {
    const data: TimeSeriesData[] = Array.from({ length: 1024 }, (_, i) => ({
      timestamp: i,
      price: Math.sin(2 * Math.PI * 0.1 * i)
    }));

    const result = engine.performFFT(data);
    expect(result.seasonalStrength).toBeGreaterThan(0);
    expect(result.seasonalStrength).toBeLessThanOrEqual(1);
  });

  test('should analyze harmonic relations', () => {
    const data: TimeSeriesData[] = Array.from({ length: 1024 }, (_, i) => ({
      timestamp: i,
      price: Math.sin(2 * Math.PI * 0.1 * i) + Math.sin(2 * Math.PI * 0.2 * i)
    }));

    const result = engine.performFFT(data);
    expect(result.harmonicRelations.length).toBeGreaterThan(0);
    expect(result.harmonicRelations.every(r => r > 0)).toBe(true);
  });
}); 