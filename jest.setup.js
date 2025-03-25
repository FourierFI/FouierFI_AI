import '@testing-library/jest-dom';

// Mock WebSocket
class WebSocket {
  constructor(url) {
    this.url = url;
    this.readyState = 0;
    this.onmessage = null;
    this.onopen = null;
    this.onclose = null;
    this.onerror = null;
  }

  send(data) {
    // Mock implementation
  }

  close() {
    this.readyState = 2;
    if (this.onclose) {
      this.onclose();
    }
  }
}

global.WebSocket = WebSocket;

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}; 