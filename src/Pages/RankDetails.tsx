import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { BrowserProvider, Contract, Eip1193Provider } from "ethers";
import { contractAbi } from "../contracts/Props/contractAbi";
import { contractAddress } from "../contracts/Props/contractAddress";
import { usePriceData } from "../context/PriceContext";
import { useAppKitProvider, useAppKitAccount } from "@reown/appkit/react";
import { useNavigate } from "react-router-dom";
import { useDarkMode } from "../context/DarkModeContext";
import { motion } from "framer-motion";

// Import rank images
import {
  rank0,
  rank1,
  rank2,
  rank3,
  rank4,
  rank5,
  rank6,
  rank7,
  rank8,
} from "../assets/index";

// Interfaces
interface RankItem {
  id: number;
  name: string;
  image: string;
}

interface PriceData {
  TUSDTperTITC: string;
  [key: string]: any;
}

interface ContractRankDetail {
  price: { toString: () => string };
  [key: string]: any;
}

interface RankDetail {
  id: number;
  name: string;
  cumulativePrice: string;
  addedFeePrice: string;
  rankPriceInITC: string;
  rabShare: string;
  isEligible: boolean;
}

interface ContractMethods {
  users: (address: string) => Promise<any>;
  rankDetails: (index: number) => Promise<ContractRankDetail>;
}

const CACHE_KEY = "rankDetailsData";

// Constants
const ranks: RankItem[] = [
  { id: 0, name: "STAR", image: rank0 },
  { id: 1, name: "BRONZE", image: rank1 },
  { id: 2, name: "SILVER", image: rank2 },
  { id: 3, name: "GOLD", image: rank3 },
  { id: 4, name: "DIAMOND", image: rank4 },
  { id: 5, name: "BLUE_DIAMOND", image: rank5 },
  { id: 6, name: "BLACK_DIAMOND", image: rank6 },
  { id: 7, name: "ROYAL_DIAMOND", image: rank7 },
  { id: 8, name: "CROWN_DIAMOND", image: rank8 },
];

const eligibleRanks: string[] = [
  "DIAMOND",
  "BLUE_DIAMOND",
  "BLACK_DIAMOND",
  "ROYAL_DIAMOND",
  "CROWN_DIAMOND",
];

const RAB_PERCENTAGE_MAPPING: Record<string, string> = {
  DIAMOND: "5%",
  BLUE_DIAMOND: "10%",
  BLACK_DIAMOND: "15%",
  ROYAL_DIAMOND: "20%",
  CROWN_DIAMOND: "50%",
};

// Single table row component
const RankRow = React.memo(
  ({
    rank,
    index,
    userRank,
  }: {
    rank: RankDetail;
    index: number;
    userRank: number | null;
  }) => (
    <tr
      key={rank.id}
      className={`
                            border-b border-gray-200 dark:border-gray-700
                            transition-colors duration-200
                            ${
                              userRank === rank.id
                                ? "bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/70"
                                : ""
                            }
                            ${
                              userRank !== null && rank.id < userRank
                                ? "bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/70"
                                : ""
                            }
                          `}
    >
      <td className="px-4 lg:px-6 py-4">
        <div className="flex items-center space-x-2 lg:space-x-3">
          <div className="flex-shrink-0">
            <img
              src={ranks[index].image}
              alt={rank.name}
              className="h-8 w-8 lg:h-12 lg:w-12 rounded-full object-cover ring-2 ring-purple-500"
            />
          </div>
          <div className="min-w-0">
            <p
              className={`font-semibold truncate ${
                userRank === rank.id
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-gray-900 dark:text-white"
              }`}
            >
              {rank.name}
            </p>
            <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 truncate">
              Level {index + 1}
            </p>
          </div>
        </div>
      </td>
      <td className="px-4 lg:px-6 py-4 text-right whitespace-nowrap">
        <span className="font-medium text-gray-900 dark:text-gray-100">
          ${rank.cumulativePrice}
        </span>
      </td>
      <td className="px-4 lg:px-6 py-4 text-right whitespace-nowrap">
        <span className="font-medium text-gray-900 dark:text-gray-100">
          ${rank.addedFeePrice}
        </span>
      </td>
      <td className="px-4 lg:px-6 py-4 text-right whitespace-nowrap">
        <span className="font-medium text-gray-900 dark:text-gray-100">
          {rank.rankPriceInITC}
        </span>
        <span className="ml-1 text-xs lg:text-sm text-gray-500 dark:text-gray-400">
          ITC
        </span>
      </td>
      <td className="px-4 lg:px-6 py-4">
        <div className="flex justify-center">
          <span
            className={`
            inline-flex items-center px-2 lg:px-3 py-1 rounded-full text-xs lg:text-sm font-medium whitespace-nowrap
            ${
              rank.rabShare === "5%"
                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                : rank.rabShare === "10%"
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                : rank.rabShare === "15%"
                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                : rank.rabShare === "20%"
                ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                : rank.rabShare === "50%"
                ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
            }
          `}
          >
            {rank.rabShare}
          </span>
        </div>
      </td>
    </tr>
  )
);

