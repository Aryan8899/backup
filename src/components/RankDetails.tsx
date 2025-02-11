import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { contractAbi } from "./Props/contractAbi";
import { contractAddress } from "./Props/contractAddress";
import { usePriceData } from "../components/PriceContext";
import {
  useWeb3ModalProvider,
  useWeb3ModalAccount,
} from "@web3modal/ethers5/react";
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
  const { walletProvider } = useWeb3ModalProvider();

  const { darkMode } = useDarkMode(); // ✅ Dark mode state is correctly retrieved

  useEffect(() => {
    console.log("Dark Mode State:", darkMode); // ✅ Debugging log to check state updates
  }, [darkMode]);

  //   const { address } = useWeb3ModalAccount();
  const [userRank, setUserRank] = useState<number | null>(null);
  const [rankDetails, setRankDetails] = useState<any[]>([]);
  const { priceData } = usePriceData();
  // const [price, setPrice] = useState<string>("Loading...");

  // useEffect(() => {
  //   fetchPrice("itc", setPrice);
  // }, []);

  // const fetchPrice = async (
  //   coinId: string,
  //   setPrice: React.Dispatch<React.SetStateAction<string>>
  // ) => {
  //   try {
  //     const response = await fetch(
  //       `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`
  //     );
  //     const data = await response.json();
  //     setPrice(`$${data[coinId].usd}`);
  //   } catch (error) {
  //     console.error("Error fetching data:", error);
  //     setPrice("Error fetching price");
  //   }
  // };

  // const rabPercentageMapping = {
  //   DIAMOND: "5%",
  //   BLUE_DIAMOND: "10%",
  //   BLACK_DIAMOND: "15%",
  //   ROYAL_DIAMOND: "20%",
  //   CROWN_DIAMOND: "50%",
  // };

  const navigate = useNavigate();
  const { address, isConnected } = useWeb3ModalAccount();
  const [isProviderReady, setIsProviderReady] = useState(false);
  useEffect(() => {
    setIsProviderReady(!!walletProvider);
  }, [walletProvider]);

  useEffect(() => {
    const checkRegistrationStatus = async (newAddress: string) => {
      if (!isConnected || !walletProvider || !isProviderReady || !newAddress) {
        console.warn("Wallet is not connected or provider is not ready.");
        return;
      }

      try {
        console.log("Checking registration status for:", newAddress);

        // Initialize Web3 provider and contract
        const ethersProvider = new ethers.providers.Web3Provider(
          walletProvider
        );
        const signer = ethersProvider.getSigner();
        const contract = new ethers.Contract(
          contractAddress,
          contractAbi,
          signer
        );

        // Fetch user details from the contract
        const userData = await contract.users(newAddress);
        console.log("Fetched User Data:", userData);

        // Ensure userData exists and check isActive status
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

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length > 0) {
        console.log("MetaMask account changed to:", accounts[0]);
        checkRegistrationStatus(accounts[0]); // Check if the new account is registered
      } else {
        console.log("No account connected, redirecting...");
        navigate("/"); // Redirect if no account is connected
      }
    };

    if (walletProvider) {
      const provider = new ethers.providers.Web3Provider(walletProvider as any);
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

  useEffect(() => {
    if (walletProvider) {
      const provider = new ethers.providers.Web3Provider(walletProvider);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        contractAbi,
        signer
      );

      const fetchUserDetails = async () => {
        try {
          const address = await signer.getAddress();
          const userData = await contract.users(address);

          // Convert user rank to integer
          const userRankId = parseInt(userData[1].toString(), 10);
          setUserRank(userRankId);
        } catch (error) {
          console.error("Error fetching user details:", error);
        }
      };

      const fetchRankDetails = async () => {
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
            const rankPriceInITC =
              addedFeePrice * parseFloat(priceData?.TUSDTperTITC || "0.0");

            console.log(`Checking Rank: ${ranks[i].name}`);

            // Check eligibility based on the rank name
            // Normalize rank key to match the mapping keys
            const rankKey = ranks[i].name.replace(
              /[^A-Z_]/g,
              ""
            ) as keyof typeof rabPercentageMapping;

            // Get the RAB percentage if the rank exists in the mapping, otherwise set "-"
            const rabShare = rabPercentageMapping[rankKey] || "-";

            details.push({
              id: i,
              name: ranks[i].name,
              cumulativePrice: Price.toFixed(2),
              addedFeePrice: addedFeePrice.toFixed(2),
              rankPriceInITC: rankPriceInITC.toFixed(2),
              rabShare, // Adjust this as per your logic for RAB Share
              isEligible: eligibleRanks.includes(rankKey),
            });
          } catch (error) {
            console.error(`Error fetching rank ${i} details:`, error);
          }
        }
        setRankDetails(details);
      };
      fetchUserDetails();

      fetchRankDetails();
    }
  }, [walletProvider]);

  return (
    <>
      <div className="fixed inset-0 -z-10">
        {darkMode ? <FeaturesSection /> : <Light />}
      </div>
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

          {/* Main Content Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700 transition-all duration-300">
            {/* Table Container */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-600 to-purple-600">
                    <th className="px-6 py-4 text-white font-semibold text-left">
                      Rank
                    </th>
                    <th className="px-6 py-4 text-white font-semibold text-right">
                      Price (USD)
                    </th>
                    <th className="px-6 py-4 text-white font-semibold text-right">
                      Fee Added
                    </th>
                    <th className="px-6 py-4 text-white font-semibold text-right">
                      ITC Price
                    </th>
                    <th className="px-6 py-4 text-white font-semibold text-center">
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
                    ${
                      userRank === rank.id
                        ? "bg-emerald-50 dark:bg-emerald-900/20"
                        : ""
                    }
                    ${
                      userRank !== null && rank.id < userRank
                        ? "bg-indigo-50 dark:bg-indigo-900/20"
                        : ""
                    }
                    hover:bg-gray-50 dark:hover:bg-gray-700/50
                  `}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <img
                              src={ranks[index].image}
                              alt={rank.name}
                              className="h-12 w-12 rounded-full object-cover ring-2 ring-purple-500"
                            />
                          </div>
                          <div>
                            <p
                              className={`font-semibold ${
                                userRank === rank.id
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : "text-gray-900 dark:text-white"
                              }`}
                            >
                              {rank.name}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Level {index + 1}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          ${rank.cumulativePrice}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          ${rank.addedFeePrice}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {rank.rankPriceInITC}
                        </span>
                        <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">
                          ITC
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <span
                            className={`
                        inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
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

            {/* Legend Section */}
            <div className="p-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
        </div>
      </div>
    </>
  );
};

export default RankDetailsPage;
