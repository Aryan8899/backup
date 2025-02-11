import React, { useState, useEffect, useRef } from "react";
import { ethers } from "ethers";
import {
  useWeb3ModalAccount,
  useWeb3ModalProvider,
} from "@web3modal/ethers5/react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, RefreshCw, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import multiavatar from "@multiavatar/multiavatar";

// Project-specific imports
import FeaturesSection from "../components/FeaturesSection";
import Light from "../components/Light";
import { useDarkMode } from "../components/DarkModeContext";
import contractAbi from "./Props/contractAbi.ts";
import contractAddress from "./Props/contractAddress.ts";
import "../index.css";
import Loader from "./Loader.tsx";

// Types and Interfaces
interface ReferralNode {
  address: string;
  rank: string;
  referrals: ReferralNode[];
}

interface UserDetails {
  avatar: string;
  nickname: string;
}

const ReferralTree: React.FC = () => {
  // State Management
  const navigate = useNavigate();
  const { darkMode } = useDarkMode();
  const { address, isConnected } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();

  // Refs for scrolling
  const treeContainerRef = useRef<HTMLDivElement>(null);

  // Component States
  const [treeData, setTreeData] = useState<ReferralNode | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [userDetails, setUserDetails] = useState<Record<string, UserDetails>>(
    {}
  );
  const [isProviderReady, setIsProviderReady] = useState(false);

  // Provider and Connection Checks
  useEffect(() => {
    setIsProviderReady(!!walletProvider);
  }, [walletProvider]);

  // Scrolling Handler
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (treeContainerRef.current) {
      const container = treeContainerRef.current;
      container.scrollLeft += e.deltaY;
    }
  };

  // Node Expansion Toggle
  const toggleNodeExpansion = (address: string) => {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(address)) {
        newSet.delete(address);
      } else {
        newSet.add(address);
      }
      return newSet;
    });
  };

  // Registration Status Check
  useEffect(() => {
    const checkRegistrationStatus = async (newAddress: string) => {
      if (!isConnected || !walletProvider || !isProviderReady || !newAddress) {
        console.warn("Wallet is not connected or provider is not ready.");
        return;
      }

      try {
        const ethersProvider = new ethers.providers.Web3Provider(
          walletProvider
        );
        const signer = ethersProvider.getSigner();
        const contract = new ethers.Contract(
          contractAddress,
          contractAbi,
          signer
        );

        const userData = await contract.users(newAddress);
        if (!userData || !userData.isActive) {
          navigate("/");
        }
      } catch (error) {
        console.error("Error checking registration status:", error);
        navigate("/");
      }
    };

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length > 0) {
        checkRegistrationStatus(accounts[0]);
      } else {
        navigate("/");
      }
    };

    if (walletProvider) {
      const provider = new ethers.providers.Web3Provider(walletProvider);
      const externalProvider = provider.provider as any;

      if (externalProvider?.on) {
        externalProvider.on("accountsChanged", handleAccountsChanged);
      }

      if (address) {
        checkRegistrationStatus(address);
      }

      return () => {
        if (externalProvider?.removeListener) {
          externalProvider.removeListener(
            "accountsChanged",
            handleAccountsChanged
          );
        }
      };
    }
  }, [walletProvider, address, isConnected, isProviderReady, navigate]);

  // Fetch User Details
  const fetchUserDetails = async (address: string): Promise<UserDetails> => {
    try {
      const response = await axios.get(
        `https://itcback-production.up.railway.app/api/users/${address}`
      );
      const user = response.data.data;
      return {
        avatar: user.avatar || "",
        nickname: user.nickname || "Unknown",
      };
    } catch (error) {
      console.error(`Error fetching user details for ${address}:`, error);
      return {
        avatar: "",
        nickname: "Unknown",
      };
    }
  };

  // Fetch Referrals Recursively
  const fetchReferrals = async (
    address: string,
    provider: ethers.providers.Web3Provider
  ): Promise<ReferralNode> => {
    const contract = new ethers.Contract(
      contractAddress,
      contractAbi,
      provider
    );

    const getRankName = (rankIndex: number) => {
      const ranks = [
        "STAR",
        "BRONZE",
        "SILVER",
        "GOLD",
        "DIAMOND",
        "BLUE_DIAMOND",
        "BLACK_DIAMOND",
        "ROYAL_DIAMOND",
        "CROWN_DIAMOND",
      ];
      return ranks[rankIndex] || "Unknown Rank";
    };

    try {
      const referrals: string[] = await contract.getUserReferrals(address);
      const userData = await contract.users(address);
      const rankIndex = Number.parseInt(userData[1]?.toString() || "0");
      const rank = getRankName(rankIndex);

      // Fetch user details
      const details = await fetchUserDetails(address);
      setUserDetails((prev) => ({
        ...prev,
        [address]: {
          avatar: details.avatar || "",
          nickname: details.nickname || "Unknown",
        },
      }));

      const referralNodes = await Promise.all(
        referrals.map((referral) => fetchReferrals(referral, provider))
      );

      return { address, rank, referrals: referralNodes };
    } catch (err) {
      console.error(`Error fetching referrals for address ${address}:`, err);
      return { address, rank: "Unknown Rank", referrals: [] };
    }
  };

  // Load Tree Data
  useEffect(() => {
    const loadTreeData = async () => {
      if (!address || !walletProvider) {
        setError("Wallet not connected.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const provider = new ethers.providers.Web3Provider(walletProvider);
        const tree = await fetchReferrals(address, provider);
        setTreeData(tree);
      } catch (err) {
        console.error("Error loading referral tree data:", err);
        setError("Failed to load referral tree.");
      } finally {
        setIsLoading(false);
      }
    };

    loadTreeData();
  }, [address, walletProvider]);

  // Utility Functions
  const shortenAddress = (address: string) =>
    `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;

  // Render Individual Node
  const renderNode = (
    node: ReferralNode,
    level = 0,
    isRoot = false,
    hasParent = false
  ) => {
    const hasChildren = node.referrals.length > 0;
    const isExpanded = expandedNodes.has(node.address);
    const details = userDetails[node.address] || {
      avatar: "",
      nickname: "Unknown",
    };
    const avatarSVG = multiavatar(node.address);

    const getGridCols = (count: number) => {
      if (count > 4) return "grid-cols-5";
      if (count > 3) return "grid-cols-4";
      if (count > 2) return "grid-cols-3";
      if (count > 1) return "grid-cols-2";
      return "grid-cols-1";
    };

    return (
      <div className="flex flex-col items-center">
        {/* Vertical connector from parent */}
        {hasParent && (
          <div className="w-px h-8 bg-gradient-to-b from-blue-500/30 to-purple-500/30" />
        )}

        {/* Node Card */}
        <motion.div
          layout
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className={`
          relative group cursor-pointer transition-all duration-300
          ${
            darkMode
              ? "bg-gray-800/60 backdrop-blur-xl border border-gray-700/50 hover:border-cyan-500/50"
              : "bg-white/60 backdrop-blur-xl border border-gray-200/50 hover:border-blue-500/50"
          }
          rounded-2xl p-4 shadow-lg hover:shadow-2xl w-64 ${
            isRoot ? "mb-12" : "mb-4"
          }
        `}
          onClick={() => toggleNodeExpansion(node.address)}
        >
          {/* Glow Effect */}
          <div
            className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-300 
          bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-cyan-500/10 rounded-2xl blur-lg"
          />

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center">
            <img
              src={`data:image/svg+xml;utf8,${encodeURIComponent(avatarSVG)}`}
              alt="Avatar"
              className="w-20 h-20 rounded-full border-2 border-white/20 mb-3 group-hover:scale-105 transition-transform"
            />

            <div className="text-center space-y-1">
              <h3
                className={`font-semibold text-lg ${
                  darkMode ? "text-white" : "text-gray-800"
                }`}
              >
                {details.nickname}
              </h3>
              <p
                className={`text-sm tracking-wider ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {shortenAddress(node.address)}
              </p>
              <div
                className={`text-xs font-medium py-1 px-2 rounded-full 
              ${
                darkMode
                  ? "bg-gray-700 text-cyan-400"
                  : "bg-blue-50 text-blue-600"
              }`}
              >
                Rank: {node.rank}
              </div>
              <div
                className={`text-xs mt-1 ${
                  darkMode ? "text-gray-500" : "text-gray-500"
                }`}
              >
                {node.referrals.length} Referrals
              </div>
            </div>

            {hasChildren && (
              <div className="absolute bottom-2 right-2 text-gray-500">
                {isExpanded ? <ChevronUp /> : <ChevronDown />}
              </div>
            )}
          </div>
        </motion.div>

        {/* Children Section */}
        {hasChildren && isExpanded && (
          <div className="relative flex flex-col items-center">
            {/* Connection Lines */}
            <div className="relative w-full">
              <div className="absolute left-1/2 -translate-x-1/2 h-8 w-px bg-gradient-to-b from-blue-500/30 to-purple-500/30" />
              {node.referrals.length > 1 && (
                <div
                  className="absolute top-8 left-1/2 -translate-x-1/2 h-px bg-gradient-to-r from-blue-500/30 to-purple-500/30"
                  style={{
                    width: `${Math.min(node.referrals.length * 280, 1200)}px`,
                  }}
                />
              )}
            </div>

            {/* Children Grid */}
            <div
              className={`grid ${getGridCols(
                node.referrals.length
              )} gap-x-8 gap-y-12 pt-8`}
              style={{
                minWidth: `${Math.min(node.referrals.length * 280, 1200)}px`,
              }}
            >
              {node.referrals.map((child) => (
                <div key={child.address} className="flex flex-col items-center">
                  {renderNode(child, level + 1, false, true)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Main Render
  return (
    <>
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        {darkMode ? <FeaturesSection /> : <Light />}
      </div>

      {/* Main Container */}
      <div className="min-h-screen p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Referral Network
          </h1>
          <p
            className={`text-lg ${
              darkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Explore your network and track your referral growth
          </p>
        </motion.div>

        {/* Tree Container */}
        <div className="w-full overflow-auto max-h-[calc(100vh-200px)] p-4">
          <div className="min-w-max flex justify-center">
            {isLoading ? (
              <div className="flex justify-center items-center h-96">
                <div className="absolute inset-0 backdrop-blur-sm bg-white/30 dark:bg-black/30" />

                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                  }}
                  className="relative z-50 flex flex-col items-center justify-center space-y-6"
                >
                  {/* Logo Container */}
                  <div className="relative">
                    <motion.div
                      animate={{
                        scale: [1, 1.05, 1],
                        rotate: [0, 2, -2, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="relative"
                    >
                      <img
                        src="https://cticlub.org/assets/images/brand/itclogow.png"
                        alt="ITC Club Logo"
                        className="h-32 w-auto rounded-xl shadow-lg"
                      />
                    </motion.div>
                  </div>

                  {/* Loading Indicator */}
                  <div className="flex items-center space-x-3">
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 360],
                        borderRadius: ["50%", "20%", "50%"],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="w-12 h-12 border-4 border-blue-500 border-t-purple-500 rounded-full"
                    />
                    <span className="text-xl font-semibold text-gray-700 dark:text-gray-300">
                      Loading...
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: ["0%", "100%", "0%"],
                      transition: {
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      },
                    }}
                    className="w-64 h-1.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                  />
                </motion.div>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-96 space-y-4">
                <AlertTriangle className="w-24 h-24 text-red-500" />
                <p className="text-xl text-red-500">{error}</p>
              </div>
            ) : treeData ? (
              <div className="flex flex-col items-center">
                {renderNode(treeData, 0, true)}
              </div>
            ) : (
              <div className="flex justify-center items-center h-96">
                <p
                  className={`text-xl ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  No referral data available
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ReferralTree;
