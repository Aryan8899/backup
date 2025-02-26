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
}

// Constants
const ranks = [
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
      if (!isConnected || !walletProvider || !address) return;

      try {
        // Initialize provider and contract
        const provider = new BrowserProvider(walletProvider);
        const signer = await provider.getSigner();
        const contract = new Contract(contractAddress, contractAbi, signer);

        // Check if user is registered first
        const userData = await contract.users(address);
        if (!userData || !userData.isActive) {
          navigate("/");
          return;
        }

        // Process and store user data
        const currentRank = userData[0]
          ? ranks[Number(userData[0])].name
          : "Unknown";
        const userDetailsData = {
          referrer: userData[2] ? userData[2].toString() : "No referrer",
          currentRank,
          totalInvestment: formatUnits(userData[5] || "0", 18),
          isActive: Boolean(userData[5]),
        };
        setUserDetails(userDetailsData);
        localStorage.setItem(
          "userDetailsCache",
          JSON.stringify({
            data: userDetailsData,
            timestamp: Date.now(),
          })
        );

        // Fetch rank details in parallel
        const details = [];
        let pendingAmountTotal = BigInt("0");

        const rankPromises = ranks.map(async (rank) => {
          const response = await contract.getRankLTG(address, rank.id);
          if (rank.id <= 7) {
            pendingAmountTotal = pendingAmountTotal + response.pendingAmount;
          }

          return {
            id: rank.id,
            name: rank.name,
            count: response.count.toString(),
            pendingAmount: formatUnits(response.pendingAmount, 18),
            totalDistributedAmount: formatUnits(response.ttlDstrbtdAmount, 18),
          };
        });

        const rankResults = await Promise.all(rankPromises);
        setRankDetails(rankResults);

        // Store in cache
        localStorage.setItem(
          "rankDetailsCache",
          JSON.stringify({
            data: rankResults,
            timestamp: Date.now(),
          })
        );

        // Calculate and store totals
        const formattedPending = parseFloat(
          formatUnits(pendingAmountTotal, 18)
        ).toFixed(2);
        setTotalPendingAmount(formattedPending);
        localStorage.setItem(
          "totalPendingCache",
          JSON.stringify({
            data: formattedPending,
            timestamp: Date.now(),
          })
        );

        // Fetch and store total bonus
        const totalBonusData = await contract.getUsrTtlLtgrcvd(address);
        const formattedBonus = parseFloat(
          formatUnits(totalBonusData || "0", 18)
        ).toFixed(4);
        setTotalBonus(formattedBonus);
        localStorage.setItem(
          "totalBonusCache",
          JSON.stringify({
            data: formattedBonus,
            timestamp: Date.now(),
          })
        );
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [isConnected, walletProvider, address, navigate]);

  // Get current rank image
  const currentRankImage = useMemo(() => {
    if (!userDetails?.currentRank) return ranks[0].image;
    const rankItem = ranks.find((r) => r.name === userDetails.currentRank);
    return rankItem?.image || ranks[0].image;
  }, [userDetails]);

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
                {rankDetails.length > 0 ? (
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
                      {rankDetails.map((rank, index) => (
                        <tr
                          key={rank.id}
                          className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="flex-shrink-0">
                                <img
                                  src={ranks[index].image}
                                  alt={rank.name}
                                  className="h-12 w-12 rounded-full object-cover"
                                />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900 dark:text-white">
                                  {rank.name}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  Level {index + 1}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-center">
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                  parseInt(rank.count) % 2 === 0
                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                    : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                }`}
                              >
                                {rank.count}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-center">
                              <span className="text-gray-900 dark:text-gray-100 font-medium">
                                {parseFloat(rank.pendingAmount).toFixed(2)}
                              </span>
                              <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                                ITC
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-center">
                              <span className="text-gray-900 dark:text-gray-100 font-medium">
                                {parseFloat(
                                  rank.totalDistributedAmount
                                ).toFixed(2)}
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
                    Total Bonus
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
