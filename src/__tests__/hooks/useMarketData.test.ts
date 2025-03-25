import { renderHook, act } from '@testing-library/react-hooks';
import { useMarketData } from '@/hooks/useMarketData';

// Mock WebSocket
const mockWebSocket = {
  send: jest.fn(),
  close: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  readyState: 0,
};

global.WebSocket = jest.fn(() => mockWebSocket as any);

describe('useMarketData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useMarketData());

    expect(result.current.price).toBe(0);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBe(null);
  });

  it('should connect to WebSocket on mount', () => {
    renderHook(() => useMarketData());

    expect(WebSocket).toHaveBeenCalledWith('wss://api.fourierfi.com/ws');
    expect(mockWebSocket.addEventListener).toHaveBeenCalledWith('open', expect.any(Function));
    expect(mockWebSocket.addEventListener).toHaveBeenCalledWith('message', expect.any(Function));
    expect(mockWebSocket.addEventListener).toHaveBeenCalledWith('error', expect.any(Function));
    expect(mockWebSocket.addEventListener).toHaveBeenCalledWith('close', expect.any(Function));
  });

  it('should update price on message', () => {
    const { result } = renderHook(() => useMarketData());

    // Simulate WebSocket message
    const messageEvent = new MessageEvent('message', {
      data: JSON.stringify({
        price: 50000,
        change24h: 2.5,
        high24h: 51000,
        low24h: 49000,
      }),
    });

    act(() => {
      const messageHandler = mockWebSocket.addEventListener.mock.calls.find(
        call => call[0] === 'message'
      )[1];
      messageHandler(messageEvent);
    });

    expect(result.current.price).toBe(50000);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should handle WebSocket error', () => {
    const { result } = renderHook(() => useMarketData());

    // Simulate WebSocket error
    act(() => {
      const errorHandler = mockWebSocket.addEventListener.mock.calls.find(
        call => call[0] === 'error'
      )[1];
      errorHandler(new Error('WebSocket error'));
    });

    expect(result.current.error).toBe('WebSocket error');
    expect(result.current.isLoading).toBe(false);
  });

  it('should reconnect on WebSocket close', () => {
    jest.useFakeTimers();

    const { result } = renderHook(() => useMarketData());

    // Simulate WebSocket close
    act(() => {
      const closeHandler = mockWebSocket.addEventListener.mock.calls.find(
        call => call[0] === 'close'
      )[1];
      closeHandler();
    });

    expect(result.current.error).toBe('WebSocket connection closed');
    expect(result.current.isLoading).toBe(false);

    // Fast forward reconnection delay
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(WebSocket).toHaveBeenCalledTimes(2);

    jest.useRealTimers();
  });
}); 