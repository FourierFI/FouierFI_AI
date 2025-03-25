import React, { useState } from 'react';

interface DataExportProps {
  data: Array<{
    timestamp: number;
    price: number;
    volume: number;
  }>;
  indicators?: {
    sma?: number;
    ema?: number;
    rsi?: number;
    macd?: number;
    signal?: number;
    histogram?: number;
    upperBand?: number;
    lowerBand?: number;
    volumeSMA?: number;
  };
}

export function DataExport({ data, indicators }: DataExportProps) {
  const [format, setFormat] = useState<'csv' | 'json'>('csv');
  const [includeIndicators, setIncludeIndicators] = useState(true);

  const exportData = () => {
    if (format === 'csv') {
      const headers = ['Timestamp', 'Price', 'Volume'];
      if (includeIndicators && indicators) {
        headers.push(
          'SMA',
          'EMA',
          'RSI',
          'MACD',
          'Signal',
          'Histogram',
          'Upper Band',
          'Lower Band',
          'Volume SMA'
        );
      }

      const rows = data.map((d, i) => {
        const row = [
          new Date(d.timestamp).toISOString(),
          d.price.toString(),
          d.volume.toString(),
        ];

        if (includeIndicators && indicators) {
          row.push(
            indicators.sma?.toString() || '',
            indicators.ema?.toString() || '',
            indicators.rsi?.toString() || '',
            indicators.macd?.toString() || '',
            indicators.signal?.toString() || '',
            indicators.histogram?.toString() || '',
            indicators.upperBand?.toString() || '',
            indicators.lowerBand?.toString() || '',
            indicators.volumeSMA?.toString() || ''
          );
        }

        return row.join(',');
      });

      const csv = [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `market-data-${new Date().toISOString()}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } else {
      const jsonData = data.map((d, i) => ({
        timestamp: d.timestamp,
        price: d.price,
        volume: d.volume,
        ...(includeIndicators && indicators ? {
          sma: indicators.sma,
          ema: indicators.ema,
          rsi: indicators.rsi,
          macd: indicators.macd,
          signal: indicators.signal,
          histogram: indicators.histogram,
          upperBand: indicators.upperBand,
          lowerBand: indicators.lowerBand,
          volumeSMA: indicators.volumeSMA,
        } : {}),
      }));

      const json = JSON.stringify(jsonData, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `market-data-${new Date().toISOString()}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="flex items-center space-x-4">
      <select
        value={format}
        onChange={(e) => setFormat(e.target.value as 'csv' | 'json')}
        className="bg-gray-700 text-white rounded px-3 py-1"
      >
        <option value="csv">CSV</option>
        <option value="json">JSON</option>
      </select>
      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={includeIndicators}
          onChange={(e) => setIncludeIndicators(e.target.checked)}
          className="form-checkbox h-4 w-4 text-primary"
        />
        <span className="text-sm text-gray-300">Include Indicators</span>
      </label>
      <button
        onClick={exportData}
        className="bg-primary text-white px-4 py-1 rounded hover:bg-primary/90"
      >
        Export Data
      </button>
    </div>
  );
} 