// @ts-nocheck

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { BrowserProvider, Contract, formatUnits } from "ethers";
import { contractAbi } from "../contracts/Props/contractAbi";
import { contractAddress } from "../contracts/Props/contractAddress";
import {
  Provider,
  useAppKitProvider,
  useAppKitAccount,
} from "@reown/appkit/react";
import { useNavigate } from "react-router-dom";
import { useDarkMode } from "../context/DarkModeContext";
import { motion } from "framer-motion";
import { userApi } from "../api/userApi";
import { rewardApi } from "../api/rewardApi";

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

interface UserDetails {
  referrer: string;
  currentRank: string;
  totalInvestment: string;
  isActive: boolean;
}

interface RankDetail {
  id: number;
  name: string;
  count: string;
  pendingAmount: string;
  totalDistributedAmount: string;
  nextPairRemaining: string;
  status: string;
}

// Constants
const RANKS = [
  { id: "0", name: "STAR", image: rank0 },
  { id: "1", name: "BRONZE", image: rank1 },
  { id: "2", name: "SILVER", image: rank2 },
  { id: "3", name: "GOLD", image: rank3 },
  { id: "4", name: "DIAMOND", image: rank4 },
  { id: "5", name: "BLUE_DIAMOND", image: rank5 },
  { id: "6", name: "BLACK_DIAMOND", image: rank6 },
  { id: "7", name: "ROYAL_DIAMOND", image: rank7 },
  { id: "8", name: "CROWN_DIAMOND", image: rank8 },
];

