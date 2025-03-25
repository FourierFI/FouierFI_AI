declare module 'fft.js' {
  export class FFT {
    constructor(size: number);
    forward(buffer: number[]): number[];
    inverse(buffer: number[]): number[];
  }
} 