// Main component
const RankDetailsPage = () => {
  const { walletProvider } = useAppKitProvider<Eip1193Provider>("eip155");
  const { darkMode } = useDarkMode();
  const navigate = useNavigate();
  const { address, isConnected } = useAppKitAccount();

  // Create a ref for data already loaded flag to avoid re-renders
  const dataLoadedRef = useRef(false);

  // State for data display
  const [userRank, setUserRank] = useState<number | null>(null);
  const [rankDetails, setRankDetails] = useState<RankDetail[]>(() => {
    // Load from cache immediately on mount
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        // Check if cache is less than 30 minutes old
        if (Date.now() - timestamp < 30 * 60 * 1000) {
          dataLoadedRef.current = true;
          return data.rankDetails || [];
        }
      }
    } catch (e) {}
    return [];
  });

  // Contract ref to avoid reinstantiation
  const contractRef = useRef<(Contract & ContractMethods) | null>(null);

  // Get price data from context
  const { priceData } = usePriceData() as { priceData: PriceData };

  // Process rank details into displayable format - memoized
  const processRankDetails = useCallback(
    (contractRankDetails: ContractRankDetail[]): RankDetail[] => {
      if (!priceData || !contractRankDetails.length) return [];

      return ranks
        .map((rank, i) => {
          try {
            const rankDetail = contractRankDetails[i];
            if (!rankDetail || !rankDetail.price) return null;

            const Price = parseFloat(rankDetail.price.toString() || "0");
            const addedFeePrice = Price + Price * 0.03;
            const rankPriceInITC =
              addedFeePrice * parseFloat(priceData.TUSDTperTITC || "0.0");

            const rankKey = rank.name.replace(/[^A-Z_]/g, "");
            const rabShare =
              RAB_PERCENTAGE_MAPPING[
                rankKey as keyof typeof RAB_PERCENTAGE_MAPPING
              ] || "-";

            return {
              id: i,
              name: rank.name,
              cumulativePrice: Price.toFixed(2),
              addedFeePrice: addedFeePrice.toFixed(2),
              rankPriceInITC: rankPriceInITC.toFixed(2),
              rabShare,
              isEligible: eligibleRanks.includes(rankKey),
            };
          } catch (error) {
            return null;
          }
        })
        .filter(Boolean) as RankDetail[];
    },
    [priceData]
  );

  // Initialize contract once when provider is ready
  useEffect(() => {
    const initializeContract = async () => {
      if (contractRef.current || !walletProvider || !isConnected) return;

      try {
        const ethersProvider = new BrowserProvider(walletProvider);
        const signer = await ethersProvider.getSigner();
        contractRef.current = new Contract(
          contractAddress,
          contractAbi,
          signer
        ) as Contract & ContractMethods;
      } catch (error) {}
    };

    initializeContract();
  }, [walletProvider, isConnected]);

  // Load from cache on component mount (in addition to state initialization)
  useEffect(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < 30 * 60 * 1000) {
          // Cache is valid (less than 30 minutes old)
          if (data.userRank !== undefined) {
            setUserRank(data.userRank);
          }
          if (data.rankDetails && data.rankDetails.length > 0) {
            setRankDetails(data.rankDetails);
            dataLoadedRef.current = true;
          }
        }
      }
    } catch (e) {}
  }, []);

  // Redirect if not connected (with a short delay to allow connection)
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (!isConnected) {
      timer = setTimeout(() => {
        if (!isConnected) {
          navigate("/");
        }
      }, 2000);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isConnected, navigate]);

  // Main effect for data fetching - runs once on mount and when dependencies change
  useEffect(() => {
    const fetchData = async () => {
      if (!isConnected || !walletProvider || !address) return;

      // Initialize contract if not already done
      if (!contractRef.current) {
        try {
          const ethersProvider = new BrowserProvider(walletProvider);
          const signer = await ethersProvider.getSigner();
          contractRef.current = new Contract(
            contractAddress,
            contractAbi,
            signer
          ) as Contract & ContractMethods;
        } catch (error) {
          return;
        }
      }

      try {
        // Check if user is registered
        const userData = await contractRef.current.users(address);
        if (!userData || !userData.isActive) {
          navigate("/");
          return;
        }

        // Fetch user rank and set it immediately
        const userRankValue = parseInt(userData[0].toString(), 10);
        setUserRank(userRankValue);

        // Fetch all rank details in parallel
        const rankDetailsPromises = ranks.map((_, index) =>
          contractRef.current?.rankDetails(index)
        );

        const contractRankDetails = await Promise.all(rankDetailsPromises);

        // Process and set rank details
        const processedRankDetails = processRankDetails(
          contractRankDetails as ContractRankDetail[]
        );

        if (processedRankDetails.length > 0) {
          setRankDetails(processedRankDetails);

          // Update cache
          localStorage.setItem(
            CACHE_KEY,
            JSON.stringify({
              data: {
                userRank: userRankValue,
                rankDetails: processedRankDetails,
              },
              timestamp: Date.now(),
            })
          );

          dataLoadedRef.current = true;
        }
      } catch (error) {}
    };

    fetchData();
  }, [isConnected, walletProvider, address, navigate, processRankDetails]);

  // If data exists, show it right away
  const rankData = useMemo(() => rankDetails, [rankDetails]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen p-4 md:p-6 lg:p-8"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent mb-4">
            Rank Details
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            View detailed information about each rank and their benefits
          </p>
        </div>

        <div className="max-w-7xl mx-auto">
          {/* Always render the table, even if data is loading */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700"
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-600 to-purple-600">
                    <th className="px-4 lg:px-6 py-4 text-white font-semibold text-left whitespace-nowrap">
                      Rank
                    </th>
                    <th className="px-4 lg:px-6 py-4 text-white font-semibold text-right whitespace-nowrap">
                      Price (USD)
                    </th>
                    <th className="px-4 lg:px-6 py-4 text-white font-semibold text-right whitespace-nowrap">
                      Fee Added
                    </th>
                    <th className="px-4 lg:px-6 py-4 text-white font-semibold text-right whitespace-nowrap">
                      ITC Price
                    </th>
                    <th className="px-4 lg:px-6 py-4 text-white font-semibold text-center whitespace-nowrap">
                      RAB %
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rankData.length > 0 ? (
                    rankData.map((rank, index) => (
                      <RankRow
                        key={rank.id}
                        rank={rank}
                        index={index}
                        userRank={userRank}
                      />
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-8 text-center text-gray-500"
                      >
                        Loading rank details...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-4 lg:p-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-500"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Current Rank
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-500"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Achieved Ranks
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-purple-50 dark:bg-purple-900/20 border border-purple-300"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Future Ranks
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default React.memo(RankDetailsPage);
