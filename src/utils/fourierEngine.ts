/**
 * FourierFi Signal Decomposition Engine
 * Implements advanced Fourier transform algorithms for financial time series analysis
 */

import * as tf from '@tensorflow/tfjs';

export interface TimeSeriesData {
  timestamp: number;
  price: number;
}

export interface FrequencyComponent {
  frequency: number;
  amplitude: number;
  phase: number;
}

export interface FourierAnalysisResult {
  frequencies: number[];
  amplitudes: number[];
  phases: number[];
  dominantFrequencies: number[];
  harmonicRelations: number[];
  phaseConsistency: number;
  seasonalStrength: number;
  components?: FrequencyComponent[];
  dominantCycles?: number[];
  trendStrength?: number;
  noiseLevel?: number;
}

export class FourierEngine {
  private windowSize: number;
  private samplingRate: number;

  constructor(windowSize: number = 1024, samplingRate: number = 1) {
    this.windowSize = windowSize;
    this.samplingRate = samplingRate;
  }

  // Perform Fast Fourier Transform
  public performFFT(data: TimeSeriesData[]): FourierAnalysisResult {
    // Prepare data
    const prices = data.map(d => d.price);
    const timestamps = data.map(d => d.timestamp);

    // Apply Hanning window to reduce spectral leakage
    const windowedData = this.applyHanningWindow(prices);

    // Create complex input for FFT (real and imaginary parts)
    const complexInput = new Float32Array(this.windowSize * 2);
    for (let i = 0; i < this.windowSize; i++) {
      complexInput[i * 2] = windowedData[i];     // Real part
      complexInput[i * 2 + 1] = 0;               // Imaginary part
    }

    // Execute FFT using TensorFlow.js
    const fftResult = tf.fft(tf.complex(
      tf.tensor1d(windowedData),
      tf.zeros([this.windowSize])
    ));

    // Calculate frequencies, amplitudes and phases
    const frequencies = this.calculateFrequencies();
    const amplitudes = this.calculateAmplitudes(fftResult);
    const phases = this.calculatePhases(fftResult);

    // Identify dominant frequencies
    const dominantFrequencies = this.identifyDominantFrequencies(frequencies, amplitudes);

    // Analyze harmonic relations
    const harmonicRelations = this.analyzeHarmonicRelations(dominantFrequencies);

    // Calculate phase consistency
    const phaseConsistency = this.calculatePhaseConsistency(phases);

    // Calculate seasonal strength
    const seasonalStrength = this.calculateSeasonalStrength(amplitudes, frequencies);

    // Clean up tensors
    fftResult.dispose();

    return {
      frequencies,
      amplitudes,
      phases,
      dominantFrequencies,
      harmonicRelations,
      phaseConsistency,
      seasonalStrength
    };
  }

  // Apply Hanning window
  private applyHanningWindow(data: number[]): number[] {
    return data.map((value, i) => {
      const multiplier = 0.5 * (1 - Math.cos(2 * Math.PI * i / (this.windowSize - 1)));
      return value * multiplier;
    });
  }

  // Calculate frequency array
  private calculateFrequencies(): number[] {
    return Array.from({ length: this.windowSize / 2 }, (_, i) => 
      i * this.samplingRate / this.windowSize
    );
  }

  // Calculate amplitudes
  private calculateAmplitudes(fftResult: tf.Tensor): number[] {
    const complexData = fftResult.arraySync() as number[];
    const amplitudes: number[] = [];
    
    for (let i = 0; i < this.windowSize / 2; i++) {
      const real = complexData[i * 2];
      const imag = complexData[i * 2 + 1];
      amplitudes.push(Math.sqrt(real * real + imag * imag));
    }
    
    return amplitudes;
  }

  // Calculate phases
  private calculatePhases(fftResult: tf.Tensor): number[] {
    const complexData = fftResult.arraySync() as number[];
    const phases: number[] = [];
    
    for (let i = 0; i < this.windowSize / 2; i++) {
      const real = complexData[i * 2];
      const imag = complexData[i * 2 + 1];
      phases.push(Math.atan2(imag, real));
    }
    
    return phases;
  }

  // Identify dominant frequencies
  private identifyDominantFrequencies(frequencies: number[], amplitudes: number[]): number[] {
    const threshold = Math.max(...amplitudes) * 0.1; // 10% of max amplitude
    return frequencies.filter((_, i) => amplitudes[i] > threshold);
  }

  // Analyze harmonic relations
  private analyzeHarmonicRelations(frequencies: number[]): number[] {
    const relations: number[] = [];
    for (let i = 0; i < frequencies.length; i++) {
      for (let j = i + 1; j < frequencies.length; j++) {
        const ratio = frequencies[j] / frequencies[i];
        if (Math.abs(ratio - Math.round(ratio)) < 0.1) {
          relations.push(ratio);
        }
      }
    }
    return relations;
  }

  // Calculate phase consistency
  private calculatePhaseConsistency(phases: number[]): number {
    const phaseDiffs = phases.slice(1).map((phase, i) => {
      let diff = Math.abs(phase - phases[i]);
      // Normalize phase difference to [0, π]
      if (diff > Math.PI) {
        diff = 2 * Math.PI - diff;
      }
      return diff;
    });
    
    // Calculate mean phase difference
    const meanDiff = phaseDiffs.reduce((a, b) => a + b, 0) / phaseDiffs.length;
    
    // Return consistency score (1 for perfect consistency, 0 for random phases)
    return 1 - (meanDiff / Math.PI);
  }

  // Calculate seasonal strength
  private calculateSeasonalStrength(amplitudes: number[], frequencies: number[]): number {
    const totalAmplitude = amplitudes.reduce((a, b) => a + b, 0);
    const seasonalAmplitude = amplitudes
      .filter((_, i) => frequencies[i] > 0.1) // Filter out very low frequencies
      .reduce((a, b) => a + b, 0);
    return seasonalAmplitude / totalAmplitude;
  }

  // Predict future prices
  public predictFuturePrices(
    data: TimeSeriesData[],
    dominantFrequencies: number[],
    phases: number[],
    timeSteps: number
  ): number[] {
    const predictions: number[] = [];
    const lastTime = data[data.length - 1].timestamp;
    
    for (let i = 0; i < timeSteps; i++) {
      let prediction = 0;
      for (let j = 0; j < dominantFrequencies.length; j++) {
        const time = lastTime + i;
        prediction += Math.cos(2 * Math.PI * dominantFrequencies[j] * time + phases[j]);
      }
      predictions.push(prediction);
    }
    
    return predictions;
  }
}

// Helper function to analyze time series data
export function analyzeTimeSeries(data: TimeSeriesData[]): FourierAnalysisResult {
  const engine = new FourierEngine();
  return engine.performFFT(data);
}

// Helper function to predict future values
export function predictFuture(
  analysis: FourierAnalysisResult,
  currentTime: number,
  horizons: number[]
): number[] {
  if (!analysis.dominantFrequencies || !analysis.phases) {
    return [];
  }

  const engine = new FourierEngine();
  return engine.predictFuturePrices(
    [{ timestamp: currentTime, price: 0 }],
    analysis.dominantFrequencies,
    analysis.phases,
    Math.max(...horizons)
  );
}

// Helper function to calculate current market cycle phase
export function calculatePhase(
  analysis: FourierAnalysisResult,
  currentTime: number
): number {
  if (!analysis.components || analysis.components.length === 0) {
    return 0;
  }

  const dominantComponent = analysis.components.reduce((a, b) => 
    a.amplitude > b.amplitude ? a : b
  );

  if (!dominantComponent) {
    return 0;
  }

  return (2 * Math.PI * dominantComponent.frequency * currentTime + dominantComponent.phase) % (2 * Math.PI);
}

// Helper function to detect regime changes
export function detectRegimeChange(
  previousAnalysis: FourierAnalysisResult,
  currentAnalysis: FourierAnalysisResult
): boolean {
  const threshold = 0.2; // 20% change threshold
  
  // Compare dominant frequencies
  const prevFreqs = new Set(previousAnalysis.dominantFrequencies);
  const currFreqs = new Set(currentAnalysis.dominantFrequencies);
  
  const freqChange = Math.abs(prevFreqs.size - currFreqs.size) / Math.max(prevFreqs.size, currFreqs.size);
  
  // Compare phase consistency
  const phaseChange = Math.abs(previousAnalysis.phaseConsistency - currentAnalysis.phaseConsistency);
  
  // Compare seasonal strength
  const seasonalChange = Math.abs(previousAnalysis.seasonalStrength - currentAnalysis.seasonalStrength);
  
  return freqChange > threshold || phaseChange > threshold || seasonalChange > threshold;
} 