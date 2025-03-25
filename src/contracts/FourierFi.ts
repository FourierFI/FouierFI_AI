import { ethers } from 'ethers';

export const FOURIER_FI_ABI = [
  // FF Token
  'function balanceOf(address) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  
  // Trading
  'function placeOrder(uint256 amount, uint256 price, bool isBuy) returns (uint256)',
  'function cancelOrder(uint256 orderId) returns (bool)',
  'function getOrder(uint256 orderId) view returns (tuple(uint256 amount, uint256 price, bool isBuy, address trader, bool active))',
  'function getOrdersByTrader(address trader) view returns (uint256[])',
  
  // Harmonic Pools
  'function deposit(uint256 amount) returns (bool)',
  'function withdraw(uint256 amount) returns (bool)',
  'function getPoolBalance(address user) view returns (uint256)',
  'function getPoolAPY() view returns (uint256)',
  
  // Events
  'event OrderPlaced(uint256 indexed orderId, address indexed trader, uint256 amount, uint256 price, bool isBuy)',
  'event OrderCancelled(uint256 indexed orderId, address indexed trader)',
  'event OrderFilled(uint256 indexed orderId, address indexed buyer, address indexed seller, uint256 amount, uint256 price)',
  'event PoolDeposit(address indexed user, uint256 amount)',
  'event PoolWithdraw(address indexed user, uint256 amount)',
];

export class FourierFiContract {
  private contract: ethers.Contract;
  private signer: ethers.JsonRpcSigner;

  constructor(
    address: string,
    provider: ethers.BrowserProvider,
    signer: ethers.JsonRpcSigner
  ) {
    this.contract = new ethers.Contract(address, FOURIER_FI_ABI, provider);
    this.signer = signer;
  }

  // FF Token Methods
  async getBalance(address: string): Promise<bigint> {
    return await this.contract.balanceOf(address);
  }

  async transfer(to: string, amount: bigint): Promise<boolean> {
    const tx = await this.contract.connect(this.signer).transfer(to, amount);
    await tx.wait();
    return true;
  }

  async approve(spender: string, amount: bigint): Promise<boolean> {
    const tx = await this.contract.connect(this.signer).approve(spender, amount);
    await tx.wait();
    return true;
  }

  async getAllowance(owner: string, spender: string): Promise<bigint> {
    return await this.contract.allowance(owner, spender);
  }

  // Trading Methods
  async placeOrder(amount: bigint, price: bigint, isBuy: boolean): Promise<bigint> {
    const tx = await this.contract.connect(this.signer).placeOrder(amount, price, isBuy);
    const receipt = await tx.wait();
    const event = receipt.logs.find((log: any) => log.eventName === 'OrderPlaced');
    return event.args.orderId;
  }

  async cancelOrder(orderId: bigint): Promise<boolean> {
    const tx = await this.contract.connect(this.signer).cancelOrder(orderId);
    await tx.wait();
    return true;
  }

  async getOrder(orderId: bigint): Promise<{
    amount: bigint;
    price: bigint;
    isBuy: boolean;
    trader: string;
    active: boolean;
  }> {
    return await this.contract.getOrder(orderId);
  }

  async getOrdersByTrader(trader: string): Promise<bigint[]> {
    return await this.contract.getOrdersByTrader(trader);
  }

  // Harmonic Pools Methods
  async deposit(amount: bigint): Promise<boolean> {
    const tx = await this.contract.connect(this.signer).deposit(amount);
    await tx.wait();
    return true;
  }

  async withdraw(amount: bigint): Promise<boolean> {
    const tx = await this.contract.connect(this.signer).withdraw(amount);
    await tx.wait();
    return true;
  }

  async getPoolBalance(user: string): Promise<bigint> {
    return await this.contract.getPoolBalance(user);
  }

  async getPoolAPY(): Promise<bigint> {
    return await this.contract.getPoolAPY();
  }

  // Event Listeners
  onOrderPlaced(callback: (orderId: bigint, trader: string, amount: bigint, price: bigint, isBuy: boolean) => void) {
    this.contract.on('OrderPlaced', callback);
  }

  onOrderCancelled(callback: (orderId: bigint, trader: string) => void) {
    this.contract.on('OrderCancelled', callback);
  }

  onOrderFilled(callback: (orderId: bigint, buyer: string, seller: string, amount: bigint, price: bigint) => void) {
    this.contract.on('OrderFilled', callback);
  }

  onPoolDeposit(callback: (user: string, amount: bigint) => void) {
    this.contract.on('PoolDeposit', callback);
  }

  onPoolWithdraw(callback: (user: string, amount: bigint) => void) {
    this.contract.on('PoolWithdraw', callback);
  }

  // Remove Event Listeners
  removeAllListeners() {
    this.contract.removeAllListeners();
  }
} 