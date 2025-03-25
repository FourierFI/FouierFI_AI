import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PriceChart } from '@/components/PriceChart';

// Mock the useMarketData hook
jest.mock('@/hooks/useMarketData', () => ({
  useMarketData: () => ({
    price: 50000,
    isLoading: false,
    error: null,
  }),
}));

// Mock the useTechnicalIndicators hook
jest.mock('@/hooks/useTechnicalIndicators', () => ({
  useTechnicalIndicators: () => ({
    sma: 49000,
    rsi: 65,
    macd: {
      macd: 100,
      signal: 90,
      histogram: 10,
    },
    bollinger: {
      upper: 51000,
      middle: 50000,
      lower: 49000,
    },
    atr: 1000,
    kdj: {
      k: 70,
      d: 65,
      j: 75,
    },
  }),
}));

describe('PriceChart', () => {
  it('renders without crashing', () => {
    render(<PriceChart timeframe="1h" />);
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  it('displays loading state', () => {
    jest.spyOn(require('@/hooks/useMarketData'), 'useMarketData').mockImplementation(() => ({
      price: 0,
      isLoading: true,
      error: null,
    }));

    render(<PriceChart timeframe="1h" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('displays error state', () => {
    jest.spyOn(require('@/hooks/useMarketData'), 'useMarketData').mockImplementation(() => ({
      price: 0,
      isLoading: false,
      error: 'Failed to load data',
    }));

    render(<PriceChart timeframe="1h" />);
    expect(screen.getByText('Failed to load data')).toBeInTheDocument();
  });

  it('toggles technical indicators', () => {
    render(<PriceChart timeframe="1h" />);
    
    const smaCheckbox = screen.getByLabelText('SMA');
    const bollingerCheckbox = screen.getByLabelText('Bollinger Bands');
    const atrCheckbox = screen.getByLabelText('ATR');
    const kdjCheckbox = screen.getByLabelText('KDJ');

    expect(smaCheckbox).toBeChecked();
    expect(bollingerCheckbox).not.toBeChecked();
    expect(atrCheckbox).not.toBeChecked();
    expect(kdjCheckbox).not.toBeChecked();

    fireEvent.click(bollingerCheckbox);
    expect(bollingerCheckbox).toBeChecked();

    fireEvent.click(atrCheckbox);
    expect(atrCheckbox).toBeChecked();

    fireEvent.click(kdjCheckbox);
    expect(kdjCheckbox).toBeChecked();
  });
}); 