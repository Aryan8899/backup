import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import "simplebar/dist/simplebar.min.css";
import multiavatar from "@multiavatar/multiavatar";
import { Loader2 } from "lucide-react";
import {
  Provider,
  useAppKitProvider,
  useAppKitAccount,
} from "@reown/appkit/react";
import { BrowserProvider, Contract, formatUnits, JsonRpcSigner } from "ethers";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  TooltipProps,
} from "recharts";

//import { RANKS } from "../config/constants";

import contractAbi from "../contracts/Props/contractAbi.ts";
import contractAddress from "../contracts/Props/contractAddress.ts";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Trophy,
  Users,
  DollarSign,
  Clock,
  TrendingUp,
  ArrowUpCircle,
  ChartColumnBig,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  User,
  Award,
  LucideIcon,
} from "lucide-react";

import { rewardApi } from "../api/rewardApi";

import { rank4, rank5, rank6, rank7, rank8 } from "../assets/index";

// Types
interface UserDetails {
  referrer: string;
  currentRank: string;
  lastRankUpdateTime: string;
  rankExpiryTime: string;
  totalInvestment: string;
  isActive: boolean;
  rewards: string;
}

interface RankData {
  rank: string;
  count: number;
}

interface AddressData {
  rank: string;
  list: Array<{
    address: string;
    avatar: string;
  }>;
}

interface UserAddress {
  address: string;
  nickname?: string;
  avatar?: string;
}

interface RankInfo {
  name: string;
  index: number;
  image: string;
}

interface EliteRankInfo {
  id: number;
  name: string;
  image: string;
  color: string;
  minRank: number;
}

interface RankColor {
  [key: string]: string;
}

interface RankPercentage {
  [key: number]: number;
}

interface RankDetailItem {
  name: string;
  percentage: string;
  color: string;
  textColor: string;
  logo: string;
}

interface PayoutData {
  [key: string]: string;
}

interface ContractData {
  contract: Contract | null;
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
  address: string | undefined;
  isConnected: boolean;
  isProviderReady: boolean;
  isAdmin: boolean;
}

interface UserData {
  userDetails: UserDetails;
  userRank: string | null;
  isEligible: boolean | string;
  avatarSVG: string;
}

interface FinancialData {
  totalRab: string;
  monthlyRab: string;
  totalAmountAllocated: string;
  setTotalAmountAllocated: React.Dispatch<React.SetStateAction<string>>;
  rankshare: string;
  currentMonthIndex: number;
  fetchRankSharePercentage: (rankIndex: number) => Promise<void>;
  fetchCurrentMonthIndex: () => Promise<void>;
}

interface PayoutInfo {
  maxPayouts: PayoutData;
  remainingPayouts: PayoutData;
}

interface RankDistributionInfo {
  rankData: RankData[];
  loadingGraph: boolean;
}

interface EligibleAddressesInfo {
  rankAddresses: Record<string, UserAddress[]>;
  isLoading: boolean;
}

interface RabTimerInfo {
  startTime: number | null;
  endTime: number | null;
  remainingTime: string;
}

interface CopiedState {
  [key: string]: boolean;
}

// Component Props Types
interface StatCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  gradient: string;
}

interface TimeInfoSectionProps {
  currentMonth: string | number;
  startTime: number | null;
  endTime: number | null;
  remainingTime: string;
}

interface RankPayoutsTableProps {
  userRank: string | null;
  address: string | undefined;
  remainingPayouts: PayoutData;
  maxPayouts: PayoutData;
}

interface RankDistributionChartProps {
  rankData: RankData[];
  loadingGraph: boolean;
}

interface RankSectionProps {
  rank: EliteRankInfo;
  addresses: UserAddress[];
  expanded: boolean;
  onToggle: () => void;
  onCopy: (address: string, key: string) => void;
  copiedStates: CopiedState;
}

interface EligibleAddressesSectionProps {
  currentMonthIndex: number;
  rankAddresses: Record<string, UserAddress[]>;
  isLoading: boolean;
  onCopyAddress: (text: string, addrIdx: string) => void;
  copiedStates: CopiedState;
}

interface CustomTooltipProps extends TooltipProps<number, string> {
  active?: boolean;
  payload?: any[];
  label?: string;
}

// Constants
const ADMIN_ADDRESSES: string[] = [
  "0x3E582a9FFD780A4DFC8AAb220A644596772B919E",
];

const RANKS: RankInfo[] = [
  { name: "DIAMOND", index: 4, image: rank4 },
  { name: "BLUE_DIAMOND", index: 5, image: rank5 },
  { name: "BLACK_DIAMOND", index: 6, image: rank6 },
  { name: "ROYAL_DIAMOND", index: 7, image: rank7 },
  { name: "CROWN_DIAMOND", index: 8, image: rank8 },
];

const eliteRanks: EliteRankInfo[] = [
  {
    id: 4,
    name: "DIAMOND",
    image: rank4,
    color: "from-cyan-500 to-blue-600",
    minRank: 4,
  },
  {
    id: 5,
    name: "BLUE_DIAMOND",
    image: rank5,
    color: "from-blue-600 to-indigo-600",
    minRank: 5,
  },
  {
    id: 6,
    name: "BLACK_DIAMOND",
    image: rank6,
    color: "from-gray-700 to-black",
    minRank: 6,
  },
  {
    id: 7,
    name: "ROYAL_DIAMOND",
    image: rank7,
    color: "from-purple-600 to-violet-600",
    minRank: 7,
  },
  {
    id: 8,
    name: "CROWN_DIAMOND",
    image: rank8,
    color: "from-yellow-500 to-red-500",
    minRank: 8,
  },
];

const defaultUserDetails: UserDetails = {
  referrer: "Not Available",
  currentRank: "Loading..",
  lastRankUpdateTime: "Not Available",
  rankExpiryTime: "Not Available",
  totalInvestment: "0",
  isActive: false,
  rewards: "0",
};

