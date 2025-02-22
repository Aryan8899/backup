import { useState, useEffect } from "react";
import { BrowserProvider, Contract } from "ethers";
import { contractAbi } from "./Props/contractAbi";
import { contractAddress } from "./Props/contractAddress";
import { usePriceData } from "../components/PriceContext";
import {
  Provider,
  useAppKitProvider,
  useAppKitAccount,
} from "@reown/appkit/react";
import { useNavigate } from "react-router-dom";
import FeaturesSection from "../components/FeaturesSection";
import Light from "../components/Light";
import { useDarkMode } from "../components/DarkModeContext";

// Import rank images
import rank0 from "../assets/rank0.png";
import rank1 from "../assets/rank1.png";
import rank2 from "../assets/rank2.png";
import rank3 from "../assets/rank3.png";
import rank4 from "../assets/rank4.png";
import rank5 from "../assets/rank5.png";
import rank6 from "../assets/rank6.png";
import rank7 from "../assets/rank7.png";
import rank8 from "../assets/rank8.png";

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

const eligibleRanks = [
  "DIAMOND",
  "BLUE_DIAMOND",
  "BLACK_DIAMOND",
  "ROYAL_DIAMOND",
  "CROWN_DIAMOND",
];

const RankDetailsPage = () => {
  const { walletProvider } = useAppKitProvider<Provider>("eip155");
  const { darkMode } = useDarkMode();
  const navigate = useNavigate();
  const { address, isConnected } = useAppKitAccount();
  
  const [isProviderReady, setIsProviderReady] = useState(false);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [rankDetails, setRankDetails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { priceData } = usePriceData();

  // Debug logging for dark mode
  useEffect(() => {
    console.log("Dark Mode State:", darkMode);
  }, [darkMode]);

  // Track provider readiness
  useEffect(() => {
    console.log("Wallet provider updated:", !!walletProvider);
    setIsProviderReady(!!walletProvider);
  }, [walletProvider]);

  // Check registration status
  useEffect(() => {
    const checkRegistrationStatus = async (newAddress: string) => {
      if (!isConnected || !walletProvider || !isProviderReady || !newAddress) {
        console.warn("Wallet is not connected or provider is not ready.");
        return;
      }

      try {
        console.log("Checking registration status for:", newAddress);

        // Initialize provider and contract
        const ethersProvider = new BrowserProvider(walletProvider);
        const signer = await ethersProvider.getSigner();
        const contract = new Contract(contractAddress, contractAbi, signer);

        // Fetch user details from the contract
        const userData = await contract.users(newAddress);
        console.log("Fetched User Data:", userData);

        // Check if user is active
        if (!userData || !userData.isActive) {
          console.log("User is NOT active. Redirecting to home...");
          navigate("/"); // Redirect unregistered/inactive users
        } else {
          console.log("User is active. Staying on the dashboard.");
        }
      } catch (error) {
        console.error("Error checking registration status:", error);
        navigate("/"); // Redirect if there's an error
      }
    };

    // Handle account changes
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length > 0) {
        console.log("Account changed to:", accounts[0]);
        checkRegistrationStatus(accounts[0]);
      } else {
        console.log("No account connected, redirecting...");
        navigate("/");
      }
    };

    // Set up listener for account changes
    if (walletProvider) {
      const provider = new BrowserProvider(walletProvider as any);
      const externalProvider = provider.provider as any;

      if (externalProvider?.on) {
        externalProvider.on("accountsChanged", handleAccountsChanged);
      }

      // Check registration on initial load
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

  // Fetch user details and rank details
  useEffect(() => {
    const fetchUserAndRankDetails = async () => {
      if (!walletProvider || !isConnected) {
        console.log("Provider or connection not ready");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log("Fetching user and rank details...");
        const provider = new BrowserProvider(walletProvider);
        const signer = await provider.getSigner();
        const contract = new Contract(contractAddress, contractAbi, signer);

        // Fetch user rank
        const userAddress = await signer.getAddress();
        console.log("Fetching data for address:", userAddress);
        
        const userData = await contract.users(userAddress);
        console.log("Raw user data:", userData);

        // Extract and set user rank
        const userRankId = parseInt(userData[0].toString(), 10);
        console.log("User rank ID:", userRankId);
        setUserRank(userRankId);

        // Fetch rank details
        const details = [];
        const rabPercentageMapping: Record<string, string> = {
          DIAMOND: "5%",
          BLUE_DIAMOND: "10%",
          BLACK_DIAMOND: "15%",
          ROYAL_DIAMOND: "20%",
          CROWN_DIAMOND: "50%",
        };

        for (let i = 0; i < ranks.length; i++) {
          try {
            const rankDetail = await contract.rankDetails(i);
            const Price = parseFloat(rankDetail.price.toString());
            const addedFeePrice = Price + Price * 0.03;
            const rankPriceInITC = addedFeePrice * parseFloat(priceData?.TUSDTperTITC || "0.0");

            console.log(`Rank ${ranks[i].name} details:`, {
              price: Price,
              addedFeePrice,
              rankPriceInITC
            });

            // Normalize rank key to match the mapping keys
            const rankKey = ranks[i].name.replace(/[^A-Z_]/g, "") as keyof typeof rabPercentageMapping;
            const rabShare = rabPercentageMapping[rankKey] || "-";

            details.push({
              id: i,
              name: ranks[i].name,
              cumulativePrice: Price.toFixed(2),
              addedFeePrice: addedFeePrice.toFixed(2),
              rankPriceInITC: rankPriceInITC.toFixed(2),
              rabShare,
              isEligible: eligibleRanks.includes(rankKey),
            });
          } catch (error) {
            console.error(`Error fetching rank ${i} details:`, error);
          }
        }
        
        console.log("Setting rank details:", details);
        setRankDetails(details);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load rank data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndRankDetails();
  }, [walletProvider, isConnected, priceData]);

  // Log when user rank updates
  useEffect(() => {
    console.log("User rank updated:", userRank);
  }, [userRank]);

  return (
    <>
      <div className="fixed inset-0 -z-10">
        {darkMode ? <FeaturesSection /> : <Light />}
      </div>
      
      {!isConnected ? (
        navigate("/")
      ) : (
        <div className="min-h-screen p-4 md:p-6 lg:p-8">
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

            {/* Loading State */}
            {loading && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-6">
                <p>{error}</p>
              </div>
            )}

            {/* Main Content Card */}
            {!loading && !error && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700 transition-all duration-300">
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
                      {rankDetails.map((rank, index) => (
                        <tr
                          key={rank.id}
                          className={`
                            border-b border-gray-200 dark:border-gray-700
                            transition-colors duration-200
                            ${userRank === rank.id ? "bg-emerald-50 dark:bg-emerald-900/20" : ""}
                            ${userRank !== null && rank.id < userRank ? "bg-indigo-50 dark:bg-indigo-900/20" : ""}
                            hover:bg-gray-50 dark:hover:bg-gray-700/50
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
                      ))}
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
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default RankDetailsPage;