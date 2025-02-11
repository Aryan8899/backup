import { memo, useEffect, useState } from "react";
// import SimpleBar from "simplebar-react";
import axios from "axios";
// import "simplebar/dist/simplebar.min.css";
//import React from "react";
// import {
//   Menu,
//   X, // Add this import
// } from "lucide-react";
//import  useNavigate  from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { Edit2 } from "lucide-react";
import multiavatar from "@multiavatar/multiavatar";
import "react-toastify/dist/ReactToastify.css";
import { BigNumber, constants } from "ethers";
import { useWeb3ModalAccount } from "@web3modal/ethers5/react";
// import { Play, Pause, RotateCcw } from "lucide-react";
// import { ChevronDown, ChevronUp, MoreVertical } from "lucide-react";
import { ethers } from "ethers";
import contractAbi from "./Props/contractAbi.ts"; // Adjust path as needed
import contractAddress from "./Props/contractAddress.ts"; // Adjust path as needed
// At the top of your component, modify the imports and provider handling
import { useWeb3ModalProvider } from "@web3modal/ethers5/react"; // Add this import if not present
import { Bar } from "react-chartjs-2";
import { CheckCheck, Copy } from "lucide-react";
import { useWindowSize } from "react-use";
import Confetti from "react-confetti";
// import ReferralTree from "./ReferralTree";
// import { useNavigate } from "react-router-dom";

// import Header from "./Header.tsx";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useNavigate } from "react-router-dom";

// Register chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// interface Task {
//   id: number;
//   title: string;
//   time: string;
//   date: string;
//   completed: boolean;
// }

// interface CircularProgressProps {
//   percentage: number;
//   color: string;
//   ticker: "crypto" | "forex";
// }

const cryptoData = [
  { icon: "₿", pair: "BTC/USDT", value: "42,389.50" },
  { icon: "Ξ", pair: "ETH/USDT", value: "2,890.75" },
  { icon: "○", pair: "DOT/USDT", value: "15.23" },
  { icon: "Ł", pair: "LTC/USDT", value: "68.45" },
  { icon: "●", pair: "BNB/USDT", value: "312.80" },
];

// const forexData = [
//   { icon: "$", pair: "EUR/USD", value: "1.0924" },
//   { icon: "£", pair: "GBP/USD", value: "1.2645" },
//   { icon: "¥", pair: "USD/JPY", value: "148.12" },
//   { icon: "₣", pair: "USD/CHF", value: "0.8851" },
//   { icon: "$", pair: "AUD/USD", value: "0.6584" },
// ];

// Circular Progress Component
interface TickerItem {
  icon: string;
  pair: string;
  value: string;
}

interface TickerRowProps {
  label: string;
  items: TickerItem[];
  tickerType: "crypto" | "forex"; // Changed 'type' to 'tickerType' to avoid conflicts
}