const LifetimeGrowthBonusPage = () => {
  const { darkMode } = useDarkMode();
  const navigate = useNavigate();
  const { walletProvider } = useAppKitProvider<Provider>("eip155");
  const { address, isConnected } = useAppKitAccount();

  // Data states without loading state
  const [rankDetails, setRankDetails] = useState<RankDetail[]>([]);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [totalPendingAmount, setTotalPendingAmount] = useState("0");
  const [totalBonus, setTotalBonus] = useState("0");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ltgBonuses, setLtgBonuses] = useState<any[]>([]);
  const [userData, setUserData] = useState<any>(null);

  // Load cached data immediately on mount
  useEffect(() => {
    // Try to load cached rank details
    try {
      const cachedRankDetails = localStorage.getItem("rankDetailsCache");
      if (cachedRankDetails) {
        const parsed = JSON.parse(cachedRankDetails);
        if (
          parsed.data &&
          Array.isArray(parsed.data) &&
          parsed.data.length > 0
        ) {
          setRankDetails(parsed.data);
        }
      }

      // Try to load cached user details
      const cachedUserDetails = localStorage.getItem("userDetailsCache");
      if (cachedUserDetails) {
        const parsed = JSON.parse(cachedUserDetails);
        if (parsed.data) {
          setUserDetails(parsed.data);
        }
      }

      // Try to load cached totals
      const cachedTotalPending = localStorage.getItem("totalPendingCache");
      if (cachedTotalPending) {
        const parsed = JSON.parse(cachedTotalPending);
        if (parsed.data) {
          setTotalPendingAmount(parsed.data);
        }
      }

      const cachedTotalBonus = localStorage.getItem("totalBonusCache");
      if (cachedTotalBonus) {
        const parsed = JSON.parse(cachedTotalBonus);
        if (parsed.data) {
          setTotalBonus(parsed.data);
        }
      }
    } catch (error) {
      console.error("Error loading cached data:", error);
    }
  }, []);

  // Check connection and redirect if needed
  useEffect(() => {
    if (!isConnected) {
      const timer = setTimeout(() => {
        if (!isConnected) {
          navigate("/");
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isConnected, navigate]);

  // Fetch data directly
  useEffect(() => {
    const fetchData = async () => {
      if (!isConnected || !address) return;

      setLoading(true);
      try {
        // Get user by address
        const userResponse = await userApi.getUserByAddress(address);
        const userData = userResponse.data?.user;

        console.log("the user is",userData)

        if (!userData) {
          // User not registered
          setLoading(false);
          return;
        }

        setUserData(userData);

        console.log("the data of user is", userData);

        const userCurrentRank = getRankName(userData.currentRank);
        console.log("the data  is", userCurrentRank);
        setUserDetails({
          referrer: userData.referrer || "No referrer",
          currentRank: userCurrentRank,
          totalInvestment: userData.totalInvestment || "0",
          isActive: Boolean(userData.isActive),
        });

        // Get LTG bonus status
        const ltgResponse = await rewardApi.getLTGBonusStatus(userData.id);
        console.log("the ltg rep", ltgResponse);

        const bonuses = ltgResponse.data?.ltgBonuses || [];

        // Filter out unwanted ranks
        const validBonuses = bonuses.filter(
          (bonus) =>
            // Remove "0" rank
            bonus.rank !== "" && // Remove empty string
            bonus.rank !== null && // Remove null
            bonus.rank !== undefined // Remove undefined
        );

        // Calculate total pending amount
        const totalPending = validBonuses.reduce((total, bonus) => {
          return total + parseFloat(bonus.pendingAmount || "0");
        }, 0);

        // Calculate total distributed amount
        const totalDistributed = validBonuses.reduce((total, bonus) => {
          return total + parseFloat(bonus.totalDistributed || "0");
        }, 0);

        // Set calculated totals
        const formattedTotalPending = totalPending.toFixed(2);
        const formattedTotalDistributed = totalDistributed.toFixed(2);

        // Set state
        setTotalPendingAmount(formattedTotalPending);
        setTotalBonus(formattedTotalDistributed);

        setLtgBonuses(ltgResponse.data?.ltgBonuses || []);
      } catch (error) {
        console.error("Failed to fetch LTG data:", error);
        setError("Failed to load LTG bonus data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isConnected, address]);

  // const totalPendingAmount = useMemo(() => {
  //   return ltgBonuses
  //     .reduce((total: number, bonus: any) => {
  //       return total + parseFloat(bonus.pendingAmount || "0");
  //     }, 0)
  //     .toFixed(2);
  // }, [ltgBonuses]);

  // const totalBonus = useMemo(() => {
  //   return ltgBonuses
  //     .reduce((total: number, bonus: any) => {
  //       return total + parseFloat(bonus.totalDistributed || "0");
  //     }, 0)
  //     .toFixed(4);
  // }, [ltgBonuses]);

  const getRankImage = (rankIdOrName: string) => {
    if (rankIdOrName === undefined || rankIdOrName === null) return rank0;

    // First try to find by ID
    let rank = RANKS.find((r) => r.id === rankIdOrName);

    // If not found, try to find by name
    if (!rank) {
      rank = RANKS.find((r) => r.name === rankIdOrName);
    }

    return rank ? rank.image : rank0;
  };

  const getRankName = (rankIdOrName: string) => {
    // Added robust handling for empty or undefined ranks
    if (!rankIdOrName) return "N/A";

    // First try to find by ID
    let rank = RANKS.find((r) => r.id === rankIdOrName);

    // If not found, try to find by name
    if (!rank) {
      rank = RANKS.find((r) => r.name === rankIdOrName);
    }

    // Return the name if found, otherwise return "N/A"
    return rank ? rank.name : "N/A";
  };

  // Get current rank image
  const currentRankImage = useMemo(() => {
    if (userData?.currentRank) {
      return getRankImage(userData.currentRank);
    }

    if (userDetails?.currentRank) {
      return getRankImage(userDetails.currentRank);
    }

    return rank0;
  }, [userData, userDetails]);

  // Always show the table if we have data, no loading states
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen p-4 md:p-6 lg:p-8"
      >
        <div className="min-h-screen p-5 relative">
          {/* Header Section */}
          <div className="max-w-7xl mx-auto mb-12">
            <div className="text-center space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                Lifetime Growth Bonus
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Track your rank progress and rewards
              </p>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
              <div className="overflow-x-auto">
                {ltgBonuses.length > 0 ? (
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-blue-600 to-purple-600">
                        <th className="px-6 py-4 text-white font-semibold text-left">
                          Rank
                        </th>
                        <th className="px-6 py-4 text-white font-semibold text-center">
                          Count
                        </th>
                        <th className="px-6 py-4 text-white font-semibold text-center">
                          Pending Amount
                        </th>
                        <th className="px-6 py-4 text-white font-semibold text-center">
                          Total Distributed
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {ltgBonuses
                        .filter(
                          (bonus) =>
                            // Multiple conditions to remove unwanted entries
                            bonus.rank !== "0" && // Remove "0" rank
                            bonus.rank !== "" && // Remove empty string
                            bonus.rank !== null && // Remove null
                            bonus.rank !== undefined // Remove undefined
                        )
                        .map((bonus) => (
                          <tr
                            key={bonus.rank}
                            className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0">
                                  <img
                                    src={getRankImage(bonus.rank)}
                                    alt={getRankName(bonus.rank)}
                                    className="h-12 w-12 rounded-full object-cover"
                                  />
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900 dark:text-white">
                                    {getRankName(bonus.rank)}
                                  </p>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Level {parseInt(bonus.rank) + 1}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-center">
                                <span
                                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                    parseInt(bonus.count) % 2 === 0
                                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                      : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                  }`}
                                >
                                  {bonus.count}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-center">
                                <span className="text-gray-900 dark:text-gray-100 font-medium">
                                  {parseFloat(bonus.pendingAmount).toFixed(2)}
                                </span>
                                <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                                  ITC
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-center">
                                <span className="text-gray-900 dark:text-gray-100 font-medium">
                                  {parseFloat(bonus.totalDistributed).toFixed(
                                    2
                                  )}
                                </span>
                                <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                                  ITC
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    Loading your data...
                  </div>
                )}
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6 bg-gray-50 dark:bg-gray-900">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Total Pending
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {totalPendingAmount} ITC
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Total Distributed
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {totalBonus} ITC
                  </p>
                </div>
                <div className="w-full max-w-sm bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Current Rank
                  </p>

                  <div className="flex flex-col items-start space-y-3 mt-2 sm:flex-row sm:space-y-0 sm:space-x-4 sm:items-center sm:text-sm sm:ml-2">
                    <img
                      src={currentRankImage}
                      alt={userDetails?.currentRank || "STAR"}
                      className="w-12 h-12 object-contain sm:w-10 sm:h-10"
                    />

                    <p
                      className="lg:text-xl text-xl md:text-xl font-bold text-gray-900 dark:text-white truncate mr-10 xs:text-lg"
                      style={{ marginLeft: "0rem" }}
                    >
                      {userDetails?.currentRank || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default React.memo(LifetimeGrowthBonusPage);
