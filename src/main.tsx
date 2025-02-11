import "./index.css";
import React, { Component, ErrorInfo, ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter as Router } from "react-router-dom";
import { PriceProvider } from "./components/PriceContext";
import { DarkModeProvider } from "./components/DarkModeContext";
import { createWeb3Modal, defaultConfig } from "@web3modal/ethers5/react";
import { motion } from "framer-motion";
import { AlertCircle, RefreshCw, HelpCircle } from "lucide-react";

// Configuration Constants
const CONFIG = {
  PROJECT_ID: "224382cc5c46b1c10cdecbd4059dff6e",
  NETWORK: {
    chainId: 97,
    name: "BSC Testnet",
    currency: "BNB",
    explorerUrl: "https://testnet.bscscan.com",
    rpcUrl: "https://data-seed-prebsc-1-s1.binance.org:8545/",
  },
  METADATA: {
    name: "ITC Community",
    description:
      "Join our community and explore the future of technology and innovation. We're dedicated to creating meaningful connections and fostering growth.",
    url: "https://cryptomx.site/",
    icons: ["https://cticlub.org/assets/images/brand/itclogow.png"],
  },
};

// Web3 Modal Configuration
const ethersConfig = defaultConfig({
  metadata: CONFIG.METADATA,
  enableEIP6963: true,
  enableInjected: true,
  enableCoinbase: true,
  defaultChainId: CONFIG.NETWORK.chainId,
});

// Initialize Web3 Modal
createWeb3Modal({
  ethersConfig,
  chains: [CONFIG.NETWORK],
  projectId: CONFIG.PROJECT_ID,
  enableAnalytics: true,
});

import App from "./App";

// Professional Error Boundary Component
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);

    // Optional: Send error to monitoring service
    // this.logErrorToService(error, errorInfo);
  }

  handleRefresh = () => {
    window.location.reload();
  };

  handleContactSupport = () => {
    window.open(
      "mailto:support@itcclub.com?subject=Application%20Error%20Report",
      "_blank"
    );
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full"
          >
            <div className="flex justify-center mb-6">
              <motion.div
                animate={{
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  repeatType: "mirror",
                }}
                className="bg-red-100 dark:bg-red-900/20 p-4 rounded-full"
              >
                <AlertCircle
                  className="w-16 h-16 text-red-500 dark:text-red-400"
                  strokeWidth={1.5}
                />
              </motion.div>
            </div>

            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Oops! Something Went Wrong
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                We encountered an unexpected error. Don't worry, we're on it!
              </p>

              {/* Error Details (optional, can be toggled) */}
              <details className="text-left bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-6">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300">
                  Error Details
                </summary>
                <pre className="text-xs text-red-600 dark:text-red-400 mt-2 overflow-x-auto">
                  {this.state.error?.toString()}
                </pre>
              </details>

              <div className="flex justify-center space-x-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={this.handleRefresh}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all"
                >
                  <RefreshCw className="w-5 h-5" />
                  <span>Refresh Page</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={this.handleContactSupport}
                  className="flex items-center space-x-2 px-6 py-3 bg-white dark:bg-gray-700 text-gray-700 dark:text-white rounded-lg border border-gray-200 dark:border-gray-600 shadow-md hover:shadow-lg transition-all"
                >
                  <HelpCircle className="w-5 h-5" />
                  <span>Contact Support</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Root Rendering with Error Boundary
const root = createRoot(document.getElementById("root")!);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <Router>
        <DarkModeProvider>
          <PriceProvider>
            <App />
          </PriceProvider>
        </DarkModeProvider>
      </Router>
    </ErrorBoundary>
  </React.StrictMode>
);