const TickerRow = memo(({ label, items, tickerType }: TickerRowProps) => {
  const [position, setPosition] = useState(0);
  const [width, setWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const ticker = document.getElementById(`ticker-${label}`);
    const container = document.getElementById(`container-${label}`);
    if (ticker && container) {
      setWidth(ticker.scrollWidth);
      setContainerWidth(container.offsetWidth);
    }
  }, [label]);

  useEffect(() => {
    if (width > 0) {
      const animation = setInterval(() => {
        setPosition((prev) => {
          if (prev <= -width) {
            return containerWidth;
          }
          return prev - 1;
        });
      }, 10);

      return () => clearInterval(animation);
    }
  }, [width, containerWidth]);

  // Determine background and text colors based on tickerType
  //const bgColor = tickerType === "crypto" ? "bg-gradient-to-r from-blue-100 to-blue-200" : "bg-pink-100";
  const labelColor = tickerType === "crypto" ? "text-black" : "text-pink-600";
  const valueColor =
    tickerType === "crypto" ? "text-blue-900" : "text-pink-900";

  return (
    <div className={`p-4 relative overflow-hidden border rounded-lg shadow-md`}>
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <span className={`${labelColor} font-bold text-lg`}>{label}</span>
        <div
          id={`container-${label}`}
          className="flex-1 overflow-hidden w-full"
        >
          <div
            id={`ticker-${label}`}
            className="flex items-center whitespace-nowrap gap-8"
            style={{
              transform: `translateX(${position}px)`,
              transition:
                position === containerWidth ? "none" : "transform 0.1s linear",
            }}
          >
            {items.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className={`${labelColor} font-medium text-sm`}>
                  {item.icon} {item.pair}:
                </span>
                <span className={`${valueColor} font-bold text-lg`}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

// Flip Button Component

// Modified Progress Card Component

// const CircularProgress = memo(
//   ({ percentage, color }: CircularProgressProps) => {
//     //const { isDark } = useTheme();
//     // const baseCircleColor = isDark ? "#374151" : "#1f2937";

//     return (
//       <div className="relative w-24 h-24 sm:w-24 sm:h-24">
//         <svg className="w-full h-full" viewBox="0 0 36 36">
//           <circle
//             cx="18"
//             cy="18"
//             r="15.9155"
//             stroke="#000" // Black border
//             strokeWidth="3"
//             fill="none"
//           />
//           <circle
//             cx="18"
//             cy="18"
//             r="15.9155"
//             stroke={color}
//             strokeWidth="3"
//             fill="none"
//             strokeDasharray={`${percentage}, 100`}
//             transform="rotate(-90 18 18)"
//           />
//         </svg>
//         <div
//           className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2`}
//         >
//           {percentage}%
//         </div>
//       </div>
//     );
//   }
// );

// const recentBonuses = [
//   { amount: 70, date: "22 May 2023", type: "Other Bonus" },
//   { amount: 0.07, date: "24 Apr 2023", type: "Other Bonus" },
//   { amount: 7, date: "18 Apr 2023", type: "Other Bonus" },
//   { amount: 192500, date: "31 Jan 2023", type: "LTG Bonus" },
//   { amount: 7, date: "18 Jan 2023", type: "Other Bonus" },
//   { amount: 7, date: "16 Jan 2023", type: "Other Bonus" },
// ];

const ranks = [
  { name: "STAR", index: 0, color: "#B8B8B8" },
  { name: "BRONZE", index: 1, color: "#CD7F32" },
  { name: "SILVER", index: 2, color: "#C0C0C0" },
  { name: "GOLD", index: 3, color: "#FFD700" },
  { name: "DIAMOND", index: 4, color: "#B9F2FF" },
  { name: "BLUE_DIAMOND", index: 5, color: "#4169E1" },
  { name: "BLACK_DIAMOND", index: 6, color: "#111111" },
  { name: "ROYAL_DIAMOND", index: 7, color: "#E6BE8A" },
  { name: "CROWN_DIAMOND", index: 8, color: "#8A2BE2" },
];

// const getColor = (tier: string): string => {
//   const colors: Record<string, string> = {
//     Diamond: "#10B981",
//     "Blue Diamond": "#0EA5E9",
//     "Black Diamond": "#6B7280",
//     "Royal Diamond": "#F59E0B",
//     "Crown Diamond": "#6366F1",
//   };
//   return colors[tier] || "#6B7280";
// };

interface GraphData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor: string[];
    borderColor: string[];
    borderWidth: number;
  }>;
}

const Dashboard = () => {
  const [userData, setUserData] = useState<{
    nickname: string;
    avatar: string;
    referralQR: string;
  } | null>(null);

  const [usrCnt, setUsrCnt] = useState<number | null>(null);
  const [arbPoolBalance, setArbPoolBalance] = useState("0");
  const [isLoadingARB, setIsLoadingARB] = useState(false);
  const [errorARB, setErrorARB] = useState<string | null>(null);
  const [totalPendingAmount, setTotalPendingAmount] =
    useState<string>("Loading...");

  const [avatarSVG, setAvatarSVG] = useState<string>("");

  const [count, setCount] = useState(0);
  const [itcPrice, setItcPrice] = useState<number | null>(null);
  const [rankDetails, setRankDetails] = useState<any[]>([]);
  const [totalInvestment, setTotalInvestment] = useState("0");

  // const [rankData, setRankData] = useState<RankData[]>([]);
  const [rankGraphData, setRankGraphData] = useState<GraphData>({
    labels: [],
    datasets: [],
  });

  const [countLTGPool, setCountLTGPool] = useState(0);
  const [countRTGPool, setCountRTGPool] = useState(0); // State to animate RTG pool count
  const [countLDPPool, setCountLDPPool] = useState(0);

  // const [showReferralTree, setShowReferralTree] = useState(false);

  // const navigate = useNavigate();

  // const handleNavigateToReferralTree = () => {
  //   navigate("/referral-tree");
  // };

  // const defaultUserDetails: UserDetails = {
  //   referrer: "Not Available",
  //   currentRank: "Not Available",
  //   lastRankUpdateTime: "Not Available",
  //   rankExpiryTime: "Not Available",
  //   totalInvestment: "0",
  //   isActive: false,
  //   rewards: "0",
  // };

  interface Rank {
    name: string;
    index: number;
    multiplier: number;
  }

  interface RankTotals {
    [key: string]: string; // This allows string indexing
  }

  interface RankData {
    cnt: ethers.BigNumber;
    // Add other properties from your contract's rUC return type if any
  }

  // interface DashboardProps {
  //   isConnected: boolean;
  //   walletProvider: any; // Replace with proper web3 provider type if available
  //   isProviderReady: boolean;
  //   contractAddress: string;
  //   contractAbi: any[]; // Replace with your specific ABI type
  // }

  interface RankData {
    name: string;
    count: number;
    color: string;
  }

  interface UserDetails {
    referrer: string;
    currentRank: string;
    lastRankUpdateTime: string;
    rankExpiryTime: string;
    totalInvestment: string;
    isActive: boolean;
    rewards: string;
  }

  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);

  // const [rankCounts, setRankCounts] = useState([]);
  // //const [userDetails, setUserDetails] = useState(null);

  // const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  // const dates = ["22", "23", "24", "25", "26", "27"];

  const [totalLTGPool, setTotalLTGPool] = useState<number | null>(null);
  const [totalRTGPool, setTotalRTGPool] = useState<number | null>(null);
  const [totalLDPPool, setTotalLDPPool] = useState<number | null>(null);

  // const [rankTotals, setRankTotals] = useState<{ [key: string]: string }>({});
  // const [totalPoolValue, setTotalPoolValue] = useState<string>("0");

  // const [calculatedTotal, setCalculatedTotal] = useState("0");

  //const { provider } = useWeb3Modal(); // Use the wallet provider from Web3Modal
  // Add new state for RAB
  // const [dropdownOpen, setDropdownOpen] = useState(false);
  // const [selectedRank, setSelectedRank] = useState("STAR"); // Default rank

  const [withdrawalRAB, setWithdrawalRAB] = useState("0");

  const [withdrawalLevel, setWithdrawalLevel] = useState("0");
  const [totalLevel, setTotalLevel] = useState("0");
  // const [rankUserCounts, setRankUserCounts] = useState<Record<string, number>>(
  //   {}
  // );

  const [totalRAB, setTotalRAB] = useState("0");
  const [withdrawalBonus, setWithdrawalBonus] = useState("0");
  const [totalBonus, setTotalBonus] = useState("0");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ErrorType>(null);
  type ErrorType = string | null;
  // const { open } = useWeb3Modal();
  const { address, isConnected } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();
  const [isProviderReady, setIsProviderReady] = useState(false);
  const [inviteLink, setInviteLink] = useState(
    `https://cryptomx.site/#/register?referral=undefined`
  );
  const [isCopied, setIsCopied] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    console.log(error);
    const fetchAddress = async () => {
      //console.log(withdrawalRab);
      if (walletProvider) {
        try {
          const provider = new ethers.providers.Web3Provider(walletProvider);
          const signer = provider.getSigner();
          const address = await signer.getAddress(); // Get connected wallet address
          console.log("the address is", address);
          setConnectedAddress(address);
          const avatar = multiavatar(address);
          setAvatarSVG(avatar);
        } catch (error) {
          console.error("Error fetching connected address:", error);
        }
      }
    };
    fetchAddress();
  }, [walletProvider]);

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(inviteLink)
      .then(() => {
        setIsCopied(true); // Change button to tick sign
        setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  };

  const [menuOpen, setMenuOpen] = useState(false);

  const fetchArbPoolBalance = async () => {
    if (!isConnected || !walletProvider) {
      console.warn("Wallet not connected or provider unavailable");
      return;
    }

    setIsLoadingARB(true);
    setErrorARB(null);

    try {
      const ethersProvider = new ethers.providers.Web3Provider(walletProvider);
      const signer = ethersProvider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        contractAbi,
        signer
      );

      const arbPool = await contract.arbPool(); // Fetch ARB pool balance
      setArbPoolBalance(ethers.utils.formatEther(arbPool)); // Convert to Ether and set state
    } catch (error) {
      console.error("Error fetching ARB pool balance:", error);
      setErrorARB("Failed to fetch ARB pool balance.");
      setArbPoolBalance("0");
    } finally {
      setIsLoadingARB(false);
    }
  };

  const handleWithdrawARBPoolBalance = async () => {
    if (!isConnected || !walletProvider) {
      console.warn("Wallet not connected or provider unavailable");
      return;
    }

    setIsLoadingARB(true);

    try {
      const ethersProvider = new ethers.providers.Web3Provider(walletProvider);
      const signer = ethersProvider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        contractAbi,
        signer
      );

      const tx = await contract.withdrawARBPoolBalance(); // Withdraw ARB pool balance
      await tx.wait();

      toast.success("ARB Pool balance withdrawn successfully!");
      fetchArbPoolBalance(); // Refresh the balance after withdrawal
    } catch (error) {
      console.error("Error withdrawing ARB pool balance:", error);
      toast.error("Failed to withdraw ARB pool balance.");
    } finally {
      setIsLoadingARB(false);
    }
  };

  useEffect(() => {
    fetchArbPoolBalance();
  }, [isConnected, walletProvider]);

  const currentRankIndex = ranks.findIndex(
    (rank) => rank.name === userDetails?.currentRank
  );

  //console.log("Current Rank Index:", currentRankIndex);

  // Filtered ranks greater than the user's current rank
  const filteredRanks = ranks.filter((rank) => rank.index > currentRankIndex);
  //console.log("Filtered Ranks:", filteredRanks);

  useEffect(() => {
    if (isConnected) {
      const a = async () => {
        if (address) {
          // const userDetails = await contract.uS(address);
          // console.log(userDetails);
          // setUserData(userDetails);
          // const userDetails2 = await contract.uS2(address);
          // console.log("ud2.............>", userDetails2);
          // setUserData2(userDetails2);
          // const rewardDetails = await contract.rI(address);
          // setRewardData(rewardDetails);
          // const business = await contract.getBus();
          // setMonthlyBusiness(
          //   parseFloat(ethers.utils.formatUnits(business.mth_Bus, 18))
          // );
        }
      };
      a();

      if (address) {
        setInviteLink(`https://cryptomx.site/#/register?referral=${address}`);
      }
      setIsLoading(false);
    }
  }, [address]);

  // Fetch `usrCnt` from the contract
  useEffect(() => {
    const fetchUsrCnt = async () => {
      if (!isConnected || !walletProvider || !isProviderReady) {
        console.warn("Wallet not connected or provider not ready");
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

        // Fetch `usrCnt` from the contract
        const usrCntValue = await contract.usrCnt();
        setUsrCnt(usrCntValue.toNumber()); // Convert BigNumber to a regular number
      } catch (error) {
        console.error("Error fetching usrCnt:", error);
        setUsrCnt(null); // Reset `usrCnt` in case of an error
      }
    };

    fetchUsrCnt();
  }, [isConnected, walletProvider, isProviderReady]);

  const [connectedAddress, setConnectedAddress] = useState<string>("");

  useEffect(() => {
    if (usrCnt !== null) {
      let currentCount = 0;
      const increment = Math.ceil(usrCnt / 999); // Adjust increment for smooth animation
      const interval = setInterval(() => {
        if (currentCount < usrCnt) {
          currentCount += increment;
          if (currentCount > usrCnt) {
            currentCount = usrCnt;
          }
          setCount(currentCount); // Update the count state
        } else {
          clearInterval(interval); // Stop the animation once the target is reached
        }
      }, 20); // Update every 10ms for a smooth animation
      return () => clearInterval(interval); // Cleanup the interval on component unmount
    }
  }, [usrCnt]);

  const fetchRankDetails = async () => {
    try {
      if (!isConnected || !walletProvider || !isProviderReady) return;

      const provider = new ethers.providers.Web3Provider(walletProvider);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        contractAbi,
        signer
      );
      const details = [];

      let pendingAmountTotal = ethers.BigNumber.from("0");
      for (let i = 0; i <= 8; i++) {
        const response = await contract.getRankLTG(connectedAddress, i); // Pass connected wallet address and rank ID
        //console.log("the ltg is", response);

        // Add the pending amount to the total
        if (i <= 7) {
          pendingAmountTotal = pendingAmountTotal.add(response.pendingAmount);
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

      let currentRankCumulativePrice = 0;

      for (let i = 0; i < ranks.length; i++) {
        try {
          const rankDetail = await contract.rankDetails(i);
          const cumulativePrice = parseFloat(
            rankDetail.cumulativePrice.toString()
          );

          // Store the current rank cumulative price
          if (ranks[i].name === userDetails?.currentRank) {
            currentRankCumulativePrice = cumulativePrice;
          }

          // Calculate the rank upgrade price in USD
          const rankUpgradePriceUSD =
            cumulativePrice - currentRankCumulativePrice;

          details.push({
            id: i,
            name: ranks[i].name,
            rankUpgradePriceUSD: rankUpgradePriceUSD.toFixed(2), // Price in USD
          });
        } catch (error) {
          console.error(`Error fetching rank ${i} details:`, error);
        }
      }

      setRankDetails(details);
      setTotalPendingAmount(
        parseFloat(ethers.utils.formatEther(pendingAmountTotal)).toFixed(2)
      );
    } catch (error) {
      console.error("Error initializing contract:", error);
    }
  };

  useEffect(() => {
    fetchRankDetails();
  }, [isConnected, walletProvider, isProviderReady]);

  useEffect(() => {
    const generateRankGraphData = async () => {
      if (!isConnected || !walletProvider || !isProviderReady) return;

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

        // Define all ranks with their indices
        const allRanks = [
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

        const activeRanks = [];
        const userCounts = [];

        for (let rank of allRanks) {
          try {
            const rankStatus = await contract.rUC(rank.index);
            const count = rankStatus.toNumber(); // Get the user count
            //console.log(`Rank ${rank.name} Count:`, count);

            activeRanks.push(rank); // Add the rank even if the count is 0
            userCounts.push(count); // Add the count (can be 0)
          } catch (error) {
            console.error(`Error fetching data for rank ${rank.name}:`, error);
            // If there's an error fetching the rank, default to 0
            activeRanks.push(rank);
            userCounts.push(0);
          }
        }

        // Generate graph data with all ranks
        const graphData = {
          labels: activeRanks.map((rank) => rank.name),
          datasets: [
            {
              label: "Number of Users",
              data: userCounts, // Use the fetched user counts
              backgroundColor: activeRanks.map((rank) => rank.color + "80"),
              borderColor: activeRanks.map((rank) => rank.color),
              borderWidth: 1,
            },
          ],
        };

        setRankGraphData(graphData);
      } catch (error) {
        console.error("Error generating rank graph data:", error);
      }
    };

    generateRankGraphData();
  }, [isConnected, walletProvider, isProviderReady]);

  useEffect(() => {
    const fetchTotalInvestment = async () => {
      if (!isConnected || !walletProvider || !isProviderReady || !address) {
        console.warn(
          "Wallet not connected, provider not ready, or address missing"
        );
        return;
      }

      setIsLoading(true);
      setError(null);
      //console.log("Fetching total investment...", error);

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

        // Fetch total investment
        const totalInvestmentData = await contract.getTtlInvstmnt(); // Pass address here
        const formattedInvestment = parseFloat(
          ethers.utils.formatEther(totalInvestmentData || "0")
        ).toFixed(2); // Format to 2 decimal places

        // console.log("Formatted total investment:", formattedInvestment);
        setTotalInvestment(formattedInvestment);
      } catch (error) {
        console.error("Error fetching total investment data:", error);
        setError("Failed to fetch total investment data");
        console.error(error);
        setTotalInvestment("0");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTotalInvestment();
  }, [isConnected, walletProvider, isProviderReady, address]);

  useEffect(() => {
    const fetchRankData = async () => {
      if (!isConnected || !walletProvider || !isProviderReady) {
        console.log("Prerequisites not met:", {
          isConnected,
          walletProvider,
          isProviderReady,
        });
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

        // Fetch pool values with proper error handling
        const [ltgValue, rtgValue, ldpValue] = await Promise.all([
          contract
            .getTtlLtgDstrbtd()
            .then((val: ethers.BigNumberish) =>
              parseFloat(ethers.utils.formatEther(val))
            )
            .catch(() => 0),
          contract
            .getTtlRabDstrbtd()
            .then((val: ethers.BigNumberish) =>
              parseFloat(ethers.utils.formatEther(val))
            )
            .catch(() => 0),
          contract
            .getTtllvlDstrbtd()
            .then((val: ethers.BigNumberish) =>
              parseFloat(ethers.utils.formatEther(val))
            )
            .catch(() => 0),
        ]);

        const totalPool = ltgValue + rtgValue + ldpValue;
        // setTotalPoolValue(totalPool.toFixed(4));

        const ranks: Rank[] = [
          { name: "STAR", index: 0, multiplier: 1 },
          { name: "BRONZE", index: 1, multiplier: 2 },
          { name: "SILVER", index: 2, multiplier: 3 },
          { name: "GOLD", index: 3, multiplier: 4 },
          { name: "DIAMOND", index: 4, multiplier: 5 },
          { name: "BLUE_DIAMOND", index: 5, multiplier: 6 },
          { name: "BLACK_DIAMOND", index: 6, multiplier: 7 },
          { name: "ROYAL_DIAMOND", index: 7, multiplier: 8 },
          { name: "CROWN_DIAMOND", index: 8, multiplier: 9 },
        ];

        const rankValues: RankTotals = {};

        await Promise.all(
          ranks.map(async (rank: Rank) => {
            try {
              const rankData: RankData = await contract.rUC(rank.index);

              if (!rankData || !rankData.cnt) {
                console.warn(`No valid data for rank ${rank.name}`);
                rankValues[rank.name] = "0.0000";
                return;
              }

              const count = ethers.BigNumber.from(rankData.cnt);
              rankValues[rank.name] = (
                parseFloat(count.toString()) * totalPool
              ).toFixed(4);
            } catch (error) {
              console.error(`Error fetching rank ${rank.name}:`, error);
              rankValues[rank.name] = "0.0000";
            }
          })
        );

        // setRankTotals(rankValues);
      } catch (error) {
        console.error("Error fetching rank data:", error);
        setError("Failed to fetch rank data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRankData();
  }, [
    isConnected,
    walletProvider,
    isProviderReady,
    contractAddress,
    contractAbi,
  ]);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedRank, setSelectedRank] = useState<any>(null);

  // const handleMobileConnect = async (e: { preventDefault: () => void; stopPropagation: () => void; }) => {
  //   e.preventDefault(); // Prevent event bubbling
  //   e.stopPropagation(); // Stop propagation to parent elements
  //   try {
  //     await open();
  //   } catch (error) {
  //     console.error("Failed to connect wallet:", error);
  //   }
  // };

  // Add a separate effect to handle provider initialization
  // Add provider initialization effect
  useEffect(() => {
    const initializeProvider = async () => {
      if (!isConnected || !walletProvider) {
        setIsProviderReady(false);
        return;
      }

      try {
        const ethersProvider = new ethers.providers.Web3Provider(
          walletProvider
        );
        const network = await ethersProvider.getNetwork();
        console.log("Connected to network:", network.name);
        setIsProviderReady(true);
      } catch (error) {
        console.error("Error initializing provider:", error);
        // setError("Failed to initialize provider");
        setIsProviderReady(false);
      }
    };

    initializeProvider();
  }, [isConnected, walletProvider]);

  // Improved implementation with better error handling and data fetching
  // Modify the bonus fetching effect to use the proper provider
  // Improved data fetching effect

  const fetchBonusData = async () => {
    if (!isConnected || !walletProvider || !isProviderReady || !address) {
      console.warn(
        "Wallet not connected, provider not ready, or address missing"
      );
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const ethersProvider = new ethers.providers.Web3Provider(walletProvider);
      const signer = ethersProvider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        contractAbi,
        signer
      );

      // Fetch data concurrently for better performance
      const [
        totalBonusData,
        withdrawalRABData,
        totalRABData,
        withdrawalLevelData,
        totalLevelData,
      ] = await Promise.all([
        // Pass address here
        contract.getUsrTtlLtgrcvd(address), // Pass address here
        contract.getWthrabIncome(address), // Pass address here
        contract.getUsrTtlrabrcvd(address), // Pass address here
        contract.getWthlvlIncm(address), // Pass address here
        contract.getUsrTtllvlrcvd(address), // Pass address here
      ]);

      console.log("with", withdrawalBonus);

      // Format the data

      setTotalBonus(
        parseFloat(ethers.utils.formatEther(totalBonusData || "0")).toFixed(4)
      );
      setWithdrawalRAB(
        parseFloat(ethers.utils.formatEther(withdrawalRABData || "0")).toFixed(
          4
        )
      );
      setTotalRAB(
        parseFloat(ethers.utils.formatEther(totalRABData || "0")).toFixed(4)
      );
      setWithdrawalLevel(
        parseFloat(
          ethers.utils.formatEther(withdrawalLevelData || "0")
        ).toFixed(4)
      );
      setTotalLevel(
        parseFloat(ethers.utils.formatEther(totalLevelData || "0")).toFixed(4)
      );

      // Calculate total bonuses
      // const total =
      //   parseFloat(ethers.utils.formatEther(totalBonusData || "0")) +
      //   parseFloat(ethers.utils.formatEther(totalRABData || "0")) +
      //   parseFloat(ethers.utils.formatEther(totalLevelData || "0"));

      // setCalculatedTotal(total.toFixed(4));
    } catch (error) {
      console.error("Error fetching bonus data:", error);
      setError("Failed to fetch bonus data");
      // Reset values on error
      setWithdrawalBonus("0");
      setTotalBonus("0");
      setWithdrawalRAB("0");
      setTotalRAB("0");
      setWithdrawalLevel("0");
      setTotalLevel("0");
      // setCalculatedTotal("0");
    } finally {
      setIsLoading(false);
    }
  };

  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [newNickname, setNewNickname] = useState("");

  const handleUpdateNickname = async () => {
    if (!connectedAddress) {
      toast.error("Wallet address not found. Please connect your wallet.");
      return;
    }

    try {
      // Make the PUT request to your backend
      const response = await axios.put(
        `https://itcback-production.up.railway.app/api/users/update`,
        {
          nickname: newNickname,
          address: address,
        }
      );

      // If successful, update local state and give user feedback
      if (response.status === 200) {
        toast.success("Nickname updated successfully!");

        // Update your local user data with the new nickname
        setUserData((prev) =>
          prev
            ? {
                ...prev,
                nickname: newNickname,
                address: address,
              }
            : null
        );

        // Close the modal
        setShowNicknameModal(false);
      } else {
        toast.error("Failed to update nickname. Please try again.");
      }
    } catch (error) {
      console.error("Error updating nickname:", error);
      toast.error("Error updating nickname. Check console for more details.");
    }
  };

  useEffect(() => {
    fetchBonusData();
  }, [isConnected, walletProvider, isProviderReady, address]);

  // const handleWithdrawBonus = async () => {
  //   if (!isConnected || !walletProvider || !isProviderReady || !address) {
  //     console.warn(
  //       "Wallet not connected, provider not ready, or address missing"
  //     );
  //     return;
  //   }

  //   try {
  //     setIsLoading(true);
  //     const ethersProvider = new ethers.providers.Web3Provider(walletProvider);
  //     const signer = ethersProvider.getSigner();
  //     const contract = new ethers.Contract(
  //       contractAddress,
  //       contractAbi,
  //       signer
  //     );

  //     const tx = await contract.getWthltgbIncm(address); // Lifetime Growth Bonus withdrawal function
  //     await tx.wait(); // Wait for the transaction to complete

  //     console.log("Withdraw Bonus Transaction Hash:", tx.hash);

  //     // Fetch updated bonus data after withdrawal
  //     const updatedBonus = await contract.getUsrTtlLtgrcvd(address);
  //     setWithdrawalBonus(
  //       parseFloat(ethers.utils.formatEther(updatedBonus || "0")).toFixed(4)
  //     );

  //     alert("Lifetime Growth Bonus withdrawn successfully!");
  //   } catch (error) {
  //     console.error("Error during bonus withdrawal:", error);
  //     alert("Failed to withdraw Lifetime Growth Bonus.");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [isLoadingLevel, setIsLoadingLevel] = useState(false);
  const [isLoadingRab, setIsLoadingRab] = useState(false);

  const handleWithdrawRab = async () => {
    console.log(qrCodeUrl);
    if (!isConnected || !walletProvider || !isProviderReady || !address) {
      console.warn(
        "Wallet not connected, provider not ready, or address missing"
      );
      return;
    }

    try {
      setIsLoadingRab(true);
      const ethersProvider = new ethers.providers.Web3Provider(walletProvider);
      const signer = ethersProvider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        contractAbi,
        signer
      );

      const tx = await contract.claimMonthlyRab(); // Level Distribution Pool withdrawal function
      await tx.wait();

      console.log("Withdraw Level Transaction Hash:", tx.hash);

      const updatedLevel = await contract.getUsrTtllvlrcvd(address);
      setWithdrawalRAB(
        parseFloat(ethers.utils.formatEther(updatedLevel || "0")).toFixed(4)
      );

      setShowConfetti(true);
      fetchBonusData();

      setTimeout(() => {
        setShowConfetti(false);
        // Reload after animation
      }, 5000);

      toast.success("🎉RAB  withdrawn successfully!");
      // window.location.reload();
    } catch (error) {
      console.error("Error during Level withdrawal:", error);
      toast.error("Failed to withdraw RAB .");
    } finally {
      setIsLoadingRab(false);
    }
  };

  const [selectedRankPriceUSD, setSelectedRankPriceUSD] = useState<number>(0); // Store USD price
  const [selectedRankPriceITC, setSelectedRankPriceITC] = useState<number>(0); // Store ITC price
  const handleRankSelection = (
    rank: string,
    priceUSD: number,
    priceITC: number
  ) => {
    setSelectedRank(rank);
    setSelectedRankPriceUSD(priceUSD);
    setSelectedRankPriceITC(priceITC);
    setDropdownOpen(false);
  };

  const upgradeRank = async () => {
    console.log(handleRankSelection);
    if (!selectedRank) {
      toast.info("Please select a rank to upgrade.");
      return;
    }

    if (!isConnected || !walletProvider || !isProviderReady || !address) {
      toast.info("Wallet not connected or provider not ready.");
      return;
    }

    try {
      setIsLoading(true);
      const ethersProvider = new ethers.providers.Web3Provider(walletProvider);
      const signer = ethersProvider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        contractAbi,
        signer
      );

      const rankIndex = ranks.findIndex((rank) => rank.name === selectedRank);

      //console.log("the rank isss ", rankIndex);
      if (rankIndex < 0) {
        toast.info("Invalid rank selected.");
        return;
      }

      // Assuming the contract has a function `upgradeToRank` that takes the rank index
      const tx = await contract.upgradeRank(rankIndex); // Replace `upgradeToRank` with your contract's function

      await tx.wait();

      // console.log(
      //   `Successfully upgraded to ${selectedRank}. Transaction:`,
      //   tx.hash
      // );
      toast.success(`Successfully upgraded to ${selectedRank}.`);
      //console.log("rank is upgraded in this");
      window.location.reload();
    } catch (error) {
      console.error("Error upgrading rank:", error);
      toast.error("Failed to upgrade rank. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const [showConfetti, setShowConfetti] = useState(false);
  const { width, height } = useWindowSize();

  const handleWithdrawLevel = async () => {
    if (!isConnected || !walletProvider || !isProviderReady || !address) {
      console.warn(
        "Wallet not connected, provider not ready, or address missing"
      );
      return;
    }

    try {
      setIsLoadingLevel(true);
      const ethersProvider = new ethers.providers.Web3Provider(walletProvider);
      const signer = ethersProvider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        contractAbi,
        signer
      );

      const tx = await contract.withdrawLevelIncome(); // Level Distribution Pool withdrawal function
      await tx.wait();

      console.log("Withdraw Level Transaction Hashhhhhhh:", tx.hash);

      const updatedLevel = await contract.getUsrTtllvlrcvd(address);
      setWithdrawalLevel(
        parseFloat(ethers.utils.formatEther(updatedLevel || "0")).toFixed(4)
      );

      // Show confetti animation

      // Show confetti animation
      setShowConfetti(true);
      fetchBonusData();
      toast.success("🎉Level Distribution Pool withdrawn successfully!");
      setTimeout(() => {
        setShowConfetti(false);
        // Reload after animation
      }, 5000);

      //window.location.reload();
    } catch (error) {
      console.error("Error during Level withdrawal:", error);
      toast.error("Failed to withdraw Level Distribution Pool.");
    } finally {
      setIsLoadingLevel(false);
    }
  };

  // Toggle menu with proper event handling

  // const toggleMenu = () => {
  //   setMenuOpen((prev) => !prev);
  //   document.body.style.overflow = menuOpen ? "unset" : "hidden"; // Prevent scrolling when menu is open
  // };

  // Add this to your existing useEffect hooks
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

        // Fetch user data
        const userData = await contract.users(address);
        //console.log("Raw user data:", userData);

        const formatTimestamp = (timestamp: BigNumber): string => {
          if (timestamp.eq(constants.MaxUint256)) {
            return "Never";
          }
          const timestampInt = parseInt(timestamp.toString(), 10);
          return timestampInt > 0
            ? new Date(timestampInt * 1000).toLocaleDateString()
            : "Not updated";
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

        // Extract the necessary details
        const expectedTime = userData[2]; // Expected time (e.g., last rank update time)
        const expiryTime = userData[3]; // Expiry time
        // Ensure current time is an integer before creating a BigNumber
        const currentTime = BigNumber.from(Math.floor(Date.now() / 1000)); // Use Math.floor to remove decimals

        // Compute active/inactive status
        let isActive =
          currentTime.gte(expectedTime) && currentTime.lt(expiryTime);
        let isExpired = currentTime.gt(expiryTime);

        if (expiryTime.eq(constants.MaxUint256)) {
          isActive = true; // Admin should always be active
          isExpired = false;
        }

        const formattedData = {
          referrer: userData[0] || "No referrer",
          currentRank: getRankName(userData[1]?.toString() || "0"),
          lastRankUpdateTime: formatTimestamp(userData[2]),
          rankExpiryTime: formatTimestamp(userData[3]),
          totalInvestment: ethers.utils.formatEther(
            userData[4]?.toString() || "0"
          ),
          isActive: isActive && !isExpired,
          isExpired: isExpired,

          // ─── 3) Use the summed rewards for the 'rewards' field ─────────────
          rewards: ethers.utils.formatEther(rewardSumBN),
        };

        //console.log("Formatted user data:::::", formattedData);
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

  // Second useEffect for pool data
  useEffect(() => {
    const fetchPoolData = async () => {
      if (!isConnected || !walletProvider || !isProviderReady) {
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

        // Fetch pool data using Promise.all
        const [totalLTGPoolData, totalRTGPoolData, totalLDPPoolData] =
          await Promise.all([
            contract.getTtlLtgDstrbtd(),
            contract.getTtlRabDstrbtd(),
            contract.getTtllvlDstrbtd(),
          ]);

        // Convert BigNumber to readable format and set the raw values as numbers
        const ltgPool = parseFloat(
          ethers.utils.formatEther(totalLTGPoolData)
        ).toFixed(0);
        const rtgPool = parseFloat(
          ethers.utils.formatEther(totalRTGPoolData)
        ).toFixed(0);
        const ldpPool = parseFloat(
          ethers.utils.formatEther(totalLDPPoolData)
        ).toFixed(0);

        // Ensure we set the values as numbers
        setTotalLTGPool(parseInt(ltgPool));
        setTotalRTGPool(parseInt(rtgPool));
        setTotalLDPPool(parseInt(ldpPool));
      } catch (error) {
        console.error("Error fetching pool data:", error);
        setTotalLTGPool(0);
        setTotalRTGPool(0);
        setTotalLDPPool(0);
      }
    };

    fetchPoolData();
  }, [isConnected, walletProvider, isProviderReady]);
  useEffect(() => {
    const animatePoolCount = (poolType: string, value: number | null) => {
      if (value === null) return;

      let currentCount = 0;
      const increment = Math.ceil(value / 800); // Adjust for smooth animation
      const interval = setInterval(() => {
        if (currentCount < value) {
          currentCount += increment;
          if (currentCount > value) {
            currentCount = value;
          }

          if (poolType === "LTG") {
            setCountLTGPool(currentCount);
          } else if (poolType === "RTG") {
            setCountRTGPool(currentCount);
          } else if (poolType === "LDP") {
            setCountLDPPool(currentCount);
          }
        } else {
          clearInterval(interval); // Stop animation when the target value is reached
        }
      }, 10); // Adjust the speed by changing this value

      return () => clearInterval(interval);
    };

    if (totalLTGPool !== null) animatePoolCount("LTG", totalLTGPool);
    if (totalRTGPool !== null) animatePoolCount("RTG", totalRTGPool);
    if (totalLDPPool !== null) animatePoolCount("LDP", totalLDPPool);
  }, [totalLTGPool, totalRTGPool, totalLDPPool]);
  // Modified useEffect for rank calculations
  useEffect(() => {
    const fetchRankData = async () => {
      if (!isConnected || !walletProvider || !isProviderReady) {
        console.log("Prerequisites not met:", {
          isConnected,
          walletProvider,
          isProviderReady,
        });
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

        // Fetch pool values with proper error handling
        const [ltgValue, rtgValue, ldpValue] = await Promise.all([
          contract
            .getTtlLtgDstrbtd()
            .then((val: ethers.BigNumberish) =>
              parseFloat(ethers.utils.formatEther(val))
            )
            .catch(() => 0),
          contract
            .getTtlRabDstrbtd()
            .then((val: ethers.BigNumberish) =>
              parseFloat(ethers.utils.formatEther(val))
            )
            .catch(() => 0),
          contract
            .getTtllvlDstrbtd()
            .then((val: ethers.BigNumberish) =>
              parseFloat(ethers.utils.formatEther(val))
            )
            .catch(() => 0),
        ]);

        const totalPool = ltgValue + rtgValue + ldpValue;
        // setTotalPoolValue(totalPool.toFixed(4));

        console.log("Pool values:", {
          ltgValue,
          rtgValue,
          ldpValue,
          totalPool,
        });

        const ranks = [
          { name: "STAR", index: 0, multiplier: 1 },
          { name: "BRONZE", index: 1, multiplier: 2 },
          { name: "SILVER", index: 2, multiplier: 3 },
          { name: "GOLD", index: 3, multiplier: 4 },
          { name: "DIAMOND", index: 4, multiplier: 5 },
          { name: "BLUE_DIAMOND", index: 5, multiplier: 6 },
          { name: "BLACK_DIAMOND", index: 6, multiplier: 7 },
          { name: "ROYAL_DIAMOND", index: 7, multiplier: 8 },
          { name: "CROWN_DIAMOND", index: 8, multiplier: 9 },
        ];

        const rankValues: { [key: string]: string } = {};
        // Fetch all rank data in parallel with proper error handling
        await Promise.all(
          ranks.map(async (rank) => {
            try {
              const rankData = await contract.rUC(rank.index);

              if (!rankData || !rankData.cnt) {
                console.warn(`No valid data for rank ${rank.name}`);
                rankValues[rank.name] = "0.0000";
                return;
              }

              const count = ethers.BigNumber.from(rankData.cnt);
              rankValues[rank.name] = (
                parseFloat(count.toString()) * totalPool
              ).toFixed(4);

              // console.log(
              //   `Rank: ${rank.name}, Count: ${count.toString()}, Total: ${
              //     rankValues[rank.name]
              //   }`
              // );
            } catch (error) {
              console.error(`Error fetching rank ${rank.name}:`, error);
              rankValues[rank.name] = "0.0000";
            }
          })
        );

        // setRankTotals(rankValues);
      } catch (error) {
        console.error("Error fetching rank data:", error);
        setError("Failed to fetch rank data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRankData();
  }, [
    isConnected,
    walletProvider,
    isProviderReady,
    contractAddress,
    contractAbi,
  ]);
  // useEffect(() => {
  //   const fetchRankData = async () => {
  //     console.log('Fetching rank data:', { isConnected, walletProvider, isProviderReady });
  //     // ... rest of the function
  //     console.log('Fetched data:', { totalPoolValue, rankTotals });
  //   };
  //   fetchRankData();
  // }, [isConnected, walletProvider, isProviderReady]);

  // useEffect(() => {
  //   const fetchLifetimeGrowthBonus = async () => {
  //     if (!isConnected || !provider) {
  //       console.warn("Wallet not connected or provider unavailable");
  //       return;
  //     }

  //     try {
  //       // Create a contract instance
  //       const signer = provider.getSigner();
  //       const contract = new ethers.Contract(
  //         contractAddress,
  //         contractAbi,
  //         signer
  //       );

  //       // Fetch the bonuses from the contract
  //       const fetchedWithdrawalBonus = await contract.getWthltgbIncm();
  //       const fetchedTotalBonus = await contract.getUsrTtlLtgrcvd();

  //       // Convert fetched data to a readable format (assuming values are in Wei)
  //       setWithdrawalBonus(ethers.utils.formatEther(fetchedWithdrawalBonus));
  //       setTotalBonus(ethers.utils.formatEther(fetchedTotalBonus));
  //     } catch (error) {
  //       console.error("Error fetching Lifetime Growth Bonus data:", error);
  //     }
  //   };

  //   fetchLifetimeGrowthBonus();
  // }, [isConnected, provider]);

  useEffect(() => {
    const fetchRankCounts = async () => {
      if (!isConnected || !walletProvider || !isProviderReady) {
        console.warn("Wallet not connected or provider not ready");
        return;
      }

      setIsLoading(true);

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

        const updatedRankCounts: Record<string, number> = {};
        await Promise.all(
          ranks.map(async (rank) => {
            try {
              const rankStatus = await contract.rUC(rank.index);
              const count = rankStatus.toNumber();
              updatedRankCounts[rank.name] = count;
              //console.log(`Rank: ${rank.name}, Count: ${count}`);
            } catch (error) {
              console.error(
                `Error fetching rank data for ${rank.name}:`,
                error
              );
              updatedRankCounts[rank.name] = 0; // Default to 0 on error
            }
          })
        );

        // setRankUserCounts(updatedRankCounts);
      } catch (error) {
        console.error("Error fetching rank counts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRankCounts();
  }, [
    isConnected,
    walletProvider,
    isProviderReady,
    contractAddress,
    contractAbi,
  ]);

  const fetchITCPrice = async () => {
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=itc&vs_currencies=usd`
      );
      if (!response.ok) {
        throw new Error(`Error fetching ITC price: ${response.statusText}`);
      }
      const data = await response.json();
      console.log("the data iss", data.itc.usd);
      setItcPrice(data.itc.usd);
    } catch (error) {
      console.error("Error fetching ITC price:", error);
      setItcPrice(null); // Reset to null on error
    }
  };

  useEffect(() => {
    fetchITCPrice();
  }, []);

  const formatNumber = (num: number): string => {
    if (num >= 1_000_000_000) {
      return (num / 1_000_000_000).toFixed(1) + "B"; // Format in billions
    } else if (num >= 1_000_000) {
      return (num / 1_000_000).toFixed(1) + "M"; // Format in millions
    } else if (num >= 1_000) {
      return (num / 1_000).toFixed(1) + "K"; // Format in thousands
    } else {
      return num.toString(); // Leave as is for smaller numbers
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const nav = document.getElementById("mobile-nav");
      const hamburger = document.getElementById("hamburger-button");

      if (
        nav &&
        !nav.contains(event.target as Node) &&
        hamburger &&
        !hamburger.contains(event.target as Node) &&
        menuOpen
      ) {
        setMenuOpen(false);
        document.body.style.overflow = "unset";
      }
    };
    console.log("menu", menuOpen);

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);

      // document.body.style.overflow = "unset";
    };
  }, [menuOpen]);

  const [rankis, setrankis] = useState<
    {
      id: number;
      name: string;
      count: string;
      pendingAmount: string;
      totalDistributedAmount: string;
    }[]
  >([]);

  useEffect(() => {
    const registerUser = async (address: string) => {
      console.log(setTotalPendingAmount);
      console.log(rankis);
      console.log(setrankis);
      try {
        const response = await axios.get(
          `https://itcback-production.up.railway.app/api/users/${address}`
        );

        // console.log("the reponse is",response);

        // Extract the relevant user data
        const user = response.data.data;
        // console.log("User data:::::::::::::", user);

        // Update the state with nickname and avatar
        setUserData({
          nickname: user.nickname,
          avatar: user.avatar,
          referralQR: user.referralQR,
        });

        const url = `https://res.cloudinary.com/dygw3ixdr/image/upload/v1737705516/qr-codes/${address}.png`;
        console.log("url is ", url);
        setQrCodeUrl(url);

        // console.log("User registered:", user);
      } catch (error) {
        if (error instanceof Error) {
          console.error("Error message:", error.message);
        } else {
          console.error("Unknown error:", error);
        }
      }
    };

    if (address) {
      registerUser(address);
    }
  });

    useEffect(() => {
      const checkRegistrationStatus = async (newAddress: string) => {
        if (!isConnected || !walletProvider || !isProviderReady || !newAddress) {
          console.warn("Wallet is not connected or provider is not ready.");
          return;
        }
    
        try {
          console.log("Checking registration status for:", newAddress);
    
          // Initialize Web3 provider and contract
          const ethersProvider = new ethers.providers.Web3Provider(walletProvider);
          const signer = ethersProvider.getSigner();
          const contract = new ethers.Contract(contractAddress, contractAbi, signer);
    
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
            externalProvider.removeListener("accountsChanged", handleAccountsChanged);
          }
        };
      }
    }, [walletProvider, address, isConnected, isProviderReady, navigate]);
    

  // useEffect(() => {
  //   console.log("Wallet Address:", address);
  //   if (address) {
  //     registerUser(address);
  //   } else {
  //     console.warn("No wallet address found");
  //   }
  // }, [address]);

  // useEffect(() => {
  //   console.log("User Data:", userData);
  // }, [userData]);

  // const stats = {
  //   employees: 78,
  //   hirings: 56,
  //   projects: 203,
  // };

  // const onboardingTasks: Task[] = [
  //   {
  //     id: 1,
  //     title: "Interview",
  //     time: "08:30",
  //     date: "Sep 13",
  //     completed: true,
  //   },
  //   {
  //     id: 2,
  //     title: "Team Meeting",
  //     time: "10:30",
  //     date: "Sep 13",
  //     completed: true,
  //   },
  //   {
  //     id: 3,
  //     title: "Project Update",
  //     time: "13:00",
  //     date: "Sep 13",
  //     completed: false,
  //   },
  //   {
  //     id: 4,
  //     title: "Discuss Q3 Goals",
  //     time: "14:45",
  //     date: "Sep 13",
  //     completed: false,
  //   },
  //   {
  //     id: 5,
  //     title: "HR Policy Review",
  //     time: "16:30",
  //     date: "Sep 13",
  //     completed: false,
  //   },
  // ];
  

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const dropdownMenu = document.getElementById("rankDropdownMenu");
      const dropdownButton = document.getElementById("rankDropdownButton");

      // Check if the click is outside the dropdown menu and button
      if (
        dropdownMenu &&
        dropdownButton &&
        !dropdownMenu.contains(event.target as Node) &&
        !dropdownButton.contains(event.target as Node)
      ) {
        setDropdownOpen(false); // Close the dropdown
      }
    };

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      // Cleanup the event listener on unmount
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  const closeToastManually = () => {
    toast.dismiss();
  };

  return (
    <>
    {!isConnected ? (
        navigate("/")
      ) : (
        <div> 
      <ToastContainer
        onClick={closeToastManually}
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
      />
      <div className="w-full min-h-screen custom-gradient p-2 sm:p-4 md:p-6 font-poppins space-y-4 sm:space-y-8">
        {showConfetti && <Confetti width={width} height={height} />}
        {/* Navbar */}

        {/* Header */}
        <br />

        {/* Stats Section */}

        {/* Employee Stats */}

        {/* Task Progress Section */}

        <div
          className="flex flex-col md:flex-row justify-between items-center gap-6 md:gap-8 -mt-2"
          style={{
            marginTop: "0rem", // Adjust your desired margin value here
          }}
        >
          {/* Global User Count */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 text-center md:text-left">
            <h2 className="text-base font-semibold text-gray-800 whitespace-nowrap">
              Global User Count 🌍
            </h2>
            <p className="text-lg text-black font-bold">
              {usrCnt !== null ? count : "Loading..."}+
            </p>
          </div>

          {/* Statistics */}
          <div className="flex flex-wrap gap-4 justify-center md:justify-end items-center w-full md:w-auto">
            {/* LTG Pool */}
            <div className="flex flex-col items-center text-center space-y-2">
              <svg
                className="w-6 h-6 text-gray-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <div>
                <div className="text-2xl font-semibold text-gray-800">
                  {isConnected ? formatNumber(countLTGPool) : "0"}+
                </div>
                <div className="text-sm text-gray-500">LTGB</div>
              </div>
            </div>

            {/* RAB Pool */}
            <div className="flex flex-col items-center text-center space-y-2">
              <svg
                className="w-6 h-6 text-gray-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0M3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
              <div>
                <div className="text-2xl font-semibold text-gray-800">
                  {isConnected ? formatNumber(countRTGPool) : "0"}+
                </div>
                <div className="text-sm text-gray-500">RAB</div>
              </div>
            </div>

            {/* LDP Pool */}
            <div className="flex flex-col items-center text-center space-y-2">
              <svg
                className="w-6 h-6 text-gray-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
              <div>
                <div className="text-2xl font-semibold text-gray-800">
                  {isConnected ? formatNumber(countLDPPool) : "0"}+
                </div>
                <div className="text-sm text-gray-500">LB</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-6 gap-4 w-full">
          {/* Profile Card */}
          {/* Profile Card */}
          <div className="col-span-1 lg:col-span-4 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4  gap-4 w-full">
              <div className="relative flex items-center  justify-center  overflow-hidden   rounded-full border p-8 shadow-sm min-h-[220px] sm:h-[20rem] lg:h-full md:h-full">
                {/* Background Image */}
                <div className="absolute w-full inset-0 h-full">
                  <img
                    src={`data:image/svg+xml;utf8,${encodeURIComponent(
                      avatarSVG
                    )}`}
                    alt="Background"
                    className="w-full h-full object-cover"
                  />
                  {/* Darker gradient overlay for better text visibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-black/20 " />
                </div>
                {/* Content */}
                <div className="absolute bottom-0 flex justify-center -mb-3 p-6 w-full">
                  <div className="space-y-2">
                    <div className="flex items-center justify-center">
                      <h3 className="text-2xl  font-semibold text-white">
                        {userData?.nickname || "Unknown User"}{" "}
                        {/* Use dynamic nickname */}
                      </h3>
                      <Edit2
                        className="text-white ml-2 w-3 h-53cursor-pointer hover:text-gray-300"
                        onClick={() => setShowNicknameModal(true)}
                        aria-label="Edit Nickname"
                      />
                    </div>

                    {/* Added background and padding for better address visibility */}
                    <div className="flex justify-center bg-black/40 px-3 py-1 rounded-full">
                      <p className="text-sm font-medium text-white">
                        {address
                          ? `${address.slice(0, 6)}...${address.slice(-4)}`
                          : "No wallet connected"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              {showNicknameModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                  <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
                    <h2 className="text-xl font-semibold mb-4">
                      Update Nickname
                    </h2>

                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      New Nickname
                    </label>
                    <input
                      type="text"
                      className="w-full truncate px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={newNickname}
                      onChange={(e) => {
                        const inputValue = e.target.value;
                        if (inputValue.length <= 8) {
                          setNewNickname(inputValue);
                        }
                      }}
                      maxLength={8}
                    />

                    <div className="flex items-center justify-end space-x-2 mt-4">
                      <button
                        onClick={() => setShowNicknameModal(false)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleUpdateNickname}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Update
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* First Progress Card */}

              {/* Level Distribution Pool Card */}
              <div className="rounded-3xl border p-7 shadow-sm   bg-gradient-to-br from-white via-white to-yellow-50 flex flex-col justify-between">
                <h3 className="text-base font-semibold mb-6">Level Bonus</h3>

                {!isConnected ? (
                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-600">
                      Connect wallet to view bonus details
                    </p>
                  </div>
                ) : isLoadingLevel ? (
                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-600">Loading provider...</p>
                  </div>
                ) : (
                  <div className="mt-4 space-y-3">
                    <div>
                      <span className="text-sm text-gray-600">
                        Withdrawal Level Bonus:
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-bold text-gray-900">
                          {withdrawalLevel}
                        </span>
                      </div>
                      <button
                        onClick={handleWithdrawLevel}
                        className="px-2 py-1 bg-yellow-100 text-black border border-gray-400 rounded-md hover:bg-yellow-400 disabled:opacity-50 transform transition-transform duration-300 active:scale-90"
                      >
                        Withdrawal
                      </button>
                    </div>

                    <div>
                      <span className="text-sm text-gray-600">
                        Total Level:
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-bold text-gray-900">
                          {totalLevel}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div
                  className=" bg-gray-100"
                  // style={{ marginTop: "1rem" }}
                ></div>

                <div className="relative text-xs text-gray-500 mt-auto">
                  Last updated: {new Date().toLocaleTimeString()}
                </div>
              </div>

              {/* Second Progress Card */}
              <div className="rounded-3xl border p-7 shadow-sm  bg-gradient-to-br from-white via-white to-yellow-50 flex flex-col justify-between">
                <div className="mb-6">
                  <h3 className="text-base font-semibold">
                    Rank Achievement Bonus
                  </h3>

                  {!isConnected ? (
                    <div className="mt-4 text-center">
                      <p className="text-sm text-gray-600">
                        Connect wallet to view bonus details
                      </p>
                    </div>
                  ) : isLoadingRab ? (
                    <div className="mt-4 text-center">
                      <p className="text-sm text-gray-600">
                        Loading provider...
                      </p>
                    </div>
                  ) : (
                    <div className="mt-4 space-y-3">
                      <div>
                        <span className="text-sm text-gray-600">
                          Withdrawal RAB:
                        </span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl font-bold text-gray-900">
                            {withdrawalRAB === "Loading..." ? (
                              <span className="text-gray-400">Loading...</span>
                            ) : withdrawalRAB === "Error" ? (
                              <span className="text-red-500">
                                Error loading data
                              </span>
                            ) : (
                              withdrawalRAB
                            )}
                          </span>
                        </div>
                        <button
                          onClick={handleWithdrawRab}
                          className="px-2 py-1 bg-yellow-100 text-black border border-gray-400 rounded-md hover:bg-yellow-400 disabled:opacity-50 transform transition-transform duration-300 active:scale-90"
                        >
                          Withdrawal
                        </button>
                      </div>

                      <div>
                        <span className="text-sm text-gray-600">
                          Total RAB:
                        </span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl font-bold text-gray-900">
                            {totalRAB === "Loading..." ? (
                              <span className="text-gray-400">Loading...</span>
                            ) : totalRAB === "Error" ? (
                              <span className="text-red-500">
                                Error loading data
                              </span>
                            ) : (
                              totalRAB
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div
                  className="  bg-gray-100"
                  // style={{ marginTop: "1rem" }}
                ></div>

                <div className="relative text-xs text-gray-500 mt-auto ">
                  Last updated: {new Date().toLocaleTimeString()}
                </div>
              </div>

              {/* Timer Card */}
              {/* Progress Card */}
              <div className="rounded-3xl p-6 border shadow-sm  bg-gradient-to-br from-white via-white to-yellow-50 flex flex-col justify-between">
                <div>
                  <div className="mb-6">
                    <h3 className="text-base font-medium text-gray-900">
                      Lifetime Growth Bonus
                    </h3>

                    {!isConnected ? (
                      <div className="mt-4 text-center">
                        <p className="text-sm text-gray-600">
                          Connect wallet to view bonus details
                        </p>
                      </div>
                    ) : isLoading ? (
                      <div className="mt-4 text-center">
                        <p className="text-sm text-gray-600">
                          Loading provider...
                        </p>
                      </div>
                    ) : (
                      <div className="mt-10 space-y-3">
                        <div>
                          <span className="text-sm text-gray-600">
                            On Hold Bonus:
                            <div className="relative group inline-block left-2">
                              {/* Circle */}
                              <div className="w-4 h-4 text-red-500 flex items-center border border-red-500 justify-center rounded-full text-[0.5rem] font-medium cursor-pointer">
                                i
                              </div>

                              {/* Tooltip */}
                              <div className="absolute bottom-full right-0 transform translate-y-2 px-2 max-w-[80vw] sm:max-w-xs md:max-w-sm lg:max-w-md bg-gradient-to-r from-yellow-200 to-yellow-400 text-slate-600 text-xs sm:text-sm md:text-base rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 shadow-lg shadow-gray-500 overflow-hidden whitespace-normal">
                                <div className="relative w-full">
                                  {/* Tooltip Arrow */}
                                  <div className="absolute left-1/2 transform -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 md:border-l-6 md:border-r-6 border-t-4 md:border-t-6 border-transparent border-t-yellow-300"></div>
                                  {/* Tooltip Text */}
                                  <p className="text-center leading-tight sm:leading-normal md:leading-relaxed">
                                    After each two referrals, the amount will
                                    directly transfer to your wallet.
                                  </p>
                                </div>
                              </div>
                            </div>
                          </span>
                          <div className="flex items-baseline gap-1">
                            <span className="text-xl font-bold text-gray-900">
                              {withdrawalBonus === "Loading..." ? (
                                <span className="text-gray-400">
                                  Loading...
                                </span>
                              ) : withdrawalBonus === "Error" ? (
                                <span className="text-red-500">
                                  Error loading data
                                </span>
                              ) : (
                                totalPendingAmount
                              )}
                            </span>
                          </div>
                        </div>

                        <div>
                          <span className="text-sm text-gray-600">
                            Total Bonus:
                          </span>
                          <div className="flex items-baseline gap-1">
                            <span className="text-xl font-bold text-gray-900">
                              {totalBonus === "Loading..." ? (
                                <span className="text-gray-400">
                                  Loading...
                                </span>
                              ) : totalBonus === "Error" ? (
                                <span className="text-red-500">
                                  Error loading data
                                </span>
                              ) : (
                                totalBonus
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Last Updated Section (Pushed to the Bottom) */}
                <div className="text-xs text-gray-500 mt-auto">
                  Last updated: {new Date().toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>
          <div className="col-span-1 lg:col-span-2 md:grid-cols-1 w-full ">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 w-full md:min-h-2  ">
              {/* Total Bonus Card */}
              <div className=" rounded-3xl  border  lg:p-8 p-6 md:p-5    shadow-sm     bg-gradient-to-br from-white via-white to-yellow-50">
                <h3 className="text-base font-semibold mb-6 text-center">
                  Global Bonus
                </h3>
                <div className="flex flex-col items-center">
                  <span className="text-5xl mb-6">🏛️</span>
                  <div className="text-xl font-bold mb-3">
                    {isConnected ? totalInvestment : "0"}
                  </div>
                  <p className="text-sm">Total Earnings</p>
                </div>
              </div>
              <div className="rounded-3xl  border  lg:p-8 p-6  md:p-5   shadow-sm  bg-gradient-to-br from-white via-white to-yellow-50">
                <h3 className="text-base font-semibold mb-6 text-center">
                  Award & reward
                </h3>
                <div className="flex flex-col items-center">
                  <span className="text-5xl mb-6">📊</span>
                  <div className="text-2xl font-bold mb-3">
                    {isConnected ? (
                      isLoadingARB ? (
                        <p className="text-gray-600">
                          Loading ARB Pool Balance...
                        </p>
                      ) : (
                        <div className="text-center">
                          <span className="text-sm text-gray-600">
                            Pool Balance:
                          </span>
                          <div className="text-xl font-bold mb-3">
                            {parseFloat(arbPoolBalance).toFixed(2)}
                          </div>
                          <button
                            onClick={handleWithdrawARBPoolBalance}
                            className="px-3 py-1   bg-yellow-100 text-black border border-gray-400 rounded-md hover:bg-yellow-400 disabled:opacity-50 transform transition-transform duration-300 active:scale-90 text-sm"
                            disabled={isLoadingARB}
                          >
                            {isLoadingARB ? "Processing..." : "Withdraw"}
                          </button>
                        </div>
                      )
                    ) : (
                      <p className="text-sm text-gray-600">
                        Connect wallet to view details
                      </p>
                    )}
                  </div>
                  {errorARB && (
                    <div className="mt-4 text-sm text-red-500 text-center">
                      {errorARB}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ... (previous code until the grid section) ... */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6  ">
          {/* Left Menu Card - Made narrower */}
          <div className="md:col-span-3 bg-gradient-to-br from-white via-white to-yellow-50 rounded-2xl p-4 shadow-sm overflow-y-hidden">
            <div className="text-center mb-4">
              <h4 className="text-lg font-semibold text-gray-700">
                User details
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-4">
              <div className="bg-white/70 rounded-xl p-4 hover:bg-white/90 transition-all duration-200">
                <h4 className="text-sm font-medium text-gray-600">Referrer:</h4>
                <p className="text-sm font-mono bg-yellow-50/50 px-2 py-1 rounded-lg mt-2 overflow-hidden text-ellipsis">
                  {userDetails?.referrer?.slice(0, 6)}...
                  {userDetails?.referrer?.slice(-4)}
                </p>
              </div>

              <div className="bg-white/70 rounded-xl p-4 hover:bg-white/90 transition-all duration-200">
                <h4 className="text-sm font-medium text-gray-600">
                  Current Rank:
                </h4>
                <div className="mt-1">
                  <span className=" lg:px-1  lg:-ml-75 py-0.5 bg-violet-500 text-white text-xs rounded-full whitespace-nowrap  md:-ml-2 md:-mb-2 md:px-2 sm:px-2">
                    {userDetails?.currentRank || "N/A"}
                  </span>
                </div>
              </div>

              <div className="bg-white/70 rounded-xl p-3 hover:bg-white/90 transition-all duration-200">
                <h4 className="text-sm font-medium text-gray-600">
                  Last Rank Update:
                </h4>
                <p className="text-sm mt-1 truncate">
                  {userDetails?.lastRankUpdateTime || "N/A"}
                </p>
              </div>

              <div className="bg-white/70 rounded-xl p-3 hover:bg-white/90 transition-all duration-200 relative">
                <h4 className="text-sm font-medium text-gray-600">
                  Rank Expiry:
                </h4>
                <p className="text-sm mt-1">Never</p>
              </div>

              <div className="bg-white/70 rounded-xl p-3 hover:bg-white/90 transition-all duration-200">
                <h4 className="text-sm font-medium text-gray-600">
                  Total Purchase:
                </h4>
                <p className="text-sm font-mono mt-1">
                  {Number(userDetails?.totalInvestment).toFixed(2) || "0.00"}
                </p>
              </div>

              <div className="bg-white/70 rounded-xl p-3 hover:bg-white/90 transition-all duration-200">
                <h4 className="text-sm font-medium text-gray-600">Status:</h4>
                <span
                  className={`mt-1 inline-block px-2 py-0.5 rounded-full text-sm ${"bg-green-100 text-green-700"}`}
                >
                  {"Active"}
                </span>
              </div>

              <div className="bg-white/70 rounded-xl p-3 hover:bg-white/90 transition-all duration-200 sm:col-span-2 md:col-span-2 lg:col-span-2">
                <h4 className="text-sm font-medium text-gray-600">Rewards:</h4>
                <p className="text-sm font-mono mt-1">
                  {Number(userDetails?.rewards).toFixed(2) || "0.00"}
                </p>
              </div>
            </div>
          </div>

          {/* Right Calendar Card - Made wider */}
          <div className="md:col-span-9 rounded-3xl p-6 bg-gradient-to-br from-white via-white to-yellow-50 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex justify-center items-center mb-6">
              <span className="font-bold text-lg bg-gradient-to-r from-black to-yellow-800 bg-clip-text text-transparent">
                Global Ranks Progression
              </span>
            </div>
            <div className="h-80">
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
                          size: 12,
                        },
                        color: "#4b5563",
                        padding: 8,
                      },
                      title: {
                        display: true,
                        text: "Number of Users",
                        font: {
                          size: 14,

                          family: "'Inter', sans-serif",
                        },
                        color: "#374151",
                        padding: 16,
                      },
                      grid: {
                        color: "rgba(219, 234, 254, 0.4)",
                        lineWidth: 1,
                      },
                    },
                    x: {
                      grid: {
                        display: false,
                      },
                      ticks: {
                        autoSkip: true,
                        maxRotation: 30,
                        minRotation: 0,
                        font: {
                          size: 10, // Adjust font size for smaller screens
                        },

                        color: "#4b5563",
                        padding: 6,
                      },
                    },
                  },
                  plugins: {
                    legend: {
                      display: false,
                    },
                    tooltip: {
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      titleColor: "#1e293b",

                      bodyColor: "#334155",

                      borderColor: "#e2e8f0",
                      borderWidth: 1,
                      padding: 12,
                      cornerRadius: 12,
                      titleSpacing: 8,
                      bodySpacing: 8,
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
                      backgroundColor: "rgba(99, 102, 241, 0.8)",
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: "rgba(255, 255, 255, 0.4)",
                      hoverBackgroundColor: "rgba(79, 70, 229, 1)",
                      hoverBorderColor: "white",
                      hoverBorderWidth: 2,
                    },
                  },
                  hover: {
                    mode: "index",
                    intersect: false,
                  },
                }}
              />
            </div>
          </div>
        </div>
        {/* Global Pool */}

        {/* <div className="text-black p-6 rounded-2xl border border-black">
            <div>Global Pool</div>
            <br />
            {!isConnected ? (
              <div className="text-center text-gray-500">
                Wallet not connected. Unable to display pool data.
              </div>
            ) : isLoading ? (
              <div className="text-center text-gray-500">
                Loading pool data...
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center text-gray-400 mb-2">
                  <span className="text-black">Total Pool</span>
                  <span className="text-pink-500">{totalPoolValue}</span>
                </div>
                {Object.entries(rankUserCounts)
                  .filter(([rank]) =>
                    [
                      "DIAMOND",
                      "BLUE_DIAMOND",
                      "BLACK_DIAMOND",
                      "ROYAL_DIAMOND",
                      "CROWN_DIAMOND",
                    ].includes(rank)
                  )
                  .map(([rank, count]) => (
                    <div
                      key={rank}
                      className="flex justify-between items-center"
                    >
                      <div>
                        <div className="text-black">{rank}</div>
                        <div className="text-sm text-black">
                          {count} x {totalPoolValue}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div> */}

        {/* Estimated ITCs & Points */}

        {/* Elite Earnings */}

        {/* Left Column */}
        <div className="w-full p-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-1 animate-fade-left">
            <div className="flex flex-col sm:flex-row w-full gap-4 sm:gap-6">
              {/* Referral Link Section */}
              <div className="text-black p-4 rounded-[1.5rem] border bg-gradient-to-br from-white via-yellow-50 to-yellow-50 shadow-lg hover:shadow-xl transition-shadow duration-300 w-full lg:w-[50%]">
                <h3 className="text-black text-base md:text-lg mb-4">
                  Referral Link
                </h3>
                <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
                  <img
                    src={userData?.referralQR}
                    alt="QR Code"
                    className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 border border-gray-200 rounded-lg flex-shrink-0 mx-auto md:mx-0"
                  />
                  <div className="flex flex-col gap-2 w-full">
                    <div className="flex flex-col md:flex-row items-center md:gap-2">
                      <input
                        className="text-sm bg-gray-100 border border-gray-300 rounded-md px-2 py-1 w-full truncate"
                        value={inviteLink}
                        readOnly
                      />
                      <button
                        onClick={copyToClipboard}
                        className="px-3 py-1 bg-yellow-500 text-white rounded-md text-sm flex items-center justify-center mt-2 md:mt-0"
                      >
                        {isCopied ? (
                          <CheckCheck className="w-4 h-4" /> // Show check mark when copied
                        ) : (
                          <Copy className="w-4 h-4" /> // Show copy icon when not copied
                        )}
                      </button>
                    </div>
                    <p className="text-gray-400 text-xs md:text-sm text-center md:text-left">
                      Use referral link to build community
                    </p>
                  </div>
                </div>
              </div>

              {/* Rank Update Section */}
              <div className="text-black p-4 rounded-[1.5rem] bg-gradient-to-br from-white via-yellow-50 to-yellow-50 shadow-lg hover:shadow-xl transition-shadow duration-300 w-full sm:h-auto lg:h-[auto]">
                <div className="flex justify-between items-center mb-4">
                  {/* Rank Update Heading */}
                  <h3 className="text-black text-lg sm:text-xl lg:text-2xl font-semibold">
                    Rank Upgrade
                  </h3>

                  {/* Display Current Rank */}
                  <div className="flex flex-col items-center sm:items-start sm:w-auto">
                    <h4 className="text-sm font-medium text-gray-600">
                      Current Rank:
                    </h4>
                    <span className="mt-1 inline-block px-3 py-1 bg-violet-500 text-white text-sm rounded-full">
                      {userDetails?.currentRank || "Loading..."}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                  {/* Dropdown for ranks */}
                  <div className="relative max-w-full w-full">
                    <button
                      id="rankDropdownButton"
                      className="px-6 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 text-gray-700 border border-gray-200 rounded-lg hover:shadow-md hover:from-blue-100 hover:to-indigo-100 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-200 flex items-center justify-between gap-2 w-full"
                      onClick={() => setDropdownOpen((prev) => !prev)}
                    >
                      <span className="font-medium">
                        {selectedRank || "Select your rank"}
                      </span>
                      <svg
                        className={`w-4 h-4 transition-transform duration-200 ${
                          dropdownOpen ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                    {dropdownOpen && (
                      <div
                        id="rankDropdownMenu"
                        className="absolute bottom-full mb-2 left-0 w-full bg-gradient-to-t from-yellow-50 to-white bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto z-10 backdrop-blur-sm bg-white/95"
                      >
                        {filteredRanks.map((rank, index) => {
                          console.log("ITC Price:", itcPrice);
                          const currentRankDetail = rankDetails.find(
                            (detail) =>
                              detail.name === userDetails?.currentRank &&
                              detail.rankUpgradePriceUSD !== undefined // Ensure this field exists
                          );

                          const targetRankDetail = rankDetails.find(
                            (detail) =>
                              detail.name === rank.name &&
                              detail.rankUpgradePriceUSD !== undefined // Ensure this field exists
                          );

                          const priceDifferenceUSD =
                            currentRankDetail && targetRankDetail
                              ? parseFloat(
                                  targetRankDetail.rankUpgradePriceUSD
                                ) -
                                parseFloat(
                                  currentRankDetail.rankUpgradePriceUSD
                                )
                              : 0;

                          const priceDifferenceITC =
                            priceDifferenceUSD && itcPrice
                              ? (priceDifferenceUSD / itcPrice).toFixed(4)
                              : "Loading...";

                          console.log("Rank Details:", rankDetails);
                          console.log(
                            "Current Rank Detail:",
                            currentRankDetail
                          );
                          console.log("Target Rank Detail:", targetRankDetail);
                          console.log(
                            "Price Difference USD:",
                            priceDifferenceUSD
                          );
                          console.log(
                            "Price Difference ITC:",
                            priceDifferenceITC
                          );

                          return (
                            <div
                              key={index}
                              className="group px-6 py-4 flex flex-col gap-2 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 cursor-pointer border-b border-gray-100 last:border-b-0 transition-all duration-200 rounded-lg mx-2 my-1"
                              onClick={() => {
                                setSelectedRank(rank.name);
                                setDropdownOpen(false);
                              }}
                            >
                              <span className="font-semibold text-gray-800 group-hover:text-blue-600 text-lg">
                                {rank.name}
                              </span>
                              <div className="flex justify-between items-center text-sm text-gray-600 group-hover:text-gray-800">
                                <span>Upgrade Price:</span>
                                <span className="font-medium">
                                  ${priceDifferenceUSD.toFixed(2)} USD
                                </span>
                              </div>
                              <div className="flex justify-between items-center text-sm text-gray-600 group-hover:text-gray-800">
                                <span>Price in ITC:</span>
                                <span className="font-medium">
                                  {priceDifferenceITC} ITC
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Input for rank update */}
                  {/* <div className="flex-grow">
          <input
            type="text"
            placeholder="Please enter number of coins"
            className="w-full text-black bg-transparent p-3 rounded-2xl border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div> */}
                  <button
                    onClick={upgradeRank}
                    disabled={
                      !selectedRank ||
                      !userDetails ||
                      (parseFloat(userDetails.rewards || "0") <
                        selectedRankPriceUSD &&
                        parseFloat(userDetails.rewards || "0") <
                          selectedRankPriceITC)
                    }
                    className={`px-6 py-3 rounded-md w-full sm:w-auto lg:w-[12rem] transition-all duration-200 ${
                      selectedRank &&
                      (parseFloat(userDetails?.rewards || "0") >=
                        selectedRankPriceUSD ||
                        parseFloat(userDetails?.rewards || "0") >=
                          selectedRankPriceITC)
                        ? "bg-yellow-500 text-white hover:bg-yellow-600"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    Upgrade
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-black mt-5  animate-fade-left">
          <div className="text-black overflow-hidden">
            <div className=" text-black">
              <TickerRow
                label="CRYPTO"
                items={cryptoData}
                tickerType="crypto"
              />
              {/* <TickerRow label="FOREX" items={forexData} tickerType="forex" /> */}
            </div>
          </div>
        </div>
      </div>
      </div>
      )}
    </>
  );
};

export default Dashboard;
