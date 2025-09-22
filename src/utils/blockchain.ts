import { ethers } from 'ethers';

export class BlockchainService {
  private provider: ethers.JsonRpcProvider | null = null;
  private signer: ethers.Signer | null = null;

  constructor() {
    // Initialize with Hardhat local network
    this.provider = new ethers.JsonRpcProvider('http://localhost:8545');
  }

  async connectWallet(): Promise<string> {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        this.signer = await provider.getSigner();
        return await this.signer.getAddress();
      } catch (error) {
        throw new Error('Failed to connect to MetaMask');
      }
    } else {
      throw new Error('MetaMask is not installed');
    }
  }

  async getBalance(address: string): Promise<string> {
    if (!this.provider) throw new Error('Provider not initialized');
    const balance = await this.provider.getBalance(address);
    return ethers.formatEther(balance);
  }

  async sendHashToContract(hash: string, participantData: any): Promise<string> {
    // This will be implemented when smart contract is deployed
    // For now, return mock transaction hash
    console.log('Sending hash to contract:', hash, participantData);
    
    // Simulate blockchain transaction
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve('0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(''));
      }, 2000);
    });
  }

  async verifyHash(hash: string): Promise<boolean> {
    // This will be implemented when smart contract is deployed
    console.log('Verifying hash:', hash);
    return true;
  }
}

export const blockchainService = new BlockchainService();