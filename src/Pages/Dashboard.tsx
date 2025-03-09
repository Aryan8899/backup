// @ts-nocheck

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDarkMode } from "../context/DarkModeContext.tsx";
import { usePriceData } from "../context/PriceContext.tsx";
import {
  Provider,
  useAppKitProvider,
  useAppKitAccount,
} from "@reown/appkit/react";
import { rankApi } from "../api/rankApi";
import { RefreshCw } from "lucide-react";
import { rewardApi } from "../api/rewardApi";
import { useBlockchain } from "../blockchainusecon/BlockchainContext";
import { BrowserProvider, Contract, formatUnits, ethers } from "ethers";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import contractAbi from "../contracts/Props/contractAbi.ts";
import contractAddress from "../contracts/Props/contractAddress.ts";
import { Bar } from "react-chartjs-2";
import { userApi, RegistrationRequest } from "../api/userApi";
import {
  CheckCheck,
  Copy,
  User,
  Award,
  Trophy,
  Info,
  TrendingUp,
  Gift,
  Calendar,
  DollarSign,
  Clock,
  Link,
  Activity,
  ChevronDown,
  Share2,
  Sparkles,
  ArrowUpCircle,
  Camera,
} from "lucide-react";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import * as Tooltip from "@radix-ui/react-tooltip";
import { cn } from "../../components/lib/utils.ts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/components/ui/dialog.tsx";
import { Button } from "../../components/components/ui/button.tsx";
import { Input } from "../../components/components/ui/input.tsx";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/components/ui/card.tsx";
import { motion } from "framer-motion";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Legend,
} from "chart.js";
import { connected } from "process";

// Register chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Legend);

// Define contract interface to fix TypeScript errors

// Then replace the IContract interface with this
interface IContract extends Contract {
  [key: string]: any;
  // Method definitions with correct types
  users(address: string): Promise<any>;
  getTtlInvstmnt(): Promise<ethers.BigNumberish>;
  getUsrTtlLtgrcvd(address: string): Promise<ethers.BigNumberish>;
  getWthrabIncome(address: string): Promise<ethers.BigNumberish>;
  getUsrTtlrabrcvd(address: string): Promise<ethers.BigNumberish>;
  getWthlvlIncm(address: string): Promise<ethers.BigNumberish>;
  getUsrTtllvlrcvd(address: string): Promise<ethers.BigNumberish>;
  usrCnt(): Promise<ethers.BigNumberish>;
  getTtlLtgDstrbtd(): Promise<ethers.BigNumberish>;
  getTtlRabDstrbtd(): Promise<ethers.BigNumberish>;
  getTtllvlDstrbtd(): Promise<ethers.BigNumberish>;
  getRankLTG(address: string, index: number): Promise<any>;
  rankDetails(index: number): Promise<any>;
  withdrawLevelIncome(): Promise<any>;
  claimMonthlyRab(): Promise<any>;
  upgradeRank(index: number): Promise<any>;
  getUserReferrals(address: string): Promise<string[]>;
}

// Define constants to avoid magic values throughout the code
const RANK_DEFINITIONS = [
  { name: "STAR", index: 0, color: "#B8B8B8", multiplier: 1 },
  { name: "BRONZE", index: 1, color: "#CD7F32", multiplier: 2 },
  { name: "SILVER", index: 2, color: "#C0C0C0", multiplier: 3 },
  { name: "GOLD", index: 3, color: "#FFD700", multiplier: 4 },
  { name: "DIAMOND", index: 4, color: "#B9F2FF", multiplier: 5 },
  { name: "BLUE_DIAMOND", index: 5, color: "#4169E1", multiplier: 6 },
  { name: "BLACK_DIAMOND", index: 6, color: "#111111", multiplier: 7 },
  { name: "ROYAL_DIAMOND", index: 7, color: "#E6BE8A", multiplier: 8 },
  { name: "CROWN_DIAMOND", index: 8, color: "#8A2BE2", multiplier: 9 },
];

// API endpoints
const API_BASE_URL = "http://localhost:3000/api";
const API_ENDPOINTS = {
  getUserData: (address: string) => `${API_BASE_URL}/users/${address}`,
  updateNickname: `${API_BASE_URL}/users/nickname`,
  updateAvatar: `${API_BASE_URL}/users/profile-picture`,
};

const SPECIAL_ADDRESSES = [
  "0x0Ac0920459Ae9c1ABB3D866C1f772e7f0697B069",
  "0xe18dAc7e37eD0F27b1DeBB5b07D61211dEb90237",
  "0x370f791Bd02d7672Aa9a4A72aa8Cd46f0604b285",
];

// Type definitions for better code organization and type safety
interface UserData {
  nickname: string;
  referralQR?: string;
  address?: string;
  avatar?: string;
}

interface UserDetails {
  referrer: string;
  currentRank: string;
  lastRankUpdateTime: string;
  rankExpiryTime: string;
  totalInvestment: string;
  isActive: boolean;
  isExpired: boolean;
  rewards: string;
}

interface PoolData {
  ltgPool: number;
  rtgPool: number;
  ldpPool: number;
}

interface FinancialData {
  withdrawalLevel: string;
  totalLevel: string;
  withdrawalRAB: string;
  totalRAB: string;
  totalBonus: string;
  totalPendingAmount: string;
}

interface RankDetail {
  id: number;
  name: string;
  count?: string;
  pendingAmount?: string;
  totalDistributedAmount?: string;
  rankUpgradePriceUSD?: string;
}

// Define prop types for the StatCard component
interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  value: string | number;
  label: string;
  gradient: string;
}

// Update the GraphData interface's datasets property:
// Remove the previous GraphData interface and use this consolidated one
interface GraphData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor: string[];
    borderColor: string[];
    borderWidth: number;
    borderRadius?: {
      topLeft: number;
      topRight: number;
      bottomLeft: number;
      bottomRight: number;
    };
  }>;
}

interface WithdrawalState {
  isProcessing: boolean;
  type: "LEVEL" | "LTG" | "RAB" | null;
  sessionData: any | null;
  step: "init" | "processing" | "success" | "error";
  error: string;
}


// Custom hooks to organize related functionality
const useContract = (provider: any, account: string | undefined) => {
  const [contract, setContract] = useState<IContract | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initContract = async () => {
      if (!provider || !account) {
        setIsReady(false);
        return;
      }

      try {
        const ethersProvider = new BrowserProvider(provider);
        const signer = await ethersProvider.getSigner();
        const newContract = new Contract(
          contractAddress,
          contractAbi,
          signer
        ) as IContract;
        setContract(newContract);
        setIsReady(true);
      } catch (error) {
        console.error("Failed to initialize contract:", error);
        setIsReady(false);
      }
    };

    initContract();
  }, [provider, account]);

  return { contract, isReady };
};

// Hook for managing user profile data
//const [userDatarank, setUserDatarank] = useState<any>(null);
const useUserProfile = (address: string | undefined) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserProfile = useCallback(async () => {
    if (!address) return;

    setIsLoading(true);
    try {
      const response = await axios.get(API_ENDPOINTS.getUserData(address));
      const user = response.data.data;
      setUserData({
        nickname: user.nickname,
        referralQR: user.referralQR,
        avatar: user.avatar,
        address,
      });

      setError(null);
    } catch (err) {
      console.error("Error fetching user profile:", err);
      setError("Failed to load user profile");
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const updateNickname = useCallback(
    async (nickname: string) => {
      if (!address) {
        return { success: false, message: "Wallet not connected" };
      }

      try {
        const response = await axios.put(API_ENDPOINTS.updateNickname, {
          nickname,
          address,
        });

        if (response.status === 200) {
          setUserData((prev) => (prev ? { ...prev, nickname } : null));
          return { success: true, message: "Nickname updated successfully" };
        } else {
          return { success: false, message: "Failed to update nickname" };
        }
      } catch (err) {
        console.error("Error updating nickname:", err);
        return {
          success: false,
          message: "An error occurred while updating nickname",
        };
      }
    },
    [address]
  );

  const updateAvatar = useCallback(
    async (file: File) => {
      if (!address || !file) {
        return { success: false, message: "Missing required data" };
      }

      const formData = new FormData();
      formData.append("avatar", file);
      formData.append("address", address);

      try {
        const response = await axios.put(API_ENDPOINTS.updateAvatar, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (response.data?.data?.avatar) {
          const newUrl = `${response.data.data.avatar}?v=${Date.now()}`;
          setUserData((prev) => (prev ? { ...prev, avatar: newUrl } : null));
          return {
            success: true,
            message: "Avatar updated successfully",
            url: newUrl,
          };
        } else {
          return { success: false, message: "Failed to update avatar" };
        }
      } catch (err) {
        console.error("Error updating avatar:", err);
        return {
          success: false,
          message: "An error occurred while updating avatar",
        };
      }
    },
    [address]
  );

  return {
    userData,
    setUserData,
    isLoading,
    error,
    fetchUserProfile,
    updateNickname,
    updateAvatar,
  };
};

// Image compression utility function
const compressImage = async (file: File, maxSize = 500): Promise<File> => {
  let objectUrl: string | null = null;

  try {
    return await new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(
                new File([blob], file.name, {
                  type: "image/jpeg",
                  lastModified: Date.now(),
                })
              );
            } else {
              reject(new Error("Compression failed"));
            }
            // Clean up canvas
            canvas.width = 0;
            canvas.height = 0;
          },
          "image/jpeg",
          0.5
        );
      };

      img.onerror = () => reject(new Error("Failed to load image"));
      objectUrl = URL.createObjectURL(file);
      img.src = objectUrl;
    });
  } finally {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
  }
};