// Helper functions
const getRankName = (rankIndex: string | number): string => {
  const ranks = [
    { name: "STAR", index: 0 },
    { name: "BRONZE", index: 1 },
    { name: "SILVER", index: 2 },
    { name: "GOLD", index: 3 },
    { name: "DIAMOND", index: 4 },
    { name: "BLUE_DIAMOND", index: 5 },
    { name: "BLACK_DIAMOND", index: 6 },
    { name: "ROYAL_DIAMOND", index: 7 },
    { name: "CROWN_DIAMOND", index: 8 },
  ];

  const rank = ranks.find((r) => r.index === parseInt(rankIndex.toString()));
  return rank ? rank.name : "Unknown Rank";
};

const getRankIndex = (rankName: string): number => {
  const ranks: Record<string, number> = {
    STAR: 0,
    BRONZE: 1,
    SILVER: 2,
    GOLD: 3,
    DIAMOND: 4,
    BLUE_DIAMOND: 5,
    BLACK_DIAMOND: 6,
    ROYAL_DIAMOND: 7,
    CROWN_DIAMOND: 8,
  };
  return ranks[rankName] ?? -1;
};

const getDisplayMonth = (monthIndex: number | string): string => {
  if (typeof monthIndex === "string") {
    if (monthIndex === "Loading...") return monthIndex;
    return `Month ${parseInt(monthIndex) + 1}`;
  }
  return `Month ${monthIndex + 1}`;
};

