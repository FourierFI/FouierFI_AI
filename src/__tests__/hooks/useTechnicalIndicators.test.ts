import { renderHook } from '@testing-library/react-hooks';
import { useTechnicalIndicators } from '@/hooks/useTechnicalIndicators';

describe('useTechnicalIndicators', () => {
  const mockData = [
    { price: 50000, high: 51000, low: 49000, close: 50000 },
    { price: 51000, high: 52000, low: 50000, close: 51000 },
    { price: 49000, high: 51000, low: 48000, close: 49000 },
    { price: 50000, high: 51000, low: 49000, close: 50000 },
    { price: 51000, high: 52000, low: 50000, close: 51000 },
  ];

  it('should calculate SMA correctly', () => {
    const { result } = renderHook(() => useTechnicalIndicators(mockData, { period: 3 }));

    expect(result.current.sma).toBe(50000); // (51000 + 49000 + 50000) / 3
  });

  it('should calculate Bollinger Bands correctly', () => {
    const { result } = renderHook(() => useTechnicalIndicators(mockData, { period: 3 }));

    expect(result.current.bollinger).toBeDefined();
    expect(result.current.bollinger.upper).toBeGreaterThan(result.current.bollinger.middle);
    expect(result.current.bollinger.middle).toBeGreaterThan(result.current.bollinger.lower);
  });

  it('should calculate ATR correctly', () => {
    const { result } = renderHook(() => useTechnicalIndicators(mockData, { period: 3 }));

    expect(result.current.atr).toBeGreaterThan(0);
  });

  it('should calculate KDJ correctly', () => {
    const { result } = renderHook(() => useTechnicalIndicators(mockData, { period: 3 }));

    expect(result.current.kdj).toBeDefined();
    expect(result.current.kdj.k).toBeGreaterThanOrEqual(0);
    expect(result.current.kdj.d).toBeGreaterThanOrEqual(0);
    expect(result.current.kdj.j).toBeGreaterThanOrEqual(0);
  });

  it('should handle empty data array', () => {
    const { result } = renderHook(() => useTechnicalIndicators([], { period: 3 }));

    expect(result.current.sma).toBe(0);
    expect(result.current.bollinger).toBeUndefined();
    expect(result.current.atr).toBe(0);
    expect(result.current.kdj).toBeUndefined();
  });

  it('should handle data with missing values', () => {
    const incompleteData = [
      { price: 50000 },
      { price: 51000, high: 52000 },
      { price: 49000, low: 48000 },
      { price: 50000, close: 50000 },
      { price: 51000 },
    ];

    const { result } = renderHook(() => useTechnicalIndicators(incompleteData, { period: 3 }));

    expect(result.current.sma).toBe(50000);
    expect(result.current.bollinger).toBeUndefined();
    expect(result.current.atr).toBe(0);
    expect(result.current.kdj).toBeUndefined();
  });
}); 