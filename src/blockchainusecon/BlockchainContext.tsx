// src/blockchainusecon/BlockchainContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { ethers } from "ethers";
import {
  Provider,
  useAppKit,
  useAppKitProvider,
  useAppKitAccount,
} from "@reown/appkit/react";
import { blockchainService } from "../services/blockchainService";

interface BlockchainContextValue {
  account: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  balance: string;
  connect: () => Promise<string>;
  approveTokens: (amount: string) => Promise<any>;
  deposit: (
    amount: string,
    sessionId: string
  ) => Promise<any>;
  refreshBalance: () => Promise<void>;
}

const BlockchainContext = createContext<BlockchainContextValue | undefined>(
  undefined
);

export const BlockchainProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { open } = useAppKit();
  const { address, isConnected: appKitConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider<Provider>("eip155");
  
  const [account, setAccount] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [balance, setBalance] = useState("0");
  const [balanceLastUpdated, setBalanceLastUpdated] = useState(0);

  // Initialize blockchain service when wallet is connected
  useEffect(() => {
    if (walletProvider && address) {
      console.log("Initializing blockchain service with AppKit provider");
      blockchainService.setWalletProvider(walletProvider, address);
      setAccount(address);
      setIsConnected(true);
      refreshBalance();
    } else {
      blockchainService.resetState();
      setIsConnected(false);
      setAccount(null);
      setBalance("0");
    }
  }, [walletProvider, address]);

  // Update connection state based on AppKit
  useEffect(() => {
    setIsConnected(appKitConnected && !!address);
    if (address) {
      setAccount(address);
    } else {
      setAccount(null);
      setBalance("0");
    }
  }, [appKitConnected, address]);

  // Set up automatic balance refresh
  useEffect(() => {
    if (isConnected && account) {
      // Refresh balance immediately
      refreshBalance();
      
      // Refresh balance every 30 seconds
      const intervalId = setInterval(() => {
        refreshBalance();
      }, 30000);

      return () => clearInterval(intervalId);
    }
  }, [isConnected, account]);

  const connect = async () => {
    setIsConnecting(true);

    try {
      console.log("Opening AppKit wallet connection");
      await open();
      
      // No need to return anything as the address will be set via useAppKitAccount hook
      return address || "";
    } catch (error) {
      console.error("Connection failed:", error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };

  const refreshBalance = async () => {
    // Avoid multiple concurrent balance requests
    const now = Date.now();
    if (now - balanceLastUpdated < 5000) {
      console.log("Skipping balance refresh, too soon since last update");
      return;
    }

    setBalanceLastUpdated(now);

    if (isConnected && account) {
      try {
        console.log("Refreshing balance...");
        const newBalance = await blockchainService.getBalance();
        console.log("New balance:", newBalance);

        // Only update if the balance is valid
        if (newBalance && !isNaN(parseFloat(newBalance))) {
          setBalance(newBalance);
        } else {
          console.warn("Invalid balance received:", newBalance);
        }
      } catch (error) {
        console.error("Balance refresh failed:", error);
      }
    } else {
      console.log("Not connected, skipping balance refresh");
    }
  };

  const approveTokens = async (amount: string) => {
    if (!blockchainService.isConnected()) {
      throw new Error("Not connected");
    }

    try {
      console.log("Approving tokens with amount:", amount);
      const result = await blockchainService.approveTokens(amount);
      await refreshBalance();
      return result;
    } catch (error) {
      console.error("Approval failed:", error);
      throw error;
    }
  };

  const deposit = async (amount: string, sessionId: string) => {
    if (!blockchainService.isConnected()) {
      throw new Error("Not connected");
    }

    try {
      console.log("Depositing with amount:", amount, "and sessionId:", sessionId);
      const result = await blockchainService.deposit(amount, sessionId);
      await refreshBalance();
      return result;
    } catch (error) {
      console.error("Deposit failed:", error);
      throw error;
    }
  };

  const value = {
    account,
    isConnected,
    isConnecting,
    balance,
    connect,
    approveTokens,
    deposit,
    refreshBalance,
  };

  return (
    <BlockchainContext.Provider value={value}>
      {children}
    </BlockchainContext.Provider>
  );
};

export const useBlockchain = () => {
  const context = useContext(BlockchainContext);
  if (context === undefined) {
    throw new Error("useBlockchain must be used within a BlockchainProvider");
  }
  return context;
};