// Custom hooks for contract interaction
const useContractData = (): ContractData => {
  const { address, isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider<Provider>("eip155");
  const [contract, setContract] = useState<Contract | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [isProviderReady, setIsProviderReady] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // Initialize provider and contract
  useEffect(() => {
    const setup = async () => {
      if (!walletProvider || !isConnected) return;

      try {
        const ethersProvider = new BrowserProvider(walletProvider);
        setProvider(ethersProvider);

        const newSigner = await ethersProvider.getSigner();
        setSigner(newSigner);

        const contractInstance = new Contract(
          contractAddress,
          contractAbi,
          newSigner
        );
        setContract(contractInstance);

        // Check if user is admin
        if (address) {
          const normalizedAddress = address.toLowerCase();
          setIsAdmin(ADMIN_ADDRESSES.includes(normalizedAddress));
        }

        setIsProviderReady(true);
      } catch (error) {
        console.error("Error setting up contract:", error);
      }
    };

    setup();
  }, [walletProvider, isConnected, address]);

  return {
    contract,
    provider,
    signer,
    address,
    isConnected,
    isProviderReady,
    isAdmin,
  };
};

// Custom hook for user data
const useUserData = (
  contract: Contract | null,
  address: string | undefined,
  isConnected: boolean,
  isAdmin: boolean
): UserData => {
  const [userDetails, setUserDetails] =
    useState<UserDetails>(defaultUserDetails);
  const [userRank, setUserRank] = useState<string | null>(null);
  const [isEligible, setIsEligible] = useState<boolean | string>("Loading...");
  const [avatarSVG, setAvatarSVG] = useState<string>("");

  // Get user details from blockchain
  useEffect(() => {
    const fetchUserData = async () => {
      if (!contract || !isConnected || !address) return;

      try {
        // Skip for admin users
        if (isAdmin) {
          console.log("Admin detected - skipping user data fetch");
          return;
        }

        // Get user data
        const userData = await contract.users(address);
        const currentRankName = getRankName(userData[0]?.toString() || "0");

        const formattedData: UserDetails = {
          referrer: userData[2] || "No referrer",
          currentRank: currentRankName,
          lastRankUpdateTime: userData.lastRankUpdateTime
            ? new Date(
                Number(userData.lastRankUpdateTime) * 1000
              ).toLocaleDateString()
            : "Not updated",
          rankExpiryTime: userData.rankExpiryTime
            ? new Date(
                Number(userData.rankExpiryTime) * 1000
              ).toLocaleDateString()
            : "Not set",
          totalInvestment: formatUnits(userData[5]?.toString() || "0", 18),
          isActive: userData[1] || false,
          rewards: Array.isArray(userData[6])
            ? formatUnits(userData[6][0]?.toString() || "0", 18)
            : "0",
        };

        setUserDetails(formattedData);
        setUserRank(currentRankName);

        // Fetch avatar
        const avatar = multiavatar(address);
        setAvatarSVG(avatar);
      } catch (error) {
        console.error("Error fetching user details:", error);
        setUserDetails(defaultUserDetails);
      }
    };

    fetchUserData();
  }, [contract, address, isConnected, isAdmin]);

  // Check eligibility
  useEffect(() => {
    const checkEligibility = async () => {
      if (!contract || !address || !userRank) return;

      try {
        const rankIndex = getRankIndex(userRank);
        if (rankIndex < 0) return;

        const rankDuration = await contract.userRankDurations(
          address,
          rankIndex
        );
        setIsEligible(rankDuration.isActive);
      } catch (error) {
        console.error("Error checking eligibility:", error);
        setIsEligible("Loading...");
      }
    };

    checkEligibility();
  }, [contract, address, userRank]);

  return { userDetails, userRank, isEligible, avatarSVG };
};

// Custom hook for financial data
const useFinancialData = (
  contract: Contract | null,
  isConnected: boolean,
  isProviderReady: boolean
): FinancialData => {
  const [totalRab, setTotalRab] = useState<string>("Loading...");
  const [monthlyRab, setMonthlyRab] = useState<string>("Loading...");
  const [totalAmountAllocated, setTotalAmountAllocated] =
    useState<string>("Loading...");
  const [rankshare, setRankshare] = useState<string>("Loading...");
  const [currentMonthIndex, setCurrentMonthIndex] = useState<number>(0);

  // Fetch current month index
  const fetchCurrentMonthIndex = useCallback(async (): Promise<void> => {
    if (!contract) return;

    try {
      //const currentMonth = await contract.currentMonthIndex();
      const response = await rewardApi.getRABStatistics();
      console.log("the response is", response.data.currentMonthIndex);
      const monthindex = response.data.currentMonthIndex;

      // const rewardinfo = await rewardApi.getRewardStats();
      //  console.log("the reward info is",rewardinfo)
      setCurrentMonthIndex(monthindex + 1);
    } catch (error) {
      console.error("Error fetching current month index:", error);
    }
  }, [contract]);

  // Fetch financial data - total and monthly RAB
  useEffect(() => {
    const fetchFinancialData = async () => {
      if (!contract) return;

      try {
        // Get total RAB distributed
        const ttlRab = await contract.getTtlRabDstrbtd();
        const rewardinfo = await rewardApi.getRewardStats();

        const ttrab = rewardinfo.data.totalRABDistributed;
        console.log("the ttrabnew one is");

        setTotalRab(parseFloat(formatUnits(ttlRab, 18)).toFixed(2));

        // Get monthly RAB pool balance
        const mnthlyRab = await contract.getMnthlyRABPoolBalance();
        setMonthlyRab(parseFloat(formatUnits(mnthlyRab, 18)).toFixed(2));

        // Fetch current month index
        fetchCurrentMonthIndex();
      } catch (error) {
        console.error("Error fetching financial data:", error);
        setTotalRab("Error");
        setMonthlyRab("Error");
      }
    };

    if (isConnected && isProviderReady) {
      fetchFinancialData();
    }
  }, [contract, isConnected, isProviderReady, fetchCurrentMonthIndex]);

  // Fetch rank share percentage
  const fetchRankSharePercentage = useCallback(
    async (rankIndex: number): Promise<void> => {
      if (!contract || rankIndex < 0) return;

      try {
        const rankPercentage = await contract.rabShrPrsntg(rankIndex);
        const formattedPercentage = (Number(rankPercentage) / 100).toFixed(2);
        setRankshare(`${formattedPercentage}%`);
      } catch (error) {
        console.error("Error fetching rank share percentage:", error);
        setRankshare("Error fetching data");
      }
    },
    [contract]
  );

  return {
    totalRab,
    monthlyRab,
    totalAmountAllocated,
    setTotalAmountAllocated,
    rankshare,
    currentMonthIndex,
    fetchRankSharePercentage,
    fetchCurrentMonthIndex,
  };
};

// Custom hook for payout data
const usePayoutData = (
  contract: Contract | null,
  address: string | undefined,
  isConnected: boolean,
  isAdmin: boolean,
  userRank: string | null
): PayoutInfo => {
  const [maxPayouts, setMaxPayouts] = useState<PayoutData>({});
  const [remainingPayouts, setRemainingPayouts] = useState<PayoutData>({});

  // Fetch payout data for all ranks
  useEffect(() => {
    const fetchPayoutData = async () => {
      if (!contract || !isConnected || !address) return;

      // Skip for admin users
      if (isAdmin) {
        console.log("Admin detected - skipping payout data fetch");
        const adminData: PayoutData = RANKS.reduce((acc: PayoutData, rank) => {
          acc[rank.name] = "MAX";
          return acc;
        }, {});
        setMaxPayouts(adminData);
        setRemainingPayouts(adminData);
        return;
      }

      try {
        const ranksToFetch = [
          "DIAMOND",
          "BLUE_DIAMOND",
          "BLACK_DIAMOND",
          "ROYAL_DIAMOND",
          "CROWN_DIAMOND",
        ];
        let remainingPayoutsData: PayoutData = {};
        let maxPayoutsData: PayoutData = {};

        // Batch async calls to reduce re-renders
        const promises = [];

        for (let rankIndex = 4; rankIndex <= 8; rankIndex++) {
          promises.push(
            Promise.all([
              contract.getRemainingPayouts(address, rankIndex),
              contract.maxPyts(rankIndex),
            ])
              .then(([remainingPayout, maxPayout]) => {
                remainingPayoutsData[ranksToFetch[rankIndex - 4]] =
                  remainingPayout.toString();
                maxPayoutsData[ranksToFetch[rankIndex - 4]] =
                  maxPayout.toString();
              })
              .catch((error) => {
                console.error(
                  `Error fetching payouts for rank ${rankIndex}:`,
                  error
                );
                remainingPayoutsData[ranksToFetch[rankIndex - 4]] = "Error";
                maxPayoutsData[ranksToFetch[rankIndex - 4]] = "Error";
              })
          );
        }

        await Promise.all(promises);

        setRemainingPayouts(remainingPayoutsData);
        setMaxPayouts(maxPayoutsData);
      } catch (error) {
        console.error("Error fetching rank payouts:", error);
        setRemainingPayouts({
          DIAMOND: "Error",
          BLUE_DIAMOND: "Error",
          BLACK_DIAMOND: "Error",
          ROYAL_DIAMOND: "Error",
          CROWN_DIAMOND: "Error",
        });
        setMaxPayouts({
          DIAMOND: "Error",
          BLUE_DIAMOND: "Error",
          BLACK_DIAMOND: "Error",
          ROYAL_DIAMOND: "Error",
          CROWN_DIAMOND: "Error",
        });
      }
    };

    fetchPayoutData();
  }, [contract, address, isConnected, isAdmin, userRank]);

  return { maxPayouts, remainingPayouts };
};

// Custom hook for rank distribution data
const useRankDistribution = (
  contract: Contract | null,
  currentMonthIndex: number
): RankDistributionInfo => {
  const [rankData, setRankData] = useState<RankData[]>([]);
  const [loadingGraph, setLoadingGraph] = useState<boolean>(true);

  // Fetch rank distribution data
  useEffect(() => {
    const fetchRankDistribution = async () => {
      if (!contract || currentMonthIndex <= 0) return;

      setLoadingGraph(true);

      try {
        const monthIndex = Math.max(0, currentMonthIndex - 1); // Adjusted month index

        // Parallel fetching for all ranks
        const rankPromises = RANKS.map(async (rank) => {
          let count = 0;
          let addressIndex = 0;

          while (true) {
            try {
              const userAddress = await contract.monthlyEligibleAddresses(
                monthIndex,
                rank.index,
                addressIndex
              );

              if (
                !userAddress ||
                userAddress === "0x0000000000000000000000000000000000000000"
              ) {
                break;
              }

              count++;
              addressIndex++;
            } catch (err) {
              break; // No more addresses
            }
          }

          return { rank: rank.name, count };
        });

        const results = await Promise.all(rankPromises);
        setRankData(results);
      } catch (error) {
        console.error("Error fetching rank distribution:", error);
      } finally {
        setLoadingGraph(false);
      }
    };

    fetchRankDistribution();
  }, [contract, currentMonthIndex]);

  return { rankData, loadingGraph };
};

// Custom hook for eligible addresses
const useEligibleAddresses = (
  contract: Contract | null,
  currentMonthIndex: number
): EligibleAddressesInfo => {
  const [rankAddresses, setRankAddresses] = useState<
    Record<string, UserAddress[]>
  >({});
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch eligible addresses for all ranks
  useEffect(() => {
    const fetchEligibleAddresses = async () => {
      if (!contract || currentMonthIndex <= 0) return;

      setIsLoading(true);

      try {
        const addresses: Record<string, UserAddress[]> = {};
        const monthIndex = Math.max(0, currentMonthIndex - 1);

        // Parallel fetching for all ranks
        const rankPromises = eliteRanks.map(async (rank) => {
          const rankAddressesList: UserAddress[] = [];
          let addressIndex = 0;

          while (true) {
            try {
              const userAddress = await contract.monthlyEligibleAddresses(
                monthIndex,
                rank.id,
                addressIndex
              );

              if (
                !userAddress ||
                userAddress === "0x0000000000000000000000000000000000000000"
              ) {
                break;
              }

              rankAddressesList.push({
                address: userAddress,
                avatar: multiavatar(userAddress),
              });

              addressIndex++;
            } catch (err) {
              break; // No more addresses
            }
          }

          return { rank: rank.name, addresses: rankAddressesList };
        });

        const results = await Promise.all(rankPromises);

        // Convert results to object
        results.forEach(({ rank, addresses: addressList }) => {
          addresses[rank] = addressList;
        });

        setRankAddresses(addresses);
      } catch (error) {
        console.error("Error fetching eligible addresses:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEligibleAddresses();
  }, [contract, currentMonthIndex]);

  return { rankAddresses, isLoading };
};

// Custom hook for timer
const useRabTimer = (contract: Contract | null): RabTimerInfo => {
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [remainingTime, setRemainingTime] = useState<string>("Loading...");
  const [isExpired, setIsExpired] = useState<boolean>(false);

  // Use a ref to track if we need to fetch a new timestamp
  const shouldFetchNewTimestamp = useRef<boolean>(true);

  // Fetch timer data
  useEffect(() => {
    const fetchTimerData = async () => {
      if (!contract || !shouldFetchNewTimestamp.current) return;

      try {
        // Get RAB start timestamp
        const startTimestamp = await contract.rabStartTimestamp();
        const start = Number(startTimestamp);

        // Current time in seconds
        const currentTime = Math.floor(Date.now() / 1000);

        // Calculate how many 60-minute cycles have passed since start
        const cyclesPassed = Math.floor((currentTime - start) / (60 * 60));

        // Calculate when the next 60-minute cycle starts
        const nextCycleStart = start + (cyclesPassed + 1) * 60 * 60;

        console.log(
          "Original Start Time:",
          new Date(start * 1000).toLocaleString()
        );
        console.log(
          "Current Time:",
          new Date(currentTime * 1000).toLocaleString()
        );
        console.log(
          "Next Cycle Start:",
          new Date(nextCycleStart * 1000).toLocaleString()
        );

        setStartTime(start);
        setEndTime(nextCycleStart);
        shouldFetchNewTimestamp.current = false;
      } catch (error) {
        console.error("Error fetching timer data:", error);
      }
    };

    fetchTimerData();

    // Check for new timestamp every minute
    const checkInterval = setInterval(() => {
      shouldFetchNewTimestamp.current = true;
      fetchTimerData();
    }, 60000); // Check every minute

    return () => clearInterval(checkInterval);
  }, [contract]);

  // Update timer display
  useEffect(() => {
    if (!endTime) return;

    const interval = setInterval(() => {
      const currentTime = Math.floor(Date.now() / 1000);
      const remaining = Math.max(endTime - currentTime, 0);

      if (remaining <= 1 && !isExpired) {
        setIsExpired(true);
        setRemainingTime("00D :00Hrs :00Min :00Sec");
        clearInterval(interval);

        // Reset the expired state after a delay and trigger a new fetch
        setTimeout(() => {
          setIsExpired(false);
          shouldFetchNewTimestamp.current = true;
        }, 5000);

        return;
      }

      const days = Math.floor(remaining / (24 * 3600))
        .toString()
        .padStart(2, "0");
      const hours = Math.floor((remaining % (24 * 3600)) / 3600)
        .toString()
        .padStart(2, "0");
      const minutes = Math.floor((remaining % 3600) / 60)
        .toString()
        .padStart(2, "0");
      const seconds = (remaining % 60).toString().padStart(2, "0");

      setRemainingTime(
        `${days}Days :${hours}Hrs :${minutes}Min :${seconds}Sec`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime, isExpired]);

  return { startTime, endTime, remainingTime };
};
// Main component
const Rankach: React.FC = () => {
  const navigate = useNavigate();

  // Use custom hooks to manage state and data fetching
  const { contract, provider, address, isConnected, isProviderReady, isAdmin } =
    useContractData();

  const { userDetails, userRank, isEligible, avatarSVG } = useUserData(
    contract,
    address,
    isConnected,
    isAdmin
  );

  const {
    totalRab,
    monthlyRab,
    totalAmountAllocated,
    setTotalAmountAllocated,
    rankshare,
    currentMonthIndex,
    fetchRankSharePercentage,
  } = useFinancialData(contract, isConnected, isProviderReady);

  const { maxPayouts, remainingPayouts } = usePayoutData(
    contract,
    address,
    isConnected,
    isAdmin,
    userRank
  );

  const { rankData, loadingGraph } = useRankDistribution(
    contract,
    currentMonthIndex
  );

  const { rankAddresses, isLoading } = useEligibleAddresses(
    contract,
    currentMonthIndex
  );

  const { startTime, endTime, remainingTime } = useRabTimer(contract);

  // Local state
  const [copiedState, setCopiedState] = useState<CopiedState>({});

  // Check user registration status
  useEffect(() => {
    const checkRegistrationStatus = async () => {
      if (!contract || !isConnected || !address) return;

      try {
        const userData = await contract.users(address);

        if (!userData || !userData.isActive) {
          console.log("User is NOT active. Redirecting to home...");
          navigate("/"); // Redirect unregistered/inactive users
        }
      } catch (error) {
        console.error("Error checking registration status:", error);
        navigate("/"); // Redirect if there's an error
      }
    };

    checkRegistrationStatus();

    // Handle account changes
    if (provider) {
      const externalProvider = provider.provider as any;

      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          console.log("MetaMask account changed to:", accounts[0]);
          checkRegistrationStatus();
        } else {
          console.log("No account connected, redirecting...");
          navigate("/");
        }
      };

      if (externalProvider?.on) {
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
  }, [contract, address, isConnected, provider, navigate]);

  // Calculate total amount allocated
  useEffect(() => {
    if (
      !monthlyRab ||
      !rankshare ||
      !userRank ||
      rankData.length === 0 ||
      !isEligible
    ) {
      setTotalAmountAllocated(isEligible ? "Loading..." : "No Total Amount");
      return;
    }

    try {
      const monthlyRabValue = parseFloat(monthlyRab);

      const rankPercentages: RankPercentage = {
        4: 0.05,
        5: 0.1,
        6: 0.15,
        7: 0.2,
        8: 0.5,
      };

      const ranksToCheck = [
        "CROWN_DIAMOND",
        "ROYAL_DIAMOND",
        "BLACK_DIAMOND",
        "BLUE_DIAMOND",
        "DIAMOND",
      ];

      let totalAllocation = 0;

      for (const rankName of ranksToCheck) {
        const rankIndex = getRankIndex(rankName);
        const remainingPayout = remainingPayouts[rankName];
        const remainingPayoutNum = remainingPayout
          ? parseFloat(remainingPayout)
          : 0;

        if (remainingPayoutNum > 0) {
          const rankShareValue = rankPercentages[rankIndex] || 0;
          const rankEntry = rankData.find(
            (entry) => getRankIndex(entry.rank) === rankIndex
          );
          const totalUsersForRank = rankEntry
            ? parseInt(rankEntry.count.toString())
            : 0;

          if (totalUsersForRank > 0) {
            const allocation =
              (monthlyRabValue * rankShareValue) / totalUsersForRank;
            totalAllocation += allocation;
          }
        }
      }

      setTotalAmountAllocated(
        totalAllocation > 0 ? totalAllocation.toFixed(2) : "No Total Amount"
      );
    } catch (error) {
      console.error("Error calculating total amount allocated:", error);
      setTotalAmountAllocated("Error");
    }
  }, [
    monthlyRab,
    rankshare,
    userRank,
    rankData,
    remainingPayouts,
    isEligible,
    setTotalAmountAllocated,
  ]);

  // Update rank share percentage when user rank changes
  useEffect(() => {
    if (userRank && contract) {
      const rankIndex = getRankIndex(userRank);
      if (rankIndex >= 0) {
        fetchRankSharePercentage(rankIndex);
      }
    }
  }, [userRank, contract, fetchRankSharePercentage]);

  // Copy to clipboard helper
  const copyToClipboard = useCallback((text: string, addrIdx: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopiedState((prev) => ({
          ...prev,
          [addrIdx]: true,
        }));

        setTimeout(() => {
          setCopiedState((prev) => ({
            ...prev,
            [addrIdx]: false,
          }));
        }, 2000);
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  }, []);

  // Display time formatter helper
  const getDisplayTime = useCallback((monthIdx: number): string | number => {
    // Calculate years and remaining months
    const years = Math.floor(monthIdx / 12);
    const months = monthIdx % 12;

    // Formatting logic
    if (years > 0) {
      if (months === 0) {
        return `${years} Year${years > 1 ? "s" : ""}`;
      } else {
        return `${years} Year${years > 1 ? "s" : ""} ${months} Month${
          months > 1 ? "s" : ""
        }`;
      }
    } else {
      return months;
    }
  }, []);

  // Memoized stat cards data
  const statCardsData = useMemo(
    () => [
      {
        title: "Total RAB",
        value: totalRab,
        icon: Trophy,
        color: "bg-gradient-to-br from-yellow-600 to-orange-700",
      },
      {
        title: "Monthly RAB Pool",
        value: monthlyRab === "Loading..." ? "Loading..." : monthlyRab,
        icon: Calendar,
        color: "bg-gradient-to-br from-blue-600 to-indigo-600",
      },
      {
        title: "Eligibility",
        value: isEligible ? "Eligible" : "Not-Eligible",
        icon: Users,
        color: "bg-gradient-to-br from-green-600 to-emerald-700",
      },
      {
        title: "Current Rank",
        value: userDetails?.currentRank || "NA",
        icon: ArrowUpCircle,
        color: "bg-gradient-to-br from-purple-600 to-pink-700",
      },
      {
        title: "Total Allocated",
        value: totalAmountAllocated,
        icon: DollarSign,
        color: "bg-gradient-to-br from-red-600 to-pink-700",
      },
      {
        title: "Current Month",
        value: getDisplayTime(currentMonthIndex),
        icon: Clock,
        color: "bg-gradient-to-br from-teal-600 to-cyan-700",
      },
    ],
    [
      totalRab,
      monthlyRab,
      isEligible,
      userDetails?.currentRank,
      totalAmountAllocated,
      currentMonthIndex,
      getDisplayTime,
    ]
  );

  // Component render
  return (
    <div className="min-h-screen w-full py-12 px-4 sm:px-3 lg:px-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto max-w-full"
      >
        {/* Page Header */}
        <header className="text-center mb-12">
          <motion.h1
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-5xl lg:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-500 mb-4"
          >
            Rank Achievement Bonus
          </motion.h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Comprehensive overview of your rank achievements, rewards, and
            progress
          </p>
        </header>

        {/* Stat Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12 sm:text-xl">
          {statCardsData.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
              }}
            >
              <StatCard
                icon={card.icon}
                value={card.value}
                label={card.title}
                gradient={card.color}
              />
            </motion.div>
          ))}
        </div>

        {/* Two-Column Layout for Detailed Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-3 space-y-8 ">
            <TimeInfoSection
              currentMonth={getDisplayTime(currentMonthIndex)}
              startTime={startTime}
              endTime={endTime}
              remainingTime={remainingTime}
            />
            <RankDistributionChart
              rankData={rankData}
              loadingGraph={loadingGraph}
            />
          </div>

          {/* Right Column */}
          <div className="space-y-8 lg:col-span-2">
            <RankPayoutsTable
              userRank={userRank}
              address={address}
              remainingPayouts={remainingPayouts}
              maxPayouts={maxPayouts}
            />
            <EligibleAddressesSection
              currentMonthIndex={currentMonthIndex}
              rankAddresses={rankAddresses}
              isLoading={isLoading}
              onCopyAddress={copyToClipboard}
              copiedStates={copiedState}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Sub-components
const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  value,
  label,
  gradient,
}) => (
  <motion.div
    whileHover={{ scale: 1.05, rotate: 0.5 }}
    transition={{ duration: 0.3, ease: "easeInOut" }}
    className={`relative overflow-hidden rounded-2xl p-6 transition-all duration-500 ${gradient} shadow-lg`}
  >
    {/* Background overlay for glass effect */}
    <div className="absolute inset-0 bg-black/10 backdrop-blur-md transition-opacity duration-500" />

    {/* Foreground Content */}
    <div className="relative flex items-start justify-between">
      <div className="space-y-4">
        {/* Icon Container with subtle glow */}
        <div className="rounded-xl bg-white/20 p-3 w-fit transition-transform duration-500 hover:scale-105">
          <Icon className="w-6 h-6 text-white" />
        </div>

        {/* Value and Label */}
        <div>
          <div className="text-xl lg:text-2xl font-bold text-white tracking-tight">
            {value}
          </div>
          <div className="text-sm font-medium text-white/80 mt-1">{label}</div>
        </div>
      </div>

      {/* Circular Background Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/10 to-white/5 rounded-full -mr-16 -mt-16 backdrop-blur-lg transition-all duration-500 group-hover:scale-110" />
    </div>
  </motion.div>
);

const TimeInfoSection: React.FC<TimeInfoSectionProps> = ({
  currentMonth,
  startTime,
  endTime,
  remainingTime,
}) => {
  // Memoize time info data
  const timeInfoData = useMemo(
    () => [
      { label: "Current Month", value: currentMonth, icon: TrendingUp },
      {
        label: "Start Time",
        value: startTime
          ? new Date(startTime * 1000).toLocaleString()
          : "Fetching...",
        icon: Clock,
      },
      {
        label: "End Time",
        value: endTime
          ? new Date(endTime * 1000).toLocaleString()
          : "Fetching...",
        icon: Trophy,
      },
      {
        label: "Remaining Time",
        value: remainingTime,
        icon: Users,
        className: "text-red-500 font-bold",
      },
    ],
    [currentMonth, startTime, endTime, remainingTime]
  );

  return (
    <motion.div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-2xl overflow-hidden">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Time Information
          </h3>
          <Clock className="w-8 h-8 text-blue-500 dark:text-purple-400" />
        </div>

        <div className="grid grid-cols-1 gap-6">
          {timeInfoData.map((item, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              className="bg-white/50 dark:bg-gray-900/50 rounded-xl p-4 shadow-md border border-white/10 dark:border-gray-700/30 flex items-center space-x-4"
            >
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
                <item.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {item.label}
                </p>
                <p
                  className={`text-lg font-semibold ${
                    item.className || "text-gray-800 dark:text-white"
                  }`}
                >
                  {item.value}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const RankPayoutsTable: React.FC<RankPayoutsTableProps> = ({
  userRank,
  address,
  remainingPayouts,
  maxPayouts,
}) => {
  // Format payout values
  const formatPayoutValue = useCallback((value: string): string => {
    if (!value || value === "Loading...") return "Loading...";
    if (value === "Error") return "Error";
    if (value === "Not Available") return "Not Available";

    const numValue = parseInt(value);
    if (numValue > 100) return "MAX";

    return value;
  }, []);

  // Check if admin
  const isAdmin = useMemo(() => {
    return ADMIN_ADDRESSES.includes(address?.toLowerCase() || "");
  }, [address]);

  // Rank details with colors and logos
  const rankDetails = useMemo(
    (): RankDetailItem[] => [
      {
        name: "DIAMOND",
        percentage: "5%",
        color: "bg-cyan-50 dark:bg-cyan-900/20",
        textColor: "text-cyan-600 dark:text-cyan-400",
        logo: rank4,
      },
      {
        name: "BLUE_DIAMOND",
        percentage: "10%",
        color: "bg-blue-50 dark:bg-blue-900/20",
        textColor: "text-blue-600 dark:text-blue-400",
        logo: rank5,
      },
      {
        name: "BLACK_DIAMOND",
        percentage: "15%",
        color: "bg-gray-50 dark:bg-gray-900/20",
        textColor: "text-gray-600 dark:text-gray-400",
        logo: rank6,
      },
      {
        name: "ROYAL_DIAMOND",
        percentage: "20%",
        color: "bg-purple-50 dark:bg-purple-900/20",
        textColor: "text-purple-600 dark:text-purple-400",
        logo: rank7,
      },
      {
        name: "CROWN_DIAMOND",
        percentage: "50%",
        color: "bg-red-50 dark:bg-red-900/20",
        textColor: "text-red-600 dark:text-red-400",
        logo: rank8,
      },
    ],
    []
  );

  return (
    <motion.div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-2xl overflow-hidden">
      <div className="p-6 space-y-6">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Rank-Wise Payouts
          </h3>
          <Trophy className="w-8 h-8 text-blue-500 dark:text-purple-400" />
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* Table Header */}
            <thead>
              <tr className="bg-gradient-to-r from-blue-500/10 to-purple-500/10">
                {["Rank", "Remaining Payout", "Max Payout", "Percentage"].map(
                  (header) => (
                    <th
                      key={header}
                      className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  )
                )}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {rankDetails.map((rank) => {
                const userRankIndex = getRankIndex(userRank || "STAR");
                const rankIndex = getRankIndex(rank.name);
                const isAvailable = rankIndex <= userRankIndex || isAdmin;

                return (
                  <motion.tr
                    key={rank.name}
                    className={`
                      transition-all duration-300 
                      ${
                        isAvailable
                          ? "hover:bg-blue-50/50 dark:hover:bg-blue-900/20"
                          : "opacity-50 cursor-not-allowed"
                      }
                    `}
                  >
                    {/* Rank Column */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-x-4">
                        <div
                          className={`rounded-full ${rank.color} flex-shrink-0`}
                        >
                          <img
                            src={rank.logo}
                            alt={`${rank.name} logo`}
                            className="w-10 h-10 object-contain"
                          />
                        </div>
                        <span className="text-sm font-semibold text-gray-800 dark:text-white min-w-0 truncate flex-shrink-0">
                          {rank.name.replace("_", " ")}
                        </span>
                      </div>
                    </td>

                    {/* Remaining Payout Column */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`
                        px-3 py-1 rounded-full 
                        ${rank.color} ${rank.textColor} 
                        font-medium
                      `}
                      >
                        {isAdmin
                          ? "MAX"
                          : isAvailable
                          ? formatPayoutValue(
                              remainingPayouts[rank.name] || "Loading..."
                            )
                          : "Not Available"}
                      </span>
                    </td>

                    {/* Max Payout Column */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`
                        px-3 py-1 rounded-full 
                        ${rank.color} ${rank.textColor} 
                        font-medium
                      `}
                      >
                        {isAdmin
                          ? "MAX"
                          : isAvailable
                          ? formatPayoutValue(
                              maxPayouts[rank.name] || "Loading..."
                            )
                          : "Not Available"}
                      </span>
                    </td>

                    {/* Percentage Column */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`
                        px-3 py-1 rounded-full 
                        ${rank.color} ${rank.textColor} 
                        font-semibold
                      `}
                      >
                        {rank.percentage}
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

const RankDistributionChart: React.FC<RankDistributionChartProps> = ({
  rankData,
  loadingGraph,
}) => {
  if (!rankData || rankData.length === 0) {
    return (
      <motion.div
        className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-2xl overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="p-6">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Rank Distribution
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            No data available at the moment
          </p>
        </div>
      </motion.div>
    );
  }

  // Memoize chart data and colors
  const { formattedData, rankColors, totalUsers } = useMemo(() => {
    // Enhanced color palette matching the payout table's aesthetic
    const colors: RankColor = {
      DIAMOND: "#6366f1", // Bright indigo
      "BLUE DIAMOND": "#3b82f6", // Bright blue
      "BLACK DIAMOND": "#94a3b8", // Bright gray
      "ROYAL DIAMOND": "#8b5cf6", // Bright purple
      "CROWN DIAMOND": "#ec4899", // Bright pink
    };

    const formatted = rankData.map((item) => ({
      rank: item.rank.replace(/_/g, " "),
      count: item.count,
      color: colors[item.rank.replace(/_/g, " ")] || "#6366f1",
    }));

    const total = formatted.reduce((sum, item) => sum + item.count, 0);

    return { formattedData: formatted, rankColors: colors, totalUsers: total };
  }, [rankData]);

  const formatYAxis = useCallback(
    (value: number): string => Math.round(value).toString(),
    []
  );

  const CustomTooltip: React.FC<CustomTooltipProps> = ({
    active,
    payload,
    label,
  }) => {
    if (active && payload && payload.length) {
      return (
        <div
          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-white/20 dark:border-gray-700/50 rounded-xl p-4 shadow-lg"
          style={{
            pointerEvents: "none",
            touchAction: "none",
            userSelect: "none",
          }}
        >
          <p className="font-medium text-gray-900 dark:text-white">{label}</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Count: {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-2xl overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="p-6 space-y-6">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex items-center justify-between mb-4"
        >
          <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Rank Distribution
          </h3>
          <ChartColumnBig className="w-8 h-8 text-blue-500 dark:text-purple-400" />
        </motion.div>

        {/* Chart Section */}
        <div className="h-72 sm:h-80 md:h-96 w-full overflow-x-auto">
          {loadingGraph ? (
            <div className="h-full w-full flex items-center justify-center bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <Loader2 className="w-8 h-8 text-purple-600 dark:text-purple-400 animate-spin" />
            </div>
          ) : (
            <div className="w-[300px] min-w-full h-full ">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={formattedData}
                  margin={{
                    top: 20,
                    right: 10,
                    left: 10,
                    bottom: 50,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    className="stroke-gray-200 dark:stroke-gray-700"
                  />
                  <XAxis
                    dataKey="rank"
                    tickLine={false}
                    axisLine={false}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    interval={0}
                    tick={{
                      fontSize: 10,
                      fill: "currentColor",
                      className: "text-gray-600 dark:text-gray-400",
                    }}
                  />
                  <YAxis
                    tickLine={false}
                    tickMargin={5}
                    axisLine={false}
                    tick={{
                      fontSize: 10,
                      fill: "currentColor",
                      className: "text-gray-600 dark:text-gray-400",
                    }}
                    tickFormatter={formatYAxis}
                    domain={[
                      0,
                      (dataMax: number) => Math.max(1, Math.ceil(dataMax)),
                    ]}
                    allowDecimals={false}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ fill: "currentColor", opacity: 0.1 }}
                  />
                  <Bar
                    dataKey="count"
                    radius={[4, 4, 0, 0]}
                    animationBegin={0}
                    animationDuration={1500}
                    animationEasing="ease-out"
                  >
                    {formattedData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        opacity={0.8}
                        className="hover:opacity-100 transition-opacity duration-300"
                      >
                        <motion.animate
                          attributeName="height"
                          from="0"
                          to={entry.count}
                          dur="1s"
                          fill="freeze"
                        />
                      </Cell>
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Footer Section */}
        <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-700/50">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-sm text-gray-600 dark:text-gray-400"
          >
            Total users across all ranks: {totalUsers}
          </motion.div>
          <motion.div
            className="flex flex-wrap gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            {Object.entries(rankColors).map(([rank, color], index) => (
              <motion.div
                key={rank}
                className="flex items-center gap-2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
              >
                <div
                  className="w-3 h-3 rounded-full shadow-sm"
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {rank}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

const RankSection: React.FC<RankSectionProps> = ({
  rank,
  addresses,
  expanded,
  onToggle,
  onCopy,
  copiedStates,
}) => {
  return (
    <div className="mb-4 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 hover:shadow-lg">
      <button
        onClick={onToggle}
        className={`w-full p-4 flex items-center justify-between bg-gradient-to-r ${rank.color} text-white`}
      >
        <div className="flex items-center space-x-4">
          <img
            src={rank.image}
            alt={rank.name}
            className="w-10 h-10 object-contain rounded-full ring-2 ring-white/30"
          />
          <div className="flex items-center space-x-3">
            <span className="font-semibold text-lg">
              {rank.name.replace("_", " ")}
            </span>
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
              {addresses.length} Users
            </span>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-6 h-6" />
        ) : (
          <ChevronDown className="w-6 h-6" />
        )}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-gray-800"
          >
            <div className="max-h-64 overflow-y-auto">
              {addresses.length === 0 ? (
                <div className="p-6 text-center text-gray-500 dark:text-gray-400 flex flex-col items-center space-y-3">
                  <Award className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                  <p>No eligible users found for this rank</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {addresses.map((addr, idx) => {
                    const svgAvatar = multiavatar(addr.address);
                    const encodedSvg = `data:image/svg+xml;base64,${btoa(
                      unescape(encodeURIComponent(svgAvatar))
                    )}`;

                    return (
                      <li
                        key={idx}
                        className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <img
                              src={encodedSvg}
                              alt="User Avatar"
                              className="w-12 h-12 rounded-full ring-2 ring-gray-200 dark:ring-gray-700"
                            />
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white lg:text-xl">
                                {`${addr.address.slice(
                                  0,
                                  6
                                )}...${addr.address.slice(-4)}`}
                              </p>
                              {addr.nickname && (
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {addr.nickname}
                                </p>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              onCopy(addr.address, `${rank.name}-${idx}`)
                            }
                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                              copiedStates[`${rank.name}-${idx}`]
                                ? "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                            }`}
                          >
                            {copiedStates[`${rank.name}-${idx}`] ? (
                              <>
                                <Check className="w-5 h-5" />
                                <span>Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-5 h-5" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const EligibleAddressesSection: React.FC<EligibleAddressesSectionProps> = ({
  currentMonthIndex,
  rankAddresses,
  isLoading,
  onCopyAddress,
  copiedStates,
}) => {
  const [expandedRank, setExpandedRank] = useState<string | null>(null);

  const handleToggle = useCallback((rankName: string) => {
    setExpandedRank((prevRank) => (prevRank === rankName ? null : rankName));
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold mb-2 flex items-center space-x-3">
          <User className="w-8 h-8" />
          <span>Elite Ranks - Monthly Eligible Addresses</span>
        </h2>
        <p className="opacity-80 text-sm">
          Explore and manage eligible addresses across elite rank tiers
        </p>
      </div>

      {eliteRanks.map((rank) => (
        <RankSection
          key={rank.name}
          rank={rank}
          addresses={rankAddresses[rank.name] || []}
          expanded={expandedRank === rank.name}
          onToggle={() => handleToggle(rank.name)}
          onCopy={onCopyAddress}
          copiedStates={copiedStates}
        />
      ))}
    </div>
  );
};

export default Rankach;
