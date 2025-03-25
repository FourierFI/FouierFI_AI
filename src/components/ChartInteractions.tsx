import React, { useEffect, useRef, useState } from 'react';

interface ChartInteractionsProps {
  onZoom: (start: number, end: number) => void;
  onPan: (offset: number) => void;
  onTooltip: (x: number, y: number, data: any) => void;
  width: number;
  height: number;
  data: any[];
}

export function ChartInteractions({
  onZoom,
  onPan,
  onTooltip,
  width,
  height,
  data,
}: ChartInteractionsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [zoomStart, setZoomStart] = useState<number | null>(null);
  const [zoomEnd, setZoomEnd] = useState<number | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
    setStartY(e.clientY);
    setZoomStart(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;

    // If dragging horizontally, pan the chart
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      onPan(deltaX);
    }

    // If dragging vertically, zoom the chart
    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      setZoomEnd(e.clientX);
    }

    // Update tooltip
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const dataIndex = Math.floor((x / width) * data.length);
      if (dataIndex >= 0 && dataIndex < data.length) {
        onTooltip(x, y, data[dataIndex]);
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (zoomStart !== null && zoomEnd !== null) {
      const start = Math.min(zoomStart, zoomEnd);
      const end = Math.max(zoomStart, zoomEnd);
      onZoom(start, end);
      setZoomStart(null);
      setZoomEnd(null);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY;
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const x = e.clientX - rect.left;
      const zoomFactor = delta > 0 ? 0.9 : 1.1;
      onZoom(x * (1 - zoomFactor), x * (1 + zoomFactor));
    }
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        handleMouseUp();
      }
    };

    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [isDragging]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 cursor-crosshair"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
    >
      {zoomStart !== null && zoomEnd !== null && (
        <div
          className="absolute bg-primary/20 border border-primary"
          style={{
            left: Math.min(zoomStart, zoomEnd),
            top: 0,
            width: Math.abs(zoomEnd - zoomStart),
            height,
          }}
        />
      )}
    </div>
  );
} 