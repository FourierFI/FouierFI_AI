import * as tf from '@tensorflow/tfjs';
import { FrequencyComponent, FourierAnalysisResult } from './fourierEngine';

export interface NeuralPrediction {
  predictedPrice: number;
  confidence: number;
  supportingFactors: string[];
}

export interface ModelMetrics {
  accuracy: number;
  loss: number;
  epochsTrained: number;
}

export class NeuralSpectrum {
  private model: tf.LayersModel | null = null;
  private normalizer: tf.LayersModel | null = null;
  private metrics: ModelMetrics = {
    accuracy: 0,
    loss: 0,
    epochsTrained: 0
  };

  /**
   * Initializes the neural network architecture
   */
  async initialize() {
    // Input layer for frequency components
    const input = tf.input({ shape: [20, 3] }); // 20 components, 3 features each (freq, amp, phase)

    // Normalization layer
    const normalized = tf.layers.batchNormalization().apply(input);

    // Convolutional layers for pattern detection
    const conv1 = tf.layers.conv1d({
      filters: 64,
      kernelSize: 3,
      activation: 'relu'
    }).apply(normalized);

    const pool1 = tf.layers.maxPooling1d({ poolSize: 2 }).apply(conv1);

    const conv2 = tf.layers.conv1d({
      filters: 128,
      kernelSize: 3,
      activation: 'relu'
    }).apply(pool1);

    const pool2 = tf.layers.maxPooling1d({ poolSize: 2 }).apply(conv2);

    // Flatten for dense layers
    const flattened = tf.layers.flatten().apply(pool2);

    // Dense layers for prediction
    const dense1 = tf.layers.dense({
      units: 256,
      activation: 'relu'
    }).apply(flattened);

    const dropout1 = tf.layers.dropout({ rate: 0.5 }).apply(dense1);

    const dense2 = tf.layers.dense({
      units: 128,
      activation: 'relu'
    }).apply(dropout1);

    const dropout2 = tf.layers.dropout({ rate: 0.3 }).apply(dense2);

    // Output layer
    const output = tf.layers.dense({
      units: 1,
      activation: 'linear'
    }).apply(dropout2);

    // Create and compile model
    this.model = tf.model({ inputs: input, outputs: output as tf.SymbolicTensor });
    
    this.model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['accuracy']
    });
  }

  /**
   * Trains the model on historical data
   */
  async train(
    historicalAnalyses: FourierAnalysisResult[],
    actualPrices: number[],
    epochs: number = 100
  ) {
    if (!this.model) {
      throw new Error('Model not initialized');
    }

    // Prepare training data
    const trainingData = this.prepareTrainingData(historicalAnalyses);
    const trainingLabels = tf.tensor2d(actualPrices.map(p => [p]));

    // Train the model
    const history = await this.model.fit(trainingData, trainingLabels, {
      epochs,
      validationSplit: 0.2,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          if (logs) {
            this.metrics = {
              accuracy: logs.accuracy,
              loss: logs.loss,
              epochsTrained: epoch + 1
            };
          }
        }
      }
    });

    return history;
  }

  /**
   * Makes predictions using the trained model
   */
  async predict(analysis: FourierAnalysisResult): Promise<NeuralPrediction> {
    if (!this.model) {
      throw new Error('Model not initialized');
    }

    // Prepare input data
    const inputData = this.prepareTrainingData([analysis]);

    // Make prediction
    const prediction = await this.model.predict(inputData) as tf.Tensor;
    const predictedValue = (await prediction.data())[0];

    // Calculate confidence based on model metrics
    const confidence = Math.max(0, 1 - this.metrics.loss);

    // Determine supporting factors
    const supportingFactors = this.analyzeSupportingFactors(analysis);

    return {
      predictedPrice: predictedValue,
      confidence,
      supportingFactors
    };
  }

  /**
   * Prepares training data from Fourier analysis results
   */
  private prepareTrainingData(analyses: FourierAnalysisResult[]): tf.Tensor3D {
    const data: number[][][] = analyses.map(analysis => {
      return analysis.components.map(component => [
        component.frequency,
        component.amplitude,
        component.phase
      ]);
    });

    return tf.tensor3d(data);
  }

  /**
   * Analyzes factors supporting the prediction
   */
  private analyzeSupportingFactors(analysis: FourierAnalysisResult): string[] {
    const factors: string[] = [];

    // Check trend strength
    if (analysis.trendStrength > 0.7) {
      factors.push('Strong trend detected');
    }

    // Check noise level
    if (analysis.noiseLevel < 0.3) {
      factors.push('Low noise in signal');
    }

    // Check dominant cycles
    if (analysis.dominantCycles.length > 0) {
      factors.push(`Primary cycle: ${Math.round(analysis.dominantCycles[0])} units`);
    }

    return factors;
  }

  /**
   * Saves the trained model
   */
  async saveModel(path: string) {
    if (!this.model) {
      throw new Error('Model not initialized');
    }
    await this.model.save(`file://${path}`);
  }

  /**
   * Loads a pre-trained model
   */
  async loadModel(path: string) {
    this.model = await tf.loadLayersModel(`file://${path}`);
    this.model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['accuracy']
    });
  }
} 