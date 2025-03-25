import { ethers } from 'ethers';
import { FFToken__factory, StrategyNFT__factory, HarmonicPool__factory, FourierFi__factory } from '../types/contracts';

export interface ContractAddresses {
  ffToken: string;
  strategyNFT: string;
  harmonicPool: string;
  fourierFi: string;
}

export class ContractInterface {
  private provider: ethers.Provider;
  private signer: ethers.Signer;
  private addresses: ContractAddresses;

  constructor(
    provider: ethers.Provider,
    signer: ethers.Signer,
    addresses: ContractAddresses
  ) {
    this.provider = provider;
    this.signer = signer;
    this.addresses = addresses;
  }

  /**
   * FF Token Functions
   */
  async getFFBalance(address: string): Promise<bigint> {
    const token = FFToken__factory.connect(this.addresses.ffToken, this.provider);
    return await token.balanceOf(address);
  }

  async approveFF(spender: string, amount: bigint): Promise<ethers.TransactionResponse> {
    const token = FFToken__factory.connect(this.addresses.ffToken, this.signer);
    return await token.approve(spender, amount);
  }

  /**
   * Strategy NFT Functions
   */
  async createStrategy(
    name: string,
    description: string,
    performanceFee: number
  ): Promise<ethers.TransactionResponse> {
    const nft = StrategyNFT__factory.connect(this.addresses.strategyNFT, this.signer);
    return await nft.createStrategy(name, description, performanceFee);
  }

  async getStrategy(tokenId: number): Promise<{
    name: string;
    description: string;
    creator: string;
    performanceFee: number;
    active: boolean;
  }> {
    const nft = StrategyNFT__factory.connect(this.addresses.strategyNFT, this.provider);
    return await nft.strategies(tokenId);
  }

  /**
   * Harmonic Pool Functions
   */
  async createPool(
    token0: string,
    token1: string
  ): Promise<ethers.TransactionResponse> {
    const pool = HarmonicPool__factory.connect(this.addresses.harmonicPool, this.signer);
    return await pool.createPool(token0, token1);
  }

  async addLiquidity(
    token0: string,
    token1: string,
    amount0: bigint,
    amount1: bigint
  ): Promise<ethers.TransactionResponse> {
    const pool = HarmonicPool__factory.connect(this.addresses.harmonicPool, this.signer);
    return await pool.addLiquidity(token0, token1, amount0, amount1);
  }

  async removeLiquidity(
    token0: string,
    token1: string,
    shares: bigint
  ): Promise<ethers.TransactionResponse> {
    const pool = HarmonicPool__factory.connect(this.addresses.harmonicPool, this.signer);
    return await pool.removeLiquidity(token0, token1, shares);
  }

  /**
   * FourierFi Protocol Functions
   */
  async stake(amount: bigint): Promise<ethers.TransactionResponse> {
    const protocol = FourierFi__factory.connect(this.addresses.fourierFi, this.signer);
    return await protocol.stake(amount);
  }

  async unstake(): Promise<ethers.TransactionResponse> {
    const protocol = FourierFi__factory.connect(this.addresses.fourierFi, this.signer);
    return await protocol.unstake();
  }

  async getStakedAmount(address: string): Promise<bigint> {
    const protocol = FourierFi__factory.connect(this.addresses.fourierFi, this.provider);
    return await protocol.stakedAmount(address);
  }

  async calculateRewards(address: string): Promise<bigint> {
    const protocol = FourierFi__factory.connect(this.addresses.fourierFi, this.provider);
    return await protocol.calculateRewards(address);
  }

  async getStrategyPerformance(strategyId: number): Promise<bigint> {
    const protocol = FourierFi__factory.connect(this.addresses.fourierFi, this.provider);
    return await protocol.strategyPerformance(strategyId);
  }

  /**
   * Helper Functions
   */
  async waitForTransaction(tx: ethers.TransactionResponse): Promise<ethers.TransactionReceipt> {
    return await tx.wait();
  }

  async getGasPrice(): Promise<bigint> {
    return await this.provider.getFeeData().then(data => data.gasPrice ?? 0n);
  }

  async estimateGas(tx: ethers.TransactionRequest): Promise<bigint> {
    return await this.provider.estimateGas(tx);
  }
} 