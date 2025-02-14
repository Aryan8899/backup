import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { contractAbi } from "./Props/contractAbi";
import { contractAddress } from "./Props/contractAddress";
import { useWeb3ModalProvider } from "@web3modal/ethers5/react";
import { useWeb3ModalAccount } from "@web3modal/ethers5/react";
import { BigNumber } from "ethers";
import { useNavigate } from "react-router-dom";
import { useDarkMode } from "../components/DarkModeContext";
import FeaturesSection from "../components/FeaturesSection";
import Light from "../components/Light";
import Loader from "./Loader";

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

// Keep all the existing interfaces and type definitions...

const RankDetailsPage = () => {
  const { darkMode } = useDarkMode(); // ✅ Dark mode state is correctly retrieved

  useEffect(() => {
    console.log("Dark Mode State:", darkMode); // ✅ Debugging log to check state updates
  }, [darkMode]);

  const navigate = useNavigate();
  const [withdrawalBonus, setWithdrawalBonus] = useState("0");
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);

  const { address, isConnected } = useWeb3ModalAccount();
  const [totalBonus, setTotalBonus] = useState("0");
  const [isProviderReady, setIsProviderReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { walletProvider } = useWeb3ModalProvider();
  const [error, setError] = useState<ErrorType>(null);
  type ErrorType = string | null;
  const [totalPendingAmount, setTotalPendingAmount] =
    useState<string>("Loading...");
  const [rankDetails, setRankDetails] = useState<
    {
      id: number;
      name: string;
      count: string;
      pendingAmount: string;
      totalDistributedAmount: string;
    }[]
  >([]);
  const [connectedAddress, setConnectedAddress] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  // Fetch connected wallet address

  interface UserDetails {
    referrer: string;
    currentRank: string;
    lastRankUpdateTime: string;
    rankExpiryTime: string;
    totalInvestment: string;
    isActive: boolean;
    rewards: string;
  }

  useEffect(() => {
    console.log(withdrawalBonus,isLoading,error)
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
    const fetchAddress = async () => {
      if (walletProvider) {
        try {
          const provider = new ethers.providers.Web3Provider(walletProvider);
          const signer = provider.getSigner();
          const address = await signer.getAddress(); // Get connected wallet address
          console.log("the add is", address);
          setConnectedAddress(address);
        } catch (error) {
          console.error("Error fetching connected address:", error);
        }
      }
    };
    fetchAddress();
  }, [walletProvider]);

  useEffect(() => {
    setIsProviderReady(!!walletProvider);
  }, [walletProvider]);

  useEffect(() => {
    const getRankName = (rankIndex: string) => {
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

      const rank = ranks.find((r) => r.index === parseInt(rankIndex));
      return rank ? rank.name : "Unknown Rank";
    };

    // ...

    const fetchUserDetails = async () => {
      if (!isConnected || !walletProvider || !isProviderReady || !address) {
        console.warn("Prerequisites not met for fetching user details");
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

        //console.log(address);

        // Fetch user data
        const userData = await contract.users(address);
        //console.log("Raw user data:", userData);

        const formatTimestamp = (timestamp: any): string => {
          try {
            // Log the incoming timestamp
            console.log("Original timestamp:", timestamp);
            
            // Convert to number and log
            const timestampNum = Number(timestamp);
            console.log("Converted to number:", timestampNum);
            
            if (isNaN(timestampNum) || timestampNum === 0) {
              console.log("Invalid timestamp detected");
              return "Not updated";
            }
        
            // Log milliseconds conversion
            console.log("In milliseconds:", timestampNum * 1000);
            
            // Log final date
            const finalDate = new Date(timestampNum * 1000).toLocaleDateString();
            console.log("Final formatted date:", finalDate);
            
            return finalDate;
            
          } catch (error) {
            console.error('Error formatting timestamp:', error);
            return "Invalid timestamp";
          }
        };

        // ─── 1) Build a total of rewards at indices [1], [3], [5] ────────────
        let rewardSumBN = BigNumber.from(0);
        if (Array.isArray(userData[6])) {
          // Safely convert each element to a BigNumber if present, otherwise 0
          const r1 = userData[6][1]
            ? BigNumber.from(userData[6][1])
            : BigNumber.from(0);
          const r3 = userData[6][3]
            ? BigNumber.from(userData[6][3])
            : BigNumber.from(0);
          const r5 = userData[6][5]
            ? BigNumber.from(userData[6][5])
            : BigNumber.from(0);

          // Sum them all
          rewardSumBN = rewardSumBN.add(r1).add(r3).add(r5);
        }

        // ─── 2) Format other fields as before ────────────────────────────────
        const formattedData = {
          referrer: userData[2] || "No referrer",
          currentRank: getRankName(userData[0]?.toString() || "0"),
          lastRankUpdateTime: formatTimestamp(Number(userData.lastRankUpdateTime)),
  rankExpiryTime: formatTimestamp(Number(userData.rankExpiryTime)),
          totalInvestment: ethers.utils.formatEther(
            userData[5]?.toString() || "0"
          ),
          isActive: userData[5] || false,

          // ─── 3) Use the summed rewards for the 'rewards' field ─────────────
          rewards: ethers.utils.formatEther(rewardSumBN),
        };

        //console.log("Formatted user datass:::::", formattedData);
        setUserDetails(formattedData);
        setError(null);
      } catch (error) {
        console.error("Error fetching user details:", error);
        setUserDetails({
          referrer: "Not Available",
          currentRank: "Not Available",
          lastRankUpdateTime: "Not Available",
          rankExpiryTime: "Not Available",
          totalInvestment: "0",
          isActive: false,
          rewards: "0",
        });
        setError("Failed to fetch user details. Please try again.");
      }
    };

    fetchUserDetails();
  }, [isConnected, walletProvider, isProviderReady, address]);

  useEffect(() => {
    const fetchRankDetails = async () => {
      if (walletProvider && connectedAddress) {
        try {
          const provider = new ethers.providers.Web3Provider(walletProvider);
          const signer = provider.getSigner();
          const contract = new ethers.Contract(
            contractAddress,
            contractAbi,
            signer
          );

          const details = [];
          let pendingAmountTotal = ethers.BigNumber.from("0"); // Initialize total as BigNumber

          for (let i = 0; i <= 8; i++) {
            const response = await contract.getRankLTG(connectedAddress, i); // Pass connected wallet address and rank ID
            // console.log("the ltg is", response);

            // console.log("the pencho is",Number(response.ttlDstrbtdAmount
            // ));

            // Add the pending amount to the total
            if (i <= 7) {
              pendingAmountTotal = pendingAmountTotal.add(
                response.pendingAmount
              );
            }

            details.push({
              id: i,
              name: ranks[i].name,
              count: response.count.toString(),
              pendingAmount: ethers.utils.formatEther(response.pendingAmount),
              totalDistributedAmount: ethers.utils.formatEther(
                response.ttlDstrbtdAmount
              ),
            });
          }
          setRankDetails(details);

          // Set the rank details and the total pending amount with 2 decimal places
          setRankDetails(details);
          setTotalPendingAmount(
            parseFloat(ethers.utils.formatEther(pendingAmountTotal)).toFixed(2)
          ); // Convert to string with 2 decimal places
          setLoading(false);
        } catch (error) {
          console.error("Error fetching rank details:", error);
          setLoading(false);
        }
      }
    };
    fetchRankDetails();
  }, [walletProvider, connectedAddress]);

  useEffect(() => {
    const fetchBonusData = async () => {
      if (!isConnected || !walletProvider || !address) {
        console.error(
          "Wallet not connected, provider not ready, or address missing"
        );
        return;
      }

      setIsLoading(true);
      setError(null);

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

        // Fetch withdrawal bonus
        // const withdrawalBonusData = await contract.getWthltgbIncm(address);
        // setWithdrawalBonus(
        //   parseFloat(
        //     ethers.utils.formatEther(withdrawalBonusData || "0")
        //   ).toFixed(4)
        // );

        // Fetch total bonus
        const totalBonusData = await contract.getUsrTtlLtgrcvd(address);
        setTotalBonus(
          parseFloat(ethers.utils.formatEther(totalBonusData || "0")).toFixed(4)
        );
      } catch (error) {
        console.error("Error fetching bonus data:", error);
        setError("Failed to fetch bonus data");
        setWithdrawalBonus("0");
        setTotalBonus("0");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBonusData();
  }, [isConnected, walletProvider, address]);

  // Fetch rank details
  useEffect(() => {
    const fetchRankDetails = async () => {
      if (walletProvider && connectedAddress) {
        try {
          const provider = new ethers.providers.Web3Provider(walletProvider);
          const signer = provider.getSigner();
          const contract = new ethers.Contract(
            contractAddress,
            contractAbi,
            signer
          );

          const details = [];
          for (let i = 0; i <= 8; i++) {
            const response = await contract.getRankLTG(connectedAddress, i); // Pass connected wallet address and rank ID
            //console.log("the ltg is", response);
            details.push({
              id: i,
              name: ranks[i].name,
              count: response.count.toString(),
              pendingAmount: ethers.utils.formatEther(response.pendingAmount),
              totalDistributedAmount: ethers.utils.formatEther(
                response.ttlDstrbtdAmount
              ),

              //console.log(count);
            });
          }
          setRankDetails(details);
          setLoading(false);
        } catch (error) {
          console.error("Error fetching rank details:", error);
          setLoading(false);
        }
      }
    };
    fetchRankDetails();
  }, [walletProvider, connectedAddress]);

  return (
    <>
      <div className="fixed inset-0 -z-10">
        {darkMode ? <FeaturesSection /> : <Light />}
      </div>

      {!isConnected ? (
        navigate("/")
      ) : (

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
          {loading ? (
            <Loader />
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-2xl dark:hover:shadow-[0_0_15px_rgba(0,255,255,0.3)]">
              <div className="overflow-x-auto">
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
                        className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
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
                              USDT
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-center">
                            <span className="text-gray-900 dark:text-gray-100 font-medium">
                              {parseFloat(rank.totalDistributedAmount).toFixed(
                                2
                              )}
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                              USDT
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6 bg-gray-50 dark:bg-gray-900">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Total Pending
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {totalPendingAmount} USDT
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Total Bonus
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {totalBonus} USDT
                  </p>
                </div>
                <div className="w-full max-w-sm bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
      <p className="text-sm text-gray-500 dark:text-gray-400">Current Rank</p>
      
      <div className="flex flex-col items-start space-y-3 mt-2 sm:flex-row sm:space-y-0 sm:space-x-4 sm:items-center sm:text-sm sm:ml-2">
 <img
   src={ranks.find((r) => r.name === userDetails?.currentRank)?.image || ranks[0].image}
   alt={userDetails?.currentRank || "STAR"}
   className="w-12 h-12 object-contain sm:w-10 sm:h-10"
 />
 
 <p className="lg:text-xl text-xl md:text-xl font-bold text-gray-900 dark:text-white truncate  mr-10 
   xs:text-lg"
   style={{marginLeft: "0rem" }}
   >
   {userDetails?.currentRank || "N/A"}
 </p>
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