// Main Dashboard Component
const Dashboard = () => {
  const { account, approveTokens, deposit, balance } = useBlockchain();
  const navigate = useNavigate();
  const [withdrawal, setWithdrawal] = useState<WithdrawalState>({
    isProcessing: false,
    type: null,
    sessionData: null,
    step: "init",
    error: "",
  });
  const [upgradeCost, setUpgradeCost] = useState<any>(null);
  const [cacheVersion, setCacheVersion] = useState(1);
  const { darkMode } = useDarkMode();
  const { priceData } = usePriceData();
  const { address, isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider<Provider>("eip155");
  const { width, height } = useWindowSize();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [rankCosts, setRankCosts] = useState<{[key: string]: any}>({});
  

  const isSpecialAddress = useMemo(() => {
    if (!address) return false;

    // Convert everything to lowercase for case-insensitive comparison
    const lowerAddress = address.toLowerCase();
    const lowerSpecialAddresses = SPECIAL_ADDRESSES.map((addr) =>
      addr.toLowerCase()
    );

    return lowerSpecialAddresses.includes(lowerAddress);
  }, [address]);

  // Use the custom hook for contract interactions
  const { contract, isReady: isContractReady } = useContract(
    walletProvider,
    address
  );

  // Use the custom hook for user profile management
  const { userData, setUserData, updateNickname, updateAvatar } =
    useUserProfile(address);

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [newNickname, setNewNickname] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [showMarquee, setShowMarquee] = useState(false);
  const [rankMessage, setRankMessage] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isNicknameLoading, setIsNicknameLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedRank, setSelectedRank] = useState<string | null>(null);
  const [inviteLink, setInviteLink] = useState("");
  const [forceRefresh, setForceRefresh] = useState(0);

  // Financial data state
  const [financialData, setFinancialData] = useState<FinancialData>({
    withdrawalLevel: "0",
    totalLevel: "0",
    withdrawalRAB: "0",
    totalRAB: "0",
    totalBonus: "0",
    totalPendingAmount: "0",
  });

  const [rewards, setRewards] = useState<any>(null);

  // User details state
  const [userDetails, setUserDetails] = useState<any>("");
  const [isRankExpired, setIsRankExpired] = useState<"loading" | boolean>(
    "loading"
  );

  // Rank and stats state
  const [usrCnt, setUsrCnt] = useState<number | null>(null);
  const [count, setCount] = useState(0);
  const [rankDetails, setRankDetails] = useState<RankDetail[]>([]);
  const [totalInvestment, setTotalInvestment] = useState("0");
  const [isLoadingLevel, setIsLoadingLevel] = useState(false);
  const [isLoadingRab, setIsLoadingRab] = useState(false);

  // Pool data state
  const [poolData, setPoolData] = useState<PoolData>({
    ltgPool: 0,
    rtgPool: 0,
    ldpPool: 0,
  });
  const [countLTGPool, setCountLTGPool] = useState(0);
  const [countRTGPool, setCountRTGPool] = useState(0);
  const [countLDPPool, setCountLDPPool] = useState(0);

  // Graph data
  const [isGraphLoading, setIsGraphLoading] = useState(true);
  const [rankGraphData, setRankGraphData] = useState<GraphData>({
    labels: [],
    datasets: [],
  });



  // Set invite link when address is available
  useEffect(() => {
    if (address) {
      setInviteLink(`https://cryptomx.site/#/register?referral=${address}`);
    }
  }, [address]);

  // Set avatar URL when user data changes
  useEffect(() => {
    if (userData?.avatar) {
      setAvatarUrl(userData.avatar);
    }

    // Loading state timeout
    const timeout = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timeout);
  }, [userData?.avatar]);

  // Check if user is registered - consolidating registration check
  useEffect(() => {
    const checkRegistrationStatus = async () => {
      if (!isConnected || !contract || !address) {
        return;
      }

      try {
        const userData = await userApi.getUserByAddress(address);

        if (userData.data.isActive) {
          toast.info("You are already registered"); // Changed to info toast
          navigate("/dashboard");
          return;
        }
      } catch (error) {
        console.error("Error checking registration status:", error);
        navigate("/");
      }
    };

    // Check on initial load and provider change
    checkRegistrationStatus();

    // Setup listener for account changes
    if (walletProvider) {
      const provider = new BrowserProvider(walletProvider as any);
      const externalProvider = provider.provider as any;

      if (externalProvider?.on) {
        const handleAccountsChanged = (accounts: string[]) => {
          if (accounts.length > 0) {
            checkRegistrationStatus();
          } else {
            navigate("/");
          }
        };

        externalProvider.on("accountsChanged", handleAccountsChanged);

        return () => {
          if (externalProvider?.removeListener) {
            externalProvider.removeListener(
              "accountsChanged",
              handleAccountsChanged
            );
          }
        };
      }
    }
  }, [isConnected, contract, address, navigate, walletProvider]);

  const cache = useMemo(() => {
    const CACHE_PREFIX = "rtree_"; // Use a single consistent prefix

    const cacheObj = {
      get: (key: string): any => {
        try {
          const item = localStorage.getItem(`${CACHE_PREFIX}${key}`);
          if (!item) return null;

          const parsedItem = JSON.parse(item);
          if (parsedItem.expiry && Date.now() > parsedItem.expiry) {
            localStorage.removeItem(`${CACHE_PREFIX}${key}`);
            return null;
          }
          return parsedItem.data;
        } catch (e) {
          console.error(`Cache read error for ${key}:`, e);
          return null;
        }
      },
      set: (key: string, data: any, ttl: number): void => {
        try {
          if (data === null || data === undefined) return;
          const expiry = Date.now() + ttl;
          localStorage.setItem(
            `${CACHE_PREFIX}${key}`,
            JSON.stringify({ data, expiry })
          );
        } catch (e) {
          console.error(`Cache write error for ${key}:`, e);
        }
      },
      remove: (key: string): void => {
        try {
          localStorage.removeItem(`${CACHE_PREFIX}${key}`);
        } catch (e) {
          console.error(`Cache delete error for ${key}:`, e);
        }
      },
    };
    return cacheObj;
  }, []);

  const refreshGraphData = useCallback(() => {
    // Increment cache version to force a complete refresh
    setCacheVersion((prev) => prev + 1);

    // Clear the memory cache
    setRankGraphDataCache({
      data: null,
      timestamp: 0,
    });

    // Remove ALL cache keys related to this address
    const baseKey = `rankGraphData_${address}`;
    for (let i = 0; i < 100; i++) {
      cache.remove(`${baseKey}_v${i}`);
    }

    // Set loading state to true to trigger a fresh data fetch
    setIsGraphLoading(true);

    // Reset the graph data to force a complete redraw
    setRankGraphData({
      labels: [],
      datasets: [],
    });
  }, [address, cache]);

  // Then update the upgradeRank function to properly refresh the graph

  // Load all contract data in a consolidated effect
  useEffect(() => {
    // Skip if not ready
    if (!isConnected || !contract || !address) {
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    const loadAllContractData = async () => {
      try {
        // Execute multiple requests in parallel for efficiency
        const [
          userData,
          totalInvestmentData,
          bonusData,
          rankCount,
          poolValuesData,
          rankDetailsData,
        ] = await Promise.all([
          // User data
          contract.users(address),
          // Total investment
          contract.getTtlInvstmnt(),
          // Bonus data - all in one batch request
          Promise.all([
            contract.getUsrTtlLtgrcvd(address),
            contract.getWthrabIncome(address),
            contract.getUsrTtlrabrcvd(address),
            contract.getWthlvlIncm(address),
            contract.getUsrTtllvlrcvd(address),
          ]),
          // Total user count
          contract.usrCnt(),
          // Pool values
          Promise.all([
            contract.getTtlLtgDstrbtd(),
            contract.getTtlRabDstrbtd(),
            contract.getTtllvlDstrbtd(),
          ]),
          // Rank details
          Promise.all(
            RANK_DEFINITIONS.map(async (rank) => {
              try {
                return await contract.getRankLTG(address, rank.index);
              } catch (error) {
                console.error(
                  `Error fetching LTG for rank ${rank.index}:`,
                  error
                );
                return null;
              }
            })
          ),
        ]);

        if (!isMounted) return;

        // Parse user data
        const getRankName = (rankIndex: string | number): string => {
          const rank = RANK_DEFINITIONS.find(
            (r) => r.index === parseInt(rankIndex.toString())
          );
          return rank ? rank.name : "Unknown Rank";
        };

        const formatTimestamp = (timestamp: number | string): string => {
          try {
            const timestampNum =
              typeof timestamp === "number" ? timestamp : Number(timestamp);
            if (isNaN(timestampNum) || timestampNum === 0) {
              return "Not updated";
            }
            return new Date(timestampNum * 1000).toLocaleDateString();
          } catch (error) {
            return "Invalid timestamp";
          }
        };

        // Calculate total rewards
        const [totalBonusData, totalRABData, totalLevelData] = [
          bonusData[0], // getUsrTtlLtgrcvd
          bonusData[2], // getUsrTtlrabrcvd
          bonusData[4], // getUsrTtllvlrcvd
        ];

        const totalRewards =
          parseFloat(formatUnits(totalBonusData || "0", 18)) +
          parseFloat(formatUnits(totalRABData || "0", 18)) +
          parseFloat(formatUnits(totalLevelData || "0", 18));

        // Set user details
        const currentTime = BigInt(Math.floor(Date.now() / 1000));
        const expectedTime = userData[0]?.toString();
        const expiryTime = userData.rankExpiryTime;

        let isActive = true;
        let isExpired = false;
        let rankExpiryTimeDisplay = "MAX";

        // For non-special addresses, use the normal logic
        if (!isSpecialAddress) {
          isActive =
            currentTime >= BigInt(expectedTime || "0") &&
            currentTime < BigInt(expiryTime || "0");
          isExpired = currentTime > BigInt(expiryTime || "0");
          rankExpiryTimeDisplay = formatTimestamp(
            Number(userData.rankExpiryTime || 0)
          );
        }

        const userResponse = await userApi.getUserByAddress(address);
        console.log("User response:", userResponse);
        const userData2 = userResponse.data?.user;
        console.log("User response of user:", userData2);

        setUserDetails(userData2);

        // Set rank expiry status
        setIsRankExpired(isSpecialAddress ? false : isExpired);

        const detailsResponse = await userApi.getUserDetails(userData2.id);
        console.log("User details response:", detailsResponse);

        refreshGraphData();

        // Set financial data

        setRewards(detailsResponse.data?.user?.reward);

        setFinancialData({
          totalBonus: parseFloat(
            formatUnits(totalBonusData || "0", 18)
          ).toFixed(4),
          withdrawalRAB: parseFloat(
            formatUnits(bonusData[1] || "0", 18)
          ).toFixed(4),
          totalRAB: parseFloat(formatUnits(totalRABData || "0", 18)).toFixed(4),
          withdrawalLevel: parseFloat(
            formatUnits(bonusData[3] || "0", 18)
          ).toFixed(4),
          totalLevel: parseFloat(
            formatUnits(totalLevelData || "0", 18)
          ).toFixed(4),
          totalPendingAmount: "0", // Will be calculated from rank details
        });

        // Set total investment
        setTotalInvestment(
          parseFloat(formatUnits(totalInvestmentData || "0", 18)).toFixed(2)
        );

        // Set user count
        setUsrCnt(Number(rankCount));

        // Set pool data
        const ltgPoolValue = parseFloat(
          formatUnits(poolValuesData[0], 18)
        ).toFixed(0);
        const rtgPoolValue = parseFloat(
          formatUnits(poolValuesData[1], 18)
        ).toFixed(0);
        const ldpPoolValue = parseFloat(
          formatUnits(poolValuesData[2], 18)
        ).toFixed(0);

        setPoolData({
          ltgPool: parseInt(ltgPoolValue),
          rtgPool: parseInt(rtgPoolValue),
          ldpPool: parseInt(ldpPoolValue),
        });

        // Process rank details
        let pendingAmountTotal = BigInt("0");
        const processedRankDetails: RankDetail[] = [];

        // Process rank LTG details
        rankDetailsData.forEach((response: any, i: number) => {
          if (response && i <= 7) {
            pendingAmountTotal = pendingAmountTotal + response.pendingAmount;
          }

          if (response) {
            processedRankDetails.push({
              id: i,
              name: RANK_DEFINITIONS[i]?.name || `Rank ${i}`,
              count: response.count.toString(),
              pendingAmount: formatUnits(response.pendingAmount, 18),
              totalDistributedAmount: formatUnits(
                response.ttlDstrbtdAmount,
                18
              ),
            });
          }
        });

        // Set total pending amount
        setFinancialData((prev) => ({
          ...prev,
          totalPendingAmount: parseFloat(
            formatUnits(pendingAmountTotal, 18)
          ).toFixed(2),
        }));

        // Fetch rank details and calculate upgrade prices
        let currentRankCumulativePrice = 0;
        const rankDetailsPromises = RANK_DEFINITIONS.map(async (rank) => {
          try {
            const rankDetail = await contract.rankDetails(rank.index);
            const cumulativePrice = parseFloat(
              rankDetail.cumulativePrice.toString()
            );

            if (rank.name === userDetails?.currentRank) {
              currentRankCumulativePrice = cumulativePrice;
            }

            const rankUpgradePriceUSD =
              cumulativePrice - currentRankCumulativePrice;

            return {
              id: rank.index,
              name: rank.name,
              rankUpgradePriceUSD: rankUpgradePriceUSD.toFixed(2),
            };
          } catch (error) {
            console.error(`Error fetching rank ${rank.index} details:`, error);
            return null;
          }
        });

        const rankDetailsResults = await Promise.all(rankDetailsPromises);
        const validRankDetails = rankDetailsResults.filter(
          (detail): detail is Required<RankDetail> =>
            detail !== null &&
            typeof detail === "object" &&
            "id" in detail &&
            "name" in detail &&
            typeof detail.rankUpgradePriceUSD === "string"
        );

        setRankDetails([...processedRankDetails, ...validRankDetails]);
      } catch (error) {
        console.error("Error loading contract data:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadAllContractData();

    return () => {
      isMounted = false;
    };
  }, [
    isConnected,
    contract,
    address,
    userDetails?.currentRank,
    refreshGraphData,
  ]);

  const [rankGraphDataCache, setRankGraphDataCache] = useState<{
    data: GraphData | null;
    timestamp: number;
  }>({
    data: null,
    timestamp: 0,
  });

  // Generate graph data with proper optimization

  useEffect(() => {
    // Ultra-fast early exits
    if (!isConnected || !contract || !address) {
      setIsGraphLoading(false);
      return;
    }

    const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes cache
    const cacheKey = `rankGraphData_${address}_v${cacheVersion}`;
    // const cachedData = cache.get(cacheKey);

    if (cacheVersion > 1) {
      setRankGraphDataCache({ data: null, timestamp: 0 });
    }

    if (
      rankGraphDataCache.data &&
      Date.now() - rankGraphDataCache.timestamp < CACHE_DURATION
    ) {
      setRankGraphData(rankGraphDataCache.data);
      setIsGraphLoading(false);
      return;
    }

    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      console.log("Using localStorage cached graph data");

      // Update memory cache too
      setRankGraphDataCache({
        data: cachedData,
        timestamp: Date.now(),
      });

      setRankGraphData(cachedData);
      setIsGraphLoading(false);
      return;
    }

    // if (cachedData) {
    //   setRankGraphData(cachedData);
    //   setIsGraphLoading(false);
    //   return;
    // }
    // setIsGraphLoading(true);

    const generateRankGraphData = async () => {
      const startTime = performance.now();

      try {
        setIsGraphLoading(true);

        const RANK_INFO = [
          { name: "STAR", index: 0, color: "#B8B8B8" },
          { name: "BRONZE", index: 1, color: "#CD7F32" },
          { name: "SILVER", index: 2, color: "#C0C0C0" },
          { name: "GOLD", index: 3, color: "#FFD700" },
          { name: "DIAMOND", index: 4, color: "#10B981" },
          { name: "BLUE DIAMOND", index: 5, color: "#0EA5E9" },
          { name: "BLACK DIAMOND", index: 6, color: "#6B7280" },
          { name: "ROYAL DIAMOND", index: 7, color: "#F59E0B" },
          { name: "CROWN DIAMOND", index: 8, color: "#6366F1" },
        ];

        // Use more memory-efficient data structure
        const rankCountMap = new Map<number, number>();
        const processedAddresses = new Set<string>();

        // Hyper-optimized parallel processing
        const processReferralsParallel = async (
          addresses: string[],
          depth = 0,
          maxDepth = 8 // Reduced depth for faster processing
        ) => {
          if (depth >= maxDepth || addresses.length === 0) return;

          // Aggressive batch processing with increased concurrency
        // Aggressive batch processing with increased concurrency
      const BATCH_SIZE = 10; // Increased batch size
      for (let i = 0; i < addresses.length; i += BATCH_SIZE) {
        const batch = addresses.slice(i, i + BATCH_SIZE);

        await Promise.all(
          batch.map(async (address) => {
            // Immediate skip for processed addresses
            if (processedAddresses.has(address)) return [];

            processedAddresses.add(address);

            try {
              // First get user data for this address
              const userResponse = await userApi.getUserByAddress(address);
              const userData = userResponse.data?.user;
              
              if (!userData || !userData.id) {
                console.warn(`No user data found for address: ${address}`);
                return [];
              }
              
              // Then get referrals for this user's ID
              const detailsResponse = await userApi.getUserDetails(userData.id);
              const referrals = detailsResponse.data?.referrals || [];

              console.log("User data:", userData);
              console.log("User referrals:", referrals);

              // Rank counting - get the rank index from the rank name
              const rankIndex = RANK_INFO.findIndex(
                (rank) => rank.name === userData.currentRank
              );
              
              if (rankIndex >= 0 && rankIndex < 9) {
                rankCountMap.set(rankIndex, (rankCountMap.get(rankIndex) || 0) + 1);
              }

              // Return referral addresses for next level processing
               // Return referral addresses for next level processing
               return referrals.map((ref: any) => ref.address).filter(
                (refAddress: string) => typeof refAddress === "string" && !processedAddresses.has(refAddress)
              );
            } catch (error) {
              console.warn(`Processing error for ${address}:`, error);
              return [];
            }
          })
        ).then(async (results) => {
          // Flatten and filter results
          const nextLevelReferrals = results
            .flat()
            .filter(
              (ref) => typeof ref === "string" && !processedAddresses.has(ref)
            );

          // Recursive processing with reduced overhead
          if (nextLevelReferrals.length > 0) {
            await processReferralsParallel(
              nextLevelReferrals,
              depth + 1,
              maxDepth
            );
          }
        });
      }
    };

    // Start processing with minimal initial delay
    await processReferralsParallel([address]);

    // Efficient rank count conversion
    const rankCounts = RANK_INFO.map(
      (_, index) => rankCountMap.get(index) || 0
    );

    // Lightweight graph data construction
    const graphData = {
      labels: RANK_INFO.map((rank) => rank.name),
      datasets: [
        {
          label: "Number of Users",
          data: rankCounts,
          backgroundColor: RANK_INFO.map((rank) => `${rank.color}80`),
          borderColor: RANK_INFO.map((rank) =>
            rank.color === "#000000"
              ? "#111111"
              : darkenColor(rank.color, -30)
          ),
          borderWidth: 2,
          borderRadius: {
            topLeft: 8,
            topRight: 8,
            bottomLeft: 0,
            bottomRight: 0,
          },
        },
      ],
    };

    setRankGraphDataCache({
      data: graphData,
      timestamp: Date.now(),
    });
    cache.set(cacheKey, graphData, CACHE_DURATION);

    // Immediate state updates
    setRankGraphData(graphData);

    // Optional performance logging
    const endTime = performance.now();
    console.log(`Rank graph generated in ${endTime - startTime}ms`);
  } catch (error) {
    console.error("Rank graph generation failed:", error);
    setRankGraphData({
      labels: [],
      datasets: [],
    });
  } finally {
    setIsGraphLoading(false);
  }
};
    // Minimized initialization delay
    const timer = setTimeout(generateRankGraphData, 2);

    return () => clearTimeout(timer);
  }, [
    isConnected,
    contract,
    address,
    cacheVersion,
    rankGraphDataCache.timestamp,
  ]);

  const handleRefreshGraph = useCallback(() => {
    refreshGraphData();
  }, [refreshGraphData]);

  // Address change reset effect
  useEffect(() => {
    // Immediate cache and graph reset
    setRankGraphDataCache({ data: null, timestamp: 0 });
    setRankGraphData({ labels: [], datasets: [] });
  }, [address]); // Add this effect before the existing graph generation effect
  // Animate the user count

  // Animate the user count
  useEffect(() => {
    if (usrCnt !== null) {
      let currentCount = 0;
      const increment = Math.ceil(usrCnt / 999);
      const interval = setInterval(() => {
        if (currentCount < usrCnt) {
          currentCount += increment;
          if (currentCount > usrCnt) {
            currentCount = usrCnt;
          }
          setCount(currentCount);
        } else {
          clearInterval(interval);
        }
      }, 20);
      return () => clearInterval(interval);
    }
  }, [usrCnt]);

  // Animate pool counts
  useEffect(() => {
    const animatePoolCount = (
      _target: string,
      value: number,
      setter: (value: number) => void
    ) => {
      if (value === 0) {
        setter(0);
        return () => {};
      }

      let currentCount = 0;
      const increment = Math.ceil(value / 800);
      const interval = setInterval(() => {
        if (currentCount < value) {
          currentCount += increment;
          if (currentCount > value) {
            currentCount = value;
          }
          setter(currentCount);
        } else {
          clearInterval(interval);
        }
      }, 15);

      return () => clearInterval(interval);
    };

    const ltgClearFn = animatePoolCount(
      "LTG",
      poolData.ltgPool,
      setCountLTGPool
    );
    const rtgClearFn = animatePoolCount(
      "RTG",
      poolData.rtgPool,
      setCountRTGPool
    );
    const ldpClearFn = animatePoolCount(
      "LDP",
      poolData.ldpPool,
      setCountLDPPool
    );

    return () => {
      ltgClearFn();
      rtgClearFn();
      ldpClearFn();
    };
  }, [poolData]);

  // Check rank expiration and set marquee data
  useEffect(() => {
    if (userDetails?.rankExpiryTime && userDetails?.currentRank) {
      const rankIndex = RANK_DEFINITIONS.findIndex(
        (rank) => rank.name === userDetails.currentRank
      );
      const goldRankIndex = RANK_DEFINITIONS.findIndex(
        (rank) => rank.name === "GOLD"
      );
      const diamondRankIndex = RANK_DEFINITIONS.findIndex(
        (rank) => rank.name === "DIAMOND"
      );

      // Set the rank-specific message
      if (rankIndex < goldRankIndex) {
        setRankMessage(
          "Rank is going to expire. Either upgrade your rank or sponsor a new Member!"
        );
      } else if (rankIndex >= diamondRankIndex) {
        setRankMessage(
          "Rank is going to expire. Either upgrade your rank or sponsor an elite rank Member!"
        );
      } else {
        setRankMessage("");
      }

      // Calculate time remaining
      const expiryTime = new Date(
        `${userDetails.rankExpiryTime} 23:59:59`
      ).getTime();
      const currentTime = Date.now();
      const oneHourBeforeExpiry = expiryTime - 60 * 60 * 1000;

      setIsRankExpired(currentTime > expiryTime);
      setShowMarquee(
        currentTime >= oneHourBeforeExpiry && currentTime <= expiryTime
      );
    }
  }, [userDetails?.rankExpiryTime, userDetails?.currentRank]);

  // Event handlers - memoized to prevent unnecessary re-renders
  const handleUpdateNickname = useCallback(async () => {
    if (!address || !newNickname) {
      toast.error("Please connect your wallet and enter a nickname");
      return;
    }

    setIsNicknameLoading(true);
    try {
      const result = await updateNickname(newNickname);
      if (result.success) {
        toast.success(result.message);
        setShowNicknameModal(false);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error updating nickname:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsNicknameLoading(false);
    }
  }, [address, newNickname, updateNickname]);

  const handleImageUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file || !address) {
        toast.error("Please select a file and ensure wallet is connected.");
        return;
      }

      // Clear preview
      setPreviewImage(null);
      setAvatarUrl(null);

      try {
        setIsUploading(true);

        // Basic validation
        if (!file.type.startsWith("image/")) {
          throw new Error("Please upload an image file");
        }

        if (file.size > 5 * 1024 * 1024) {
          throw new Error("File size should be less than 5MB");
        }

        // Compress and upload
        const compressedFile = await compressImage(file);
        const result = await updateAvatar(compressedFile);

        if (result.success) {
          setAvatarUrl(result.url || null);
          toast.success(result.message);
        } else {
          toast.error(result.message);
        }
      } catch (error) {
        console.error("Upload error:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Upload failed. Please try again."
        );
      } finally {
        setIsUploading(false);
        if (event.target) {
          event.target.value = "";
        }
      }
    },
    [address, updateAvatar, setAvatarUrl]
  );

  const copyToClipboard = useCallback(() => {
    navigator.clipboard
      .writeText(inviteLink)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy:", err);
        toast.error("Failed to copy to clipboard");
      });
  }, [inviteLink]);

  // const handleWithdrawLevel = useCallback(async () => {
  //   if (!isConnected || !contract || !address) {
  //     toast.error("Wallet not connected");
  //     return;
  //   }

  //   if (isRankExpired === true) {
  //     toast.error(
  //       "Cannot withdraw - your rank has expired. Please upgrade your rank first."
  //     );
  //     return;
  //   }

  //   try {
  //     setIsLoadingLevel(true);
  //     const tx = await contract.withdrawLevelIncome();
  //     await tx.wait();

  //     // Show success animation
  //     setShowConfetti(true);

  //     // Update data without full reload
  //     const [withdrawableLevelIncome, totalLevelReceived] = await Promise.all([
  //       contract.getWthlvlIncm(address),
  //       contract.getUsrTtllvlrcvd(address),
  //     ]);

  //     setFinancialData((prev) => ({
  //       ...prev,
  //       withdrawalLevel: parseFloat(
  //         formatUnits(withdrawableLevelIncome || "0", 18)
  //       ).toFixed(4),
  //       totalLevel: parseFloat(
  //         formatUnits(totalLevelReceived || "0", 18)
  //       ).toFixed(4),
  //     }));

  //     toast.success("🎉 Level Distribution Pool withdrawn successfully!");

  //     setTimeout(() => {
  //       setShowConfetti(false);
  //     }, 5000);
  //   } catch (error) {
  //     console.error("Error during Level withdrawal:", error);
  //     toast.error("Failed to withdraw Level Distribution Pool.");
  //   } finally {
  //     setIsLoadingLevel(false);
  //   }
  // }, [isConnected, contract, address, isRankExpired]);

  // const handleWithdrawRab = useCallback(async () => {
  //   if (!isConnected || !contract || !address) {
  //     toast.error("Wallet not connected");
  //     return;
  //   }

  //   if (isRankExpired === true) {
  //     toast.error(
  //       "Cannot withdraw - your rank has expired. Please upgrade your rank first."
  //     );
  //     return;
  //   }

  //   try {
  //     setIsLoadingRab(true);
  //     const tx = await contract.claimMonthlyRab();
  //     await tx.wait();

  //     // Show success animation
  //     setShowConfetti(true);

  //     // Update data without full reload
  //     const [withdrawableRAB, totalRABReceived] = await Promise.all([
  //       contract.getWthrabIncome(address),
  //       contract.getUsrTtlrabrcvd(address),
  //     ]);

  //     setFinancialData((prev) => ({
  //       ...prev,
  //       withdrawalRAB: parseFloat(
  //         formatUnits(withdrawableRAB || "0", 18)
  //       ).toFixed(4),
  //       totalRAB: parseFloat(formatUnits(totalRABReceived || "0", 18)).toFixed(
  //         4
  //       ),
  //     }));

  //     toast.success("🎉 RAB withdrawn successfully!");

  //     setTimeout(() => {
  //       setShowConfetti(false);
  //     }, 5000);
  //   } catch (error) {
  //     console.error("Error during RAB withdrawal:", error);
  //     toast.error("Failed to withdraw RAB.");
  //   } finally {
  //     setIsLoadingRab(false);
  //   }
  // }, [isConnected, contract, address, isRankExpired]);

  const handleWithdrawal = async (type) => {
    // Skip if no user data or contract
    if (!userData || !userDetails || !contract || !address) {
      toast.error("Please check your connection and try again");
      return;
    }
  
    // Check for rank expiration
    if (isRankExpired === true) {
      toast.error("Cannot withdraw - your rank has expired. Please upgrade your rank first.");
      return;
    }
  
    try {
      // Step 1: Update UI state to show loading
      setWithdrawal({
        isProcessing: true,
        type,
        sessionData: null,
        step: "init",
        error: "",
      });
  
      // Step 2: Create a withdrawal session
      let response;
      if (type === "LEVEL") {
        response = await rewardApi.createLevelWithdrawal(userDetails.id);
      } else if (type === "LTG") {
        response = await rewardApi.createLTGWithdrawal(userDetails.id);
      } else {
        response = await rewardApi.createRABWithdrawal(userDetails.id);
      }
  
      console.log(`${type} withdrawal session created:`, response);
  
      // Step 3: Validate response
      if (!response.status === "success" || !response.data) {
        throw new Error("Invalid response from server");
      }
  
      // Step 4: Update state with session data
      setWithdrawal({
        isProcessing: true,
        type,
        sessionData: response.data,
        step: "processing",
        error: "",
      });
  
      // Step 5: Execute blockchain transaction based on withdrawal type
      let tx;
      if (type === "LEVEL") {
        tx = await contract.withdrawLevelIncome();
      } else if (type === "LTG") {
        // Check if your contract has a dedicated LTG withdrawal method
        // If not, you might need to use a general withdrawal method or ask the contract developer
        // For now, we'll assume it has withdrawLTGIncome or fallback to withdrawLevelIncome
        tx = contract.withdrawLTGIncome 
            ? await contract.withdrawLTGIncome()
            : await contract.withdrawLevelIncome();
      } else if (type === "RAB") {
        tx = await contract.claimMonthlyRab();
      } else {
        throw new Error("Unknown withdrawal type");
      }
  
      // Step 6: Wait for transaction confirmation
      const receipt = await tx.wait();
      console.log("Transaction receipt:", receipt);
  
      // Step 7: Process the withdrawal with backend API
      let processResult;
      if (type === "LEVEL") {
        processResult = await rewardApi.processLevelWithdrawal({
          sessionData: response.data,
          transactionHash: receipt.hash || receipt.transactionHash,
        });
      } else if (type === "LTG") {
        processResult = await rewardApi.processLTGWithdrawal({
          sessionData: response.data,
          transactionHash: receipt.hash || receipt.transactionHash,
        });
      } else if (type === "RAB") {
        processResult = await rewardApi.processRABWithdrawal({
          sessionData: response.data,
          transactionHash: receipt.hash || receipt.transactionHash,
        });
      }
  
      console.log("Withdrawal process result:", processResult);
  
      // Step 8: Update UI to show success
      setWithdrawal({
        isProcessing: false,
        type,
        sessionData: response.data,
        step: "success",
        error: "",
      });
  
      // Step 9: Show success animation and notification
      setShowConfetti(true);
      toast.success(`🎉 ${type} withdrawn successfully!`);
  
      // Step 10: Refresh user data to update balances
      const userResponse = await userApi.getUserByAddress(address);
      if (userResponse.data && userResponse.data.user) {
        const userData = userResponse.data.user;
        const detailsResponse = await userApi.getUserDetails(userData.id);
        setRewards(detailsResponse.data?.user?.reward);
      }
  
      // Step 11: Cleanup after a delay
      setTimeout(() => {
        setShowConfetti(false);
        // Reset withdrawal state
        setWithdrawal({
          isProcessing: false,
          type: null,
          sessionData: null,
          step: "init",
          error: "",
        });
      }, 5000);
    } catch (error) {
      console.error(`Error during ${type} withdrawal:`, error);
      
      // Update state to show error
      setWithdrawal({
        isProcessing: false,
        type,
        sessionData: null,
        step: "error",
        error: error.message || `Failed to process ${type} withdrawal`,
      });
      
      toast.error(`Withdrawal failed: ${error.message || "An error occurred"}`);
      
      // Reset state after a delay
      setTimeout(() => {
        setWithdrawal({
          isProcessing: false,
          type: null,
          sessionData: null,
          step: "init",
          error: "",
        });
      }, 5000);
    }
  };

  const upgradeRank = useCallback(async () => {
    if (!selectedRank) {
      toast.info("Please select a rank to upgrade.");
      return;
    }

    if (!isConnected || !address) {
      toast.info("Wallet not connected.");
      return;
    }

    try {
      setIsLoading(true);
      const rankIndex = RANK_DEFINITIONS.findIndex(
        (rank) => rank.name === selectedRank
      );

      if (rankIndex < 0) {
        toast.info("Invalid rank selected.");
        return;
      }

      // console.log("the user is12",userDatarank.id,selectedRank)
      // Create upgrade session first
      const sessionResponse = await userApi.createUpgradeSession(
        userDetails.id,
        selectedRank
      );

      console.log("Upgrade session created:", sessionResponse);

      if (!sessionResponse.data || sessionResponse.status !== "success") {
        throw new Error("Failed to create upgrade session");
      }

      const sessionData = sessionResponse.data;

      await approveTokens(sessionData.totalCost.toString());

      // Execute deposit to get transaction hash
      const tx = await deposit(
        sessionData.totalCost.toString(),
        sessionData.sessionId
      );

      console.log("Deposit transaction:", tx);

      // Process the upgrade with backend using userApi
      const processResult = await userApi.processUpgrade({
        sessionData: sessionData,
        transactionHash: tx.hash || tx.transactionHash,
      });

      console.log("Upgrade process result:", processResult);

      setShowConfetti(true);
      toast.success(`🎉 Successfully upgraded to ${selectedRank}.`);

      setTimeout(() => {
        setShowConfetti(false);
        // Update user details with new rank info
        setUserDetails((prev) =>
          prev
            ? {
                ...prev,
                currentRank: selectedRank,
                lastRankUpdateTime: new Date().toLocaleDateString(),
                isExpired: false,
                isActive: true,
              }
            : null
        );

        refreshGraphData();
        setSelectedRank(null);
        setDropdownOpen(false);

        // Refresh data from API
        userApi
          .getUserByAddress(address)
          .then((response) => {
            if (response.data && response.data.user) {
              const userData = response.data.user;
              console.log("User data refreshed after upgrade:", userData);
            }
          })
          .catch((error) => {
            console.error("Error refreshing user data:", error);
          });
      }, 5000);
    } catch (error) {
      console.error("Error upgrading rank:", error);
      toast.error("Failed to upgrade rank. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedRank, isConnected, address, userData, deposit, refreshGraphData]);

// Move loadSelectedRankCost outside the useEffect and create a separate effect that watches for selectedRank changes

// Add this right after your other useEffects

// Add this useEffect after your existing rank cost loading effect
useEffect(() => {
  // Function to preload costs for all available ranks at once
  const preloadAllRankCosts = async () => {
    if (!userDetails || !userDetails.currentRank) {
      console.log("User details not loaded yet, can't preload rank costs");
      return;
    }
    
    console.log("Preloading costs for all available ranks...");
    
    // For each filtered rank (ranks higher than current), calculate the upgrade cost
    const loadPromises = filteredRanks.map(async (rank) => {
      try {
        console.log(`Calculating cost from ${userDetails.currentRank} to ${rank.name}`);
        const response = await rankApi.calculateUpgradeCost(
          userDetails.currentRank,
          rank.name
        );
        
        if (response.data) {
          console.log(`Got cost data for ${rank.name}:`, response.data);
          return { rankName: rank.name, costData: response.data };
        }
      } catch (error) {
        console.error(`Error calculating cost for ${rank.name}:`, error);
      }
      return null;
    });
    
    // Wait for all costs to be calculated in parallel
    const results = await Promise.all(loadPromises);
    
    // Update rankCosts state with all the results
    const newRankCosts = { ...rankCosts };
    results.forEach(result => {
      if (result) {
        newRankCosts[result.rankName] = result.costData;
      }
    });
    
    console.log("All rank costs loaded:", newRankCosts);
    setRankCosts(newRankCosts);
  };
  
  // Call the preload function when user details and filteredRanks are available
  if (userDetails && userDetails.currentRank && filteredRanks.length > 0) {
    preloadAllRankCosts();
  }
  
}, [userDetails]); // Depend on userDetails and filteredRanks
  // Utility functions
  const darkenColor = (hex: string, amount: number): string => {
    let usePound = false;
    if (hex[0] === "#") {
      hex = hex.slice(1);
      usePound = true;
    }

    let num = parseInt(hex, 16);
    let r = (num >> 16) + amount;
    let g = ((num >> 8) & 0x00ff) + amount;
    let b = (num & 0x0000ff) + amount;

    r = Math.min(255, Math.max(0, r));
    g = Math.min(255, Math.max(0, g));
    b = Math.min(255, Math.max(0, b));

    return (
      (usePound ? "#" : "") +
      ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)
    );
  };

  const formatNumber = (num: number): string => {
    if (num >= 1_000_000_000) {
      return (num / 1_000_000_000).toFixed(1) + "B";
    } else if (num >= 1_000_000) {
      return (num / 1_000_000).toFixed(1) + "M";
    } else if (num >= 1_000) {
      return (num / 1_000).toFixed(1) + "K";
    } else {
      return num.toString();
    }
  };

  const calculateTotalRewards = (rewards: any) => {
    if (!rewards) return 0;
  
    const { totalLevelIncomeReceived, totalRABIncomeReceived, totalLTGReceived } = rewards;
  
    return (
      parseFloat(totalLevelIncomeReceived || 0) +
      parseFloat(totalRABIncomeReceived || 0) +
      parseFloat(totalLTGReceived || 0)
    );
  };

  // Dropdown and click handling
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const dropdownMenu = document.getElementById("rankDropdownMenu");
      const dropdownButton = document.getElementById("rankDropdownButton");

      if (
        dropdownMenu &&
        dropdownButton &&
        !dropdownMenu.contains(event.target as Node) &&
        !dropdownButton.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  // Memoized values for performance
  const currentRankIndex = useMemo(() => {
    return RANK_DEFINITIONS.findIndex(
      (rank) => rank.name === userDetails?.currentRank
    );
  }, [userDetails?.currentRank]);

  // Filtered ranks greater than the user's current rank
  const filteredRanks = useMemo(() => {
    return RANK_DEFINITIONS.filter((rank) => rank.index > currentRankIndex);
  }, [currentRankIndex]);

  // Only redirect if not connected - this prevents unnecessary renders
  if (!isConnected) {
    navigate("/");
    return null;
  }

  // Reusable UI Components
  const StatCard = ({ icon: Icon, value, label, gradient }: StatCardProps) => (
    <motion.div
      whileHover={{ scale: 1.05, rotate: 0.5 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={`relative overflow-hidden rounded-2xl p-6 transition-all duration-500 ${gradient} shadow-lg`}
    >
      <div className="absolute inset-0 bg-black/10 backdrop-blur-md transition-opacity duration-500" />
      <div className="relative flex items-start justify-between">
        <div className="space-y-4">
          <div className="rounded-xl bg-white/20 p-3 w-fit transition-transform duration-500 hover:scale-105">
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-3xl font-bold text-white tracking-tight">
              {value}
              <span className="text-purple-300 ml-1">+</span>
            </div>
            <div className="text-sm font-medium text-white/80 mt-1">
              {label}
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/10 to-white/5 rounded-full -mr-16 -mt-16 backdrop-blur-lg transition-all duration-500 group-hover:scale-110" />
      </div>
    </motion.div>
  );

  return (
    <div className="relative">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
      />

      {showConfetti && <Confetti width={width} height={height} />}

      <div className="w-full min-h-screen p-4 md:p-6 font-poppins space-y-8">
        {/* Marquee Alert */}
        {showMarquee && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-xl bg-gradient-to-r from-yellow-100/90 to-amber-100/90 border border-yellow-200 shadow-lg backdrop-blur-sm"
          >
            <div className="p-4">
              <div className="marquee text-amber-900 font-semibold text-sm">
                {rankMessage}
              </div>
            </div>
          </motion.div>
        )}

        {/* Main Stats Section */}
        <div className="grid grid-flow-row-dense md:grid-cols-3 gap-6">
          <StatCard
            icon={TrendingUp}
            value={isConnected ? formatNumber(countLTGPool) : "0"}
            label="LTGB"
            gradient="bg-gradient-to-br from-blue-600 to-indigo-600"
          />

          <StatCard
            icon={Award}
            value={isConnected ? formatNumber(countRTGPool) : "0"}
            label="RAB"
            gradient="bg-gradient-to-br from-purple-600 to-pink-600"
          />

          <StatCard
            icon={DollarSign}
            value={isConnected ? formatNumber(countLDPPool) : "0"}
            label="LB"
            gradient="bg-gradient-to-br from-emerald-600 to-teal-600"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 md:grid-cols-1 gap-4 w-full relative ">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 backdrop-blur-3xl" />

          {/* Left Section - Main Content */}
          <div className="col-span-1 lg:col-span-4 w-full relative">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
              {/* Profile Card */}
              <div
                className={cn(
                  "relative group overflow-hidden rounded-3xl border border-white/20 shadow-lg"
                )}
              >
                {/* Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-purple-600/20 to-indigo-600/20 group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-none" />

                {/* Content */}
                <div className="relative p-8 flex flex-col items-center justify-center min-h-[300px]">
                  {/* Profile Image */}
                  <div className="relative mb-6 group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt" />
                    <div className="relative">
                      {isUploading ? (
                        <div className="w-24 h-24 rounded-full border-2 border-white/80 flex items-center justify-center bg-gray-800">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                        </div>
                      ) : previewImage || userData?.avatar ? (
                        <img
                          src={previewImage || userData?.avatar || ""}
                          alt="Profile"
                          className="w-28 h-28 object-cover rounded-full border-2 border-white/80"
                          onError={(e) => {
                            console.error("Image failed to load:", e);
                            e.currentTarget.src = "";
                            setUserData((prev) =>
                              prev ? { ...prev, avatar: undefined } : null
                            );
                          }}
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-full border-2 border-white/80 flex items-center justify-center bg-gray-800">
                          <User className="w-12 h-12 text-white/80" />
                        </div>
                      )}

                      {/* Camera Icon Button */}
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="absolute bottom-0 right-0 p-2 bg-indigo-600 rounded-full hover:bg-indigo-700 transition-colors duration-200"
                      >
                        <Camera className="w-4 h-4 text-white" />
                      </button>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </div>

                  {/* User Info */}
                  <h3 className="text-2xl font-bold text-white mb-3">
                    {userData?.nickname || "Anonymous User"}
                  </h3>
                  <p className="text-sm text-white/80 bg-black/40 px-4 py-1.5 rounded-full mb-4">
                    {address
                      ? `${address.slice(0, 6)}...${address.slice(-4)}`
                      : "Wallet not connected"}
                  </p>
                  <Button
                    onClick={() => setShowNicknameModal(true)}
                    variant="secondary"
                    className="hover:bg-indigo-700 transition-colors duration-200"
                  >
                    Update Profile
                  </Button>
                </div>

                {/* Nickname Modal */}
                <Dialog
                  open={showNicknameModal}
                  onOpenChange={setShowNicknameModal}
                >
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Update Your Profile</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Input
                          id="nickname"
                          value={newNickname}
                          onChange={(e) => setNewNickname(e.target.value)}
                          placeholder="Enter new nickname"
                          className="col-span-3"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setShowNicknameModal(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleUpdateNickname}
                        disabled={isNicknameLoading}
                      >
                        {isNicknameLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Save Changes"
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Level Bonus Card */}
              <div className="relative group overflow-hidden rounded-3xl border border-white/20 shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 to-teal-600/20 group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 backdrop-blur-xl" />
                <div className="relative p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Trophy className="w-6 h-6 text-emerald-500" />
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                      Level Bonus
                    </h3>
                  </div>

                  {!isConnected ? (
                    <div className="text-center text-gray-600 dark:text-white/70">
                      Connect wallet to view
                    </div>
                  ) : isLoadingLevel ? (
                    <div className="text-center text-gray-600 dark:text-white/70">
                      Loading...
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <span className="text-sm text-gray-600 dark:text-white/70">
                          Withdrawal Level:
                        </span>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                         {parseFloat(rewards?.withdrawableLevelIncome).toFixed(4)} 
                        </div>
                        <button
                          onClick={() => handleWithdrawal("LTG")}
                          className="mt-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg
                        hover:from-emerald-600 hover:to-teal-600 transform transition-all duration-300 
                        hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
                        >
                          Withdraw
                        </button>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600 dark:text-white/70">
                          Total Level:
                        </span>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                        {parseFloat(rewards?.totalLevelIncomeReceived).toFixed(4)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* RAB Card */}
              <div className="relative group overflow-hidden rounded-3xl border border-white/20 shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-600/20 to-orange-600/20 group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 backdrop-blur-xl" />
                <div className="relative p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Award className="w-6 h-6 text-amber-500" />
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                      Rank Achievement
                    </h3>
                  </div>

                  {!isConnected ? (
                    <div className="text-center text-gray-600 dark:text-white/70">
                      Connect wallet to view
                    </div>
                  ) : isLoadingRab ? (
                    <div className="text-center text-gray-600 dark:text-white/70">
                      Loading...
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <span className="text-sm text-gray-600 dark:text-white/70">
                          Withdrawal RAB:
                        </span>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                        {parseFloat(rewards?.withdrawableRABIncome).toFixed(4)}
                        </div>
                        <button
                         onClick={() => handleWithdrawal("RAB")}
                          className="mt-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg
                        hover:from-amber-600 hover:to-orange-600 transform transition-all duration-300 
                        hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
                        >
                          Withdraw
                        </button>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600 dark:text-white/70">
                          Total RAB:
                        </span>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                        {parseFloat(rewards?.totalRABIncomeReceived).toFixed(4)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Lifetime Growth Bonus Card */}
              <div className="relative group overflow-hidden rounded-3xl border border-white/20 shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-cyan-600/20 group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 backdrop-blur-xl" />
                <div className="relative p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <TrendingUp className="w-6 h-6 text-blue-500" />
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                      Growth Bonus
                    </h3>
                  </div>

                  {!isConnected ? (
                    <div className="text-center text-gray-600 dark:text-white/70">
                      Connect wallet to view
                    </div>
                  ) : isLoading ? (
                    <div className="text-center text-gray-600 dark:text-white/70">
                      Loading...
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600 dark:text-white/70">
                             Bonus:
                          </span>
                          <Tooltip.Provider>
                            <Tooltip.Root>
                              <Tooltip.Trigger asChild>
                                <Info className="w-4 h-4 text-blue-500 cursor-help" />
                              </Tooltip.Trigger>
                              <Tooltip.Portal>
                                <Tooltip.Content className="bg-white/10 backdrop-blur-md p-2 z-50 rounded-lg border border-white/20 text-white text-sm">
                                  Transfers after two referrals
                                  <Tooltip.Arrow className="fill-white/20" />
                                </Tooltip.Content>
                              </Tooltip.Portal>
                            </Tooltip.Root>
                          </Tooltip.Provider>
                        </div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                        {parseFloat(rewards?.withdrawableLTGIncome).toFixed(4)}
                        </div>

                        <button
                          onClick={() => handleWithdrawal("LTG")}
                          className="mt-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg
                        hover:from-amber-600 hover:to-orange-600 transform transition-all duration-300 
                        hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
                        >
                          Withdraw
                        </button>
                      </div>
                      
                      <div>
                        <span className="text-sm text-gray-600 dark:text-white/70">
                          Total Bonus:
                        </span>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                        {parseFloat(rewards?.totalLTGReceived).toFixed(4) }
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Total Rewards Card */}
          <div className="col-span-1 lg:col-span-1 w-full relative z-10">
            <div className="relative group overflow-hidden rounded-3xl border border-white/20 shadow-lg h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-pink-600/20 group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 backdrop-blur-xl" />
              <div className="relative p-8 flex flex-col items-center justify-center h-full">
                <div className="mb-6">
                  <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt" />
                    <Gift className="w-16 h-16 text-purple-500 relative transform group-hover:scale-110 transition-transform duration-300" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Total Rewards
                </h3>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                {calculateTotalRewards(rewards).toFixed(2)}
                </div>
                <p className="text-sm text-gray-600 dark:text-white/70">
                  Total Earnings
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* User Details Card - Adjusted size */}
          <Card className="md:col-span-4 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-800/80 to-cyan-600/20 group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 backdrop-blur-xl" />

            <div className="relative z-10">
              <CardHeader className="pb-8">
                <div className="flex flex-col items-center justify-center w-full">
                  <div
                    className="relative group mb-6 transform hover:scale-105 transition-all duration-300
      md:mb-4 md:transform md:hover:scale-95"
                  >
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full blur-lg opacity-75 group-hover:opacity-100 transition duration-700 animate-pulse" />
                    <div
                      className="relative p-5 bg-slate-900/90 rounded-full ring-2 ring-white/20 hover:ring-white/40 transition-all duration-300
        md:p-4"
                    >
                      <User
                        className="h-10 w-10 text-cyan-400 xs:h-6 xs:w-6 
          md:h-8 md:w-8"
                      />
                    </div>
                  </div>
                  <CardTitle
                    className="text-3xl font-bold text-center xs:text-xl 
      md:text-2xl"
                  >
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 animate-gradient">
                      User Details
                    </span>
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent
                className="w-full max-w-[500px] mx-auto p-4 2xs:p-2 
 md:max-w-[450px] md:p-3"
              >
                <div
                  className="grid grid-cols-2 gap-4 2xs:grid-cols-1 2xs:gap-2 
   md:grid-cols-2 md:gap-3"
                >
                  {[
                    {
                      icon: Link,
                      label: "Address",
                      value: userDetails?.address
                        ? `${userDetails.address.slice(
                            0,
                            6
                          )}...${userDetails.address.slice(-4)}`
                        : "Loading...",
                    },
                    {
                      icon: Award,
                      label: "Current Rank",
                      value: userDetails?.currentRank || "Loading...",
                    },
                    {
                      icon: Clock,
                      label: "Last Update",
                      value:  new Date(userDetails?.lastRankUpdateTime).toLocaleString() || "Loading...",
                     
                    },
                    {
                      icon: Calendar,
                      label: "Rank Expiry",
                      value:
                        userDetails === null ? (
                          "Loading..."
                        ) : !userDetails.isActive ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gradient-to-r from-red-500/10 to-red-600/10 animate-pulse border border-red-500/20 2xs:text-[10px]">
                            <span className="text-red-500 animate-bounce text-xs 2xs:text-[10px]">
                              ⚠️
                            </span>
                            <span className="font-bold tracking-wide bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent text-xs 2xs:text-[10px]">
                              RANK EXPIRED
                            </span>
                          </span>
                        ) : (
                          new Date(userDetails?.rankExpiryTime).toLocaleString() || "Loading..."
                        ),
                    },
                    {
                      icon: DollarSign,
                      label: "Total Investment",
                      value: userDetails?.userTotalInvestment
                        ? Number(userDetails.userTotalInvestment).toFixed(2)
                        : "Loading...",
                    },
                    {
                      icon: Activity,
                      label: "Status",
                      value:
                        userDetails === null
                          ? "Loading..."
                          : userDetails.isActive
                          ? "Active"
                          : "Inactive",
                    },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="relative group p-3 rounded-xl border border-white/10 
         bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl
         hover:from-slate-800/80 hover:to-slate-900/80
         transition-all duration-300
         hover:border-white/20
         2xs:p-2 
         md:p-2.5"
                    >
                      <h4
                        className="flex items-center gap-2 text-sm font-medium text-slate-200 2xs:text-xs 
         md:text-xs"
                      >
                        <div
                          className="p-1.5 rounded-lg bg-slate-800/90 ring-1 ring-white/10 
           group-hover:ring-white/20 transition-all duration-300 
           2xs:p-1 
           md:p-1"
                        >
                          <item.icon
                            className="h-4 w-4 text-cyan-400 2xs:h-3 2xs:w-3 
             md:h-3.5 md:w-3.5"
                          />
                        </div>
                        {item.label}
                      </h4>
                      <p
                        className="mt-2 font-mono text-sm text-white/90 font-medium break-words 2xs:text-xs 
         md:text-xs"
                      >
                        {item.value}
                      </p>
                      <div
                        className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-blue-500/0 
         opacity-0 group-hover:opacity-100 transition-all duration-500"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </div>
          </Card>

          {/* Teams Ranks Progression Card - Enhanced dark mode and effects */}
          <div className="md:col-span-8 rounded-3xl relative overflow-hidden group h-full">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-200 to-blue-400 dark:from-slate-800/30 dark:to-slate-900/30" />

            <div
              className="relative p-3 sm:p-6 backdrop-blur-xl border-2 border-gray-300/10 
  shadow-xl dark:shadow-slate-900/50 hover:shadow-2xl transition-all duration-500 h-full"
            >
              <div className="flex justify-center items-center mb-4 sm:mb-6">
                <h2
                  className="font-bold text-lg sm:text-xl md:text-2xl bg-gradient-to-r from-blue-500 to-blue-600 
    bg-clip-text text-transparent transition-colors duration-300 text-center px-2 py-1 leading-normal"
                >
                  Team Ranks Progression
                </h2>

                <button
                  onClick={handleRefreshGraph}
                  className="p-2 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 transition-colors"
                  title="Refresh graph data"
                >
                  <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>

              <div className="w-full overflow-x-auto rounded-xl p-2 sm:p-4">
                <div className="min-w-[300px] sm:min-w-[355px] h-[300px] sm:h-[400px]">
                  {isGraphLoading ? (
                    <div className="w-full h-full flex flex-col items-center justify-center">
                      {/* Main loader animation */}
                      <div className="relative w-20 h-20">
                        {/* Outer rotating ring */}
                        <div
                          className="absolute inset-0 rounded-full border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent animate-spin"
                          style={{ animationDuration: "1.5s" }}
                        ></div>

                        {/* Middle rotating ring (opposite direction) */}
                        <div
                          className="absolute inset-0 rounded-full border-4 border-t-transparent border-r-transparent border-b-blue-400 border-l-transparent animate-spin"
                          style={{
                            animationDuration: "2s",
                            animationDirection: "reverse",
                            margin: "5px",
                          }}
                        ></div>

                        {/* Inner pulsing circle */}
                        <div className="absolute inset-0 m-4 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 animate-pulse flex items-center justify-center">
                          <div className="text-white">
                            <TrendingUp className="w-6 h-6" />
                          </div>
                        </div>
                      </div>

                      {/* Text content */}
                      <div className="mt-8 text-center">
                        <p className="text-blue-500 dark:text-blue-400 font-semibold bg-gradient-to-r from-blue-500 to-indigo-400 bg-clip-text text-transparent">
                          Loading team rankings
                        </p>
                        <div className="flex items-center justify-center mt-2 space-x-1">
                          <span className="text-sm text-blue-400/70 dark:text-blue-300/70">
                            Please wait
                          </span>
                          {/* Animated dots */}
                          <span className="flex space-x-1">
                            <span
                              className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"
                              style={{
                                animationDelay: "0s",
                                animationDuration: "1s",
                              }}
                            ></span>
                            <span
                              className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"
                              style={{
                                animationDelay: "0.2s",
                                animationDuration: "1s",
                              }}
                            ></span>
                            <span
                              className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"
                              style={{
                                animationDelay: "0.4s",
                                animationDuration: "1s",
                              }}
                            ></span>
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Bar
                      data={rankGraphData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              stepSize: 1,
                              font: {
                                size: window.innerWidth < 640 ? 10 : 12,
                                weight: "bold",
                                family: "'Inter', sans-serif",
                              },
                              color: "#FFFFFF",
                              padding: window.innerWidth < 640 ? 6 : 10,
                            },
                            title: {
                              display: true,
                              text: "Number of Users",
                              font: {
                                size: window.innerWidth < 640 ? 12 : 14,
                                weight: "bold",
                                family: "'Inter', sans-serif",
                              },
                              color: "#FFFFFF",
                              padding: window.innerWidth < 640 ? 8 : 12,
                            },
                            grid: {
                              color: "rgba(255, 255, 255, 0.1)",
                              lineWidth: 1,
                            },
                          },
                          x: {
                            grid: { display: false },
                            ticks: {
                              autoSkip: true,
                              maxRotation: 45,
                              minRotation: 0,
                              font: {
                                size: window.innerWidth < 640 ? 8 : 10,
                                weight: "bold",
                                family: "'Inter', sans-serif",
                              },
                              color: "#FFFFFF",
                              padding: window.innerWidth < 640 ? 4 : 8,
                            },
                          },
                        },
                        plugins: {
                          legend: { display: false },
                          tooltip: {
                            backgroundColor: "rgba(15, 23, 42, 0.95)",
                            titleColor: "#FFFFFF",
                            bodyColor: "#CBD5E1",
                            borderColor: "#475569",
                            borderWidth: 1,
                            padding: window.innerWidth < 640 ? 8 : 12,
                            cornerRadius: window.innerWidth < 640 ? 8 : 12,
                            titleSpacing: window.innerWidth < 640 ? 6 : 8,
                            bodySpacing: window.innerWidth < 640 ? 6 : 8,
                            displayColors: true,
                            callbacks: {
                              label: function (context) {
                                return `✨ Users: ${context.parsed.y}`;
                              },
                            },
                          },
                        },
                        elements: {
                          bar: {
                            backgroundColor: (context) => {
                              const ctx = context.chart.ctx;
                              const gradient = ctx.createLinearGradient(
                                0,
                                0,
                                0,
                                window.innerWidth < 640 ? 200 : 300
                              );
                              gradient.addColorStop(
                                0,
                                "rgba(56, 189, 248, 0.9)"
                              ); // Cyan
                              gradient.addColorStop(
                                1,
                                "rgba(59, 130, 246, 0.9)"
                              ); // Blue
                              return gradient;
                            },
                            borderRadius: window.innerWidth < 640 ? 6 : 8,
                            borderWidth: 0,
                            hoverBackgroundColor: (context) => {
                              const ctx = context.chart.ctx;
                              const gradient = ctx.createLinearGradient(
                                0,
                                0,
                                0,
                                window.innerWidth < 640 ? 200 : 300
                              );
                              gradient.addColorStop(0, "rgba(56, 189, 248, 1)"); // Brighter Cyan
                              gradient.addColorStop(1, "rgba(59, 130, 246, 1)"); // Brighter Blue
                              return gradient;
                            },
                            hoverBorderWidth: 2,
                            hoverBorderColor: "#FFFFFF",
                          },
                        },
                        hover: {
                          mode: "index",
                          intersect: false,
                        },
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full space-y-4 sm:space-y-6">
          <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
            {/* Enhanced Referral Link Section */}
            <Card
              className="relative overflow-hidden group p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-2 border-gray-200/20 
      bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-800 dark:to-slate-900
      hover:shadow-2xl hover:border-blue-500/20 transition-all duration-500"
            >
              {/* Animated background effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative z-10">
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    Referral Link
                  </h3>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                  <div className="relative group/qr w-24 sm:w-32">
                    <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl sm:rounded-2xl blur-lg opacity-0 group-hover/qr:opacity-20 transition-opacity duration-500" />
                    <img
                      src={userData?.referralQR || ""}
                      alt="QR Code"
                      className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg sm:rounded-xl border-2 border-white/10 shadow-lg transition-transform duration-300 group-hover/qr:scale-105"
                    />
                  </div>

                  <div className="flex flex-col gap-2 sm:gap-3 w-full">
                    <div className="relative">
                      <input
                        className="w-full px-2 sm:px-4 py-2 sm:py-3 bg-white/50 dark:bg-slate-800/50 rounded-lg sm:rounded-xl border border-gray-200/20 
  focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/20 transition-all duration-300
  text-xs sm:text-sm font-medium backdrop-blur-sm truncate"
                        value={inviteLink}
                        onClick={() => {
                          // When clicked, selects the full text
                          navigator.clipboard.writeText(inviteLink);
                        }}
                        readOnly
                        title={inviteLink}
                      />
                      <button
                        onClick={copyToClipboard}
                        className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 rounded-md sm:rounded-lg
                bg-gradient-to-r from-blue-500 to-cyan-500 text-white
                hover:from-blue-600 hover:to-cyan-600 transition-all duration-300
                focus:ring-2 focus:ring-blue-500/20"
                      >
                        {isCopied ? (
                          <CheckCheck className="w-3 h-3 sm:w-4 sm:h-4" />
                        ) : (
                          <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      Share your referral link to grow your community and earn
                      rewards
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Enhanced Rank Update Section */}
            <Card
              className="relative overflow-visible group p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-2 border-gray-200/20 
      bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-800 dark:to-slate-900
      hover:shadow-2xl hover:border-purple-500/20 transition-all duration-500"
            >
              {/* Animated background effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                      <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      Rank Upgrade
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-purple-500/10">
                    <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500" />
                    <span className="text-xs sm:text-sm font-medium text-purple-600 dark:text-purple-400">
                      {userDetails?.currentRank || "Loading..."}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  {/* Enhanced Dropdown */}
                  <div className="relative">
                    <button
                      id="rankDropdownButton"
                      onClick={() => setDropdownOpen((prev) => !prev)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border border-gray-200/20 
              bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm
              hover:bg-white/70 dark:hover:bg-slate-800/70
              focus:ring-2 focus:ring-purple-500/20 
              transition-all duration-300
              flex items-center justify-between"
                    >
                      <span className="text-xs sm:text-sm font-medium">
                        {selectedRank || "Select your rank"}
                      </span>
                      <ChevronDown
                        className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-300 ${
                          dropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {dropdownOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-30"
                          onClick={() => setDropdownOpen(false)}
                        />
                        <div
                          id="rankDropdownMenu"
                          className="absolute z-40 w-full mt-2 py-2 rounded-lg sm:rounded-xl border border-gray-200/20 
                  bg-white/90 dark:bg-slate-800/90 backdrop-blur-md shadow-xl
                  max-h-48 sm:max-h-64 overflow-y-auto"
                        >
                          {filteredRanks.map((rank, index) => {
                          
                          const rankCost = rankCosts[rank.name];
                          

                            return (
                              <div
                                key={index}
                                onClick={() => {
                                  setSelectedRank(rank.name);
                                  
                                  setDropdownOpen(false);
                                }}
                                className="px-3 sm:px-4 py-2 sm:py-3 hover:bg-purple-50 dark:hover:bg-purple-900/20 
                        cursor-pointer transition-colors duration-200"
                              >
                                <div className="flex items-center justify-between mb-1 sm:mb-2">
                                  <span className="text-xs sm:text-sm font-medium text-purple-600 dark:text-purple-400">
                                    {rank.name}
                                  </span>
                                  <ArrowUpCircle className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500" />
                                </div>
                                
                                <div className="space-y-0.5 sm:space-y-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                  <div className="flex justify-between">
                                    <span>Base Cost:</span>
                                    <span className="font-medium">
                                    {rankCost && rankCost.baseCostITC !== undefined 
              ? `${Number(rankCost.baseCostITC).toFixed(2)} ITC` 
              : "Loading..."}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Admin Fee:</span>
                                    <span className="font-medium">
                                    {rankCost && rankCost.adminFee !== undefined 
              ? `${Number(rankCost.adminFee).toFixed(2)} ITC` 
              : "Loading..."}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Total Cost:</span>
                                    <span className="font-medium">
                                    {rankCost && rankCost.totalITCCost !== undefined 
              ? `${Number(rankCost.totalITCCost).toFixed(2)} ITC` 
              : "Loading..."}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Enhanced Upgrade Button */}
                  <button
                    onClick={upgradeRank}
                    disabled={!selectedRank || !userDetails || isLoading}
                    className={`w-full px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-medium
            transition-all duration-300 transform hover:scale-[1.02]
            ${
              selectedRank && !isLoading
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:from-purple-700 hover:to-pink-700"
                : "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
            }`}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </div>
                    ) : (
                      "Upgrade Rank"
                    )}
                  </button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
