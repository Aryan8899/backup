// src/services/blockchainService.ts
import { ethers, BrowserProvider, Contract } from "ethers";
import { VAULT_ADDRESS, TOKEN_ADDRESS, CHAIN_ID } from "../config/constants";

// ABIs
const VAULT_ABI = [
  "function deposit(uint256 amount, string calldata sessionId) external",
  "event Deposit(address indexed user, uint256 amount, string sessionId, uint256 timestamp)",
];

const TOKEN_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function balanceOf(address account) external view returns (uint256)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function decimals() external view returns (uint8)", // Added to get token decimals
];

class BlockchainService {
  private tokenContract: Contract | null = null;
  private vaultContract: Contract | null = null;
  private tokenDecimals: number = 18; // Default to 18, will be updated
  private walletProvider: any = null;
  private connectedAddress: string | null = null;

  resetState() {
    this.tokenContract = null;
    this.vaultContract = null;
    this.walletProvider = null;
    this.connectedAddress = null;
  }

  // Set wallet provider from AppKit
  setWalletProvider(provider: any, address: string) {
    this.walletProvider = provider;
    this.connectedAddress = address;
    this.initializeContracts();
  }

  // Initialize contracts with AppKit provider
  async initializeContracts() {
    if (!this.walletProvider || !this.connectedAddress) {
      console.error("Cannot initialize contracts: No wallet provider or address");
      return false;
    }

    try {
      const provider = new BrowserProvider(this.walletProvider);
      const signer = await provider.getSigner();

      // Initialize contracts
      this.vaultContract = new Contract(
        VAULT_ADDRESS,
        VAULT_ABI,
        signer
      );
      
      this.tokenContract = new Contract(
        TOKEN_ADDRESS,
        TOKEN_ABI,
        signer
      );

      // Get token decimals
      try {
        this.tokenDecimals = await this.tokenContract.decimals();
        console.log("Token decimals:", this.tokenDecimals);
      } catch (decimalError) {
        console.warn(
          "Could not get token decimals, using default of 18:",
          decimalError
        );
        this.tokenDecimals = 18;
      }

      return true;
    } catch (error) {
      console.error("Error initializing contracts:", error);
      this.resetState();
      return false;
    }
  }

  // Check if connected
  isConnected(): boolean {
    return !!(this.walletProvider && this.connectedAddress && this.tokenContract && this.vaultContract);
  }

  // Get connected account
  getAccount(): string | null {
    return this.connectedAddress;
  }

  // Get token balance
  async getBalance(): Promise<string> {
    if (!this.isConnected() || !this.tokenContract || !this.connectedAddress) {
      console.error("Not connected to get balance");
      return "0";
    }

    try {
      console.log("Getting balance for address:", this.connectedAddress);
      
      // Get balance
      const balance = await this.tokenContract.balanceOf(this.connectedAddress);
      console.log("Raw balance result:", balance.toString());

      // Format with the correct decimals
      const formattedBalance = ethers.formatUnits(
        balance,
        this.tokenDecimals
      );
      console.log("Formatted balance:", formattedBalance);

      return formattedBalance;
    } catch (error) {
      console.error("Error getting balance:", error);
      return "0";
    }
  }

  // Approve tokens for vault
  async approveTokens(amount: string): Promise<any> {
    if (!this.isConnected() || !this.tokenContract) {
      throw new Error("Not connected");
    }

    try {
      const amountWei = ethers.parseUnits(amount, this.tokenDecimals);
      const tx = await this.tokenContract.approve(VAULT_ADDRESS, amountWei);
      return await tx.wait();
    } catch (error) {
      console.error("Error approving tokens:", error);
      throw error;
    }
  }

  // Check token allowance
  async checkAllowance(): Promise<string> {
    if (!this.isConnected() || !this.tokenContract || !this.connectedAddress) {
      throw new Error("Not connected");
    }

    try {
      const allowance = await this.tokenContract.allowance(
        this.connectedAddress,
        VAULT_ADDRESS
      );
      return ethers.formatUnits(allowance, this.tokenDecimals);
    } catch (error) {
      console.error("Error checking allowance:", error);
      throw error;
    }
  }

  // Deposit tokens to vault
  async deposit(
    amount: string,
    sessionId: string
  ): Promise<any> {
    if (!this.isConnected() || !this.vaultContract || !this.tokenContract || !this.connectedAddress) {
      throw new Error("Not connected");
    }

    try {
      const amountWei = ethers.parseUnits(amount, this.tokenDecimals);

      // Check allowance first
      const allowance = await this.tokenContract.allowance(
        this.connectedAddress,
        VAULT_ADDRESS
      );

      if (allowance < amountWei) {
        throw new Error("Insufficient allowance. Please approve tokens first.");
      }

      const tx = await this.vaultContract.deposit(amountWei, sessionId);
      return await tx.wait();
    } catch (error) {
      console.error("Error depositing tokens:", error);
      throw error;
    }
  }
}

export const blockchainService = new BlockchainService();