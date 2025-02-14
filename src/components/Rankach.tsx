import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import "simplebar/dist/simplebar.min.css";
import multiavatar from "@multiavatar/multiavatar";
import { Loader2 } from 'lucide-react';
import {
  useWeb3ModalAccount,
  useWeb3ModalProvider,
} from "@web3modal/ethers5/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

import contractAbi from "./Props/contractAbi.ts";

import contractAddress from "./Props/contractAddress.ts";
import axios from "axios";
import { useNavigate } from "react-router-dom";
//import { useDarkMode } from "../components/DarkModeContext";
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
} from "lucide-react";

import rank4 from "../assets/rank4.png";
import rank5 from "../assets/rank5.png";
import rank6 from "../assets/rank6.png";
import rank7 from "../assets/rank7.png";
import rank8 from "../assets/rank8.png";

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

// interface RankDetail {
//   id: number;
//   name: string;
//   count: string;
//   pendingAmount: string;
//   totalDistributedAmount: string;
// }

interface AddressData {
  rank: string;
  list: Array<{
    address: string;
    avatar: string;
  }>;
}

const ADMIN_ADDRESSES = [
  "0x978ef2f8e2bb491adf7358be7ffb527e7bd47312",
  "0x3e582a9ffd780a4dfc8aab220a644596772b919e",
];

const RANKS = [
  { name: "DIAMOND", index: 4, image: rank4 },
  { name: "BLUE_DIAMOND", index: 5, image: rank5 },
  { name: "BLACK_DIAMOND", index: 6, image: rank6 },
  { name: "ROYAL_DIAMOND", index: 7, image: rank7 },
  { name: "CROWN_DIAMOND", index: 8, image: rank8 },
];
const Rankach: React.FC = () => {
  
  const navigate = useNavigate();
  const { address, isConnected } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();
  const [isProviderReady, setIsProviderReady] = useState(false);

  //const { address, isConnected } = useWeb3ModalAccount();
  // State variables
  const [maxPayouts, setMaxPayouts] = useState<{ [key: string]: string }>({});
  const [rankshare, setRankshare] = useState<string>("Loading...");
  //const [rankDetails, setRankDetails] = useState<RankDetail[]>([]);
  const [addresses, setAddresses] = useState<AddressData[]>([]);
  const [currentmonth, setcurrentmonth] = useState<string>("Loading...");
  const [totalRab, setTotalRab] = useState<string>("Loading...");
  const [monthlyRab, setMonthlyRab] = useState<string>("Loading...");
  const [monthlyindex, setMonthlyRabindex] = useState<string>("Loading...");
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [remainingPayouts, setRemainingPayouts] = useState<{
    [key: string]: string;
  }>({});
  const [rankData, setRankData] = useState<RankData[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [remainingTime, setRemainingTime] = useState<string>("Loading...");
  const [Elgibility, setElgibility] = useState<string | boolean>("Loading...");
  const [error, setError] = useState<string | null>(null);
 // const [loading, setLoading] = useState<boolean>(false);
  const [currentMonthIndex, setCurrentMonthIndex] = useState<number>(0);
  const [userRank, setUserRank] = useState<string | null>(null);
  const [rankrem, setRemDetails] = useState({
    currentRank: 0,
    startMonth: 0,
    remainingPayouts: 0,
    isEligible: 0,
  });
  const [totalAmountAllocated, setTotalAmountAllocated] =
    useState<string>("Loading...");
  const [loadingGraph, setLoadingGraph] = useState(true);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [isExpired, setIsExpired] = useState(false);
  const [avatarSVG, setAvatarSVG] = useState<string>("");
  const [copiedState, setCopiedState] = useState<{ [key: string]: boolean }>(
    {}
  );

  // Helper functions
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

  const getRankIndex = (rankName: string): number => {
    const ranks: { [key: string]: number } = {
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

  // useEffects
  useEffect(() => {
    console.log(getDisplayMonth(2))
    setIsProviderReady(!!walletProvider);
  }, [walletProvider]);

  useEffect(() => {

    console.log(currentmonth,monthlyindex,error,rankrem,loadingAddresses,avatarSVG,copiedState,setCopiedState)
    const checkAdminAndFetchUserData = async () => {
      if (!isConnected || !walletProvider || !address) {
        console.warn("Wallet not connected or provider not available.");
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

        const normalizedAddress = address.toLowerCase();
        const isAdmin = ADMIN_ADDRESSES.includes(normalizedAddress);

        if (isAdmin) {
          console.log("Admin detected - setting payouts to MAX");
          return;
        }

        
        const userData = await contract.users(address);
        
        console.log("the curr is",getRankName(userData[0]?.toString() || "0"),)

        const formattedData: UserDetails = {
          referrer: userData[2] || "No referrer",
          currentRank: getRankName(userData[0]?.toString() || "0"),
          lastRankUpdateTime:
          userData.lastRankUpdateTime?.toNumber() > 0
              ? new Date(userData.lastRankUpdateTime.toNumber() * 1000).toLocaleDateString()
              : "Not updated",
          rankExpiryTime:
          userData.rankExpiryTime?.toNumber() > 0
              ? new Date( userData.rankExpiryTime.toNumber() * 1000).toLocaleDateString()
              : "Not set",
          totalInvestment: ethers.utils.formatEther(
            userData[5]?.toString() || "0"
          ),
          isActive: userData[1] || false,
          rewards: Array.isArray(userData[6])
            ? ethers.utils.formatEther(userData[6][0]?.toString() || "0")
            : "0",
        };

        console.log("the index is",getRankIndex(formattedData.currentRank))

        setUserDetails(formattedData);
        setError(null);

      

        const rankIndex = getRankIndex(formattedData.currentRank);
        if (rankIndex !== -1) {
          maxPyts(rankIndex);
          rabShrPrsntg(rankIndex);
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
        setError(
          `No Eligible Users of ${
            userDetails?.currentRank || "NA"
          } Rank This Month.`
        );
        setUserDetails(defaultUserDetails);
      }
    };

    checkAdminAndFetchUserData();
  }, [isConnected, walletProvider, address]);

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

  const defaultUserDetails: UserDetails = {
    referrer: "Not Available",
    currentRank: "Loading..",
    lastRankUpdateTime: "Not Available",
    rankExpiryTime: "Not Available",
    totalInvestment: "0",
    isActive: false,
    rewards: "0",
  };

  useEffect(() => {
    const fetchRankDetails = async () => {
      if (!isConnected || !walletProvider || !address) {
        console.warn("⚠️ Wallet not connected yet. Waiting...");
        return;
      }

      try {
        setElgibility("loading..");
        const ethersProvider = new ethers.providers.Web3Provider(
          walletProvider
        );
        const signer = ethersProvider.getSigner();
        const contract = new ethers.Contract(
          contractAddress,
          contractAbi,
          signer
        );

        const userData = await contract.users(address);
        const currentRank = parseInt(userData[0].toString());
        const rankDuration = await contract.userRankDurations(
          address,
          currentRank
        );

        const startMonth = rankDuration.startMonth.toString();
        const remainingPayouts = rankDuration.remainingPayouts.toString();

        setElgibility(rankDuration.isActive);

        const isEligible = Number(startMonth) + 1;

        setRemDetails({
          currentRank,
          startMonth,
          remainingPayouts,
          isEligible,
        });
      } catch (error) {
        console.error("Error fetching rank details:", error);
        setElgibility("loading");
      }
    };

    fetchRankDetails();
  }, [isConnected, walletProvider, address]);



  const fetchUserDetails = async (
    address: string
  ): Promise<{ avatar: string; nickname: string }> => {
    try {
      const response = await axios.get(
        `https://server.cryptomx.site/api/users/${address}`
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

  const fetchCurrentMonthIndex = async () => {
    if (!walletProvider) {
      console.error("Wallet provider not available");
      return;
    }

    try {
      const ethersProvider = new ethers.providers.Web3Provider(walletProvider);
      const contract = new ethers.Contract(
        contractAddress,
        contractAbi,
        ethersProvider
      );

      const currentMonth = await contract.currentMonthIndex();
      console.log("the current month is",currentMonth.toNumber());
      setCurrentMonthIndex(currentMonth.toNumber() + 1);
    } catch (error) {
      console.error("Error fetching current month index:", error);
    }
  };

  useEffect(() => {
    if (!monthlyRab || !rankshare || !userRank || rankData.length === 0) {
      setTotalAmountAllocated("Loading...");
      return;
    }
    if (!Elgibility) {
      setTotalAmountAllocated("No Total Amount");
      return;
    }

    try {
      const monthlyRabValue = parseFloat(monthlyRab);

      const rankPercentages: Record<number, number> = {
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
  }, [monthlyRab, rankshare, userRank, rankData, remainingPayouts]);

  const fetchUserRank = async () => {
    if (!walletProvider || !address) {
      console.error("Wallet provider or user address not available");
      return;
    }

    try {
      const ethersProvider = new ethers.providers.Web3Provider(walletProvider);
      const contract = new ethers.Contract(
        contractAddress,
        contractAbi,
        ethersProvider
      );

      const userData = await contract.users(address);
      const userRankIndex = userData[0]?.toString();
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

      setUserRank(ranks[parseInt(userRankIndex)] || "Unknown Rank");
    } catch (error) {
      console.error("Error fetching user rank:", error);
      setUserRank(null);
    }
  };

  const [rankAddresses, setRankAddresses] = useState<
    Record<string, UserAddress[]>
  >({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllRankAddresses = async () => {
      if (!walletProvider) {
        setError("Wallet provider not available");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const ethersProvider = new ethers.providers.Web3Provider(
          walletProvider
        );
        const contract = new ethers.Contract(
          contractAddress,
          contractAbi,
          ethersProvider
        );

        const addresses: Record<string, UserAddress[]> = {};

        for (const rank of eliteRanks) {
          const rankAddressesList: UserAddress[] = [];
          let addressIndex = 0;

          while (true) {
            try {

              console.log("the current mon is",currentMonthIndex);
              console.log("the rank.id is", rank.id);
              console.log("the address index is",addressIndex);
              const userAddress = await contract.monthlyEligibleAddresses(
                currentMonthIndex,
                rank.id,
                addressIndex
              );

              console.log("the mon is",userAddress);

              if (!userAddress) break;

              // Optional: Fetch additional user details if needed
              const userDetails = {
                address: userAddress,
                nickname: "", // You can fetch nickname if available
                avatar: multiavatar(userAddress),
              };
              console.log("running");

              rankAddressesList.push(userDetails);

              console.log("heheheh")
              addressIndex++;
              
            } catch (addressError) {
              console.error(
                `Error fetching address for ${rank.name}:`,
                addressError
              );
              break;
            }
          }

          addresses[rank.name] = rankAddressesList;
        }

        setRankAddresses(addresses);
        setIsLoading(false);
      } catch (fetchError) {
        console.error("Error fetching eligible addresses:", fetchError);
        setError("Failed to fetch eligible addresses");
        setIsLoading(false);
      }
    };

    fetchAllRankAddresses();
  }, [walletProvider, currentMonthIndex]);

  useEffect(() => {
    if (isConnected && walletProvider) {
      fetchCurrentMonthIndex();
      fetchUserRank();
    }
  }, [isConnected, walletProvider, address]);

  const fetchDataForRanks = async (monthIndex: number) => {
    if (!walletProvider) {
      console.error("Wallet provider is not available");
      return;
    }

    console.log("Fetching rank distribution data...");
    setLoadingGraph(true);

    const provider = new ethers.providers.Web3Provider(walletProvider);
    const contract = new ethers.Contract(
      contractAddress,
      contractAbi,
      provider
    );

    const data: Record<number, number> = {}; // Initialize properly

    try {
      for (let rank of RANKS) {
        let count = 0;
        let addressIndex = 0;

        while (true) {
          try {
            const userAddress = await contract.monthlyEligibleAddresses(
              monthIndex,
              rank.index,
              addressIndex
            );

            console.log("the mon is", userAddress);
            if (!userAddress) break;

            count++;
            addressIndex++;
          } catch (err) {
            break; // No more addresses
          }
        }

        data[rank.index] = count; // Store count for the rank
      }

      const formattedData = RANKS.map((rank) => ({
        rank: rank.name,
        count: data[rank.index], // Use 0 if no data
      }));
      setRankData(formattedData);
    } catch (error) {
      console.error("Error fetching rank data:", error);
    } finally {
      console.log("Setting loadingGraph to false...");
      setLoadingGraph(false);
    }
  };

  // Fetch addresses for the user's rank in the current month
  const fetchAddressesForUserRank = async () => {
    if (!walletProvider) {
      console.error("Wallet provider is not available");
      return;
    }

    console.log("running it");
    setLoadingAddresses(true);
    try {
      const ethersProvider = new ethers.providers.Web3Provider(walletProvider);
      const contract = new ethers.Contract(
        contractAddress,
        contractAbi,
        ethersProvider
      );

      const rankIndex =
        userRank !== null
          ? [
              "STAR",
              "BRONZE",
              "SILVER",
              "GOLD",
              "DIAMOND",
              "BLUE_DIAMOND",
              "BLACK_DIAMOND",
              "ROYAL_DIAMOND",
              "CROWN_DIAMOND",
            ].indexOf(userRank)
          : -1;

      if (rankIndex === -1) {
        setAddresses([]);
        setLoadingAddresses(false);
        return;
      }

      console.log("all corr");
      const userAddresses: { address: string; avatar: string }[] = [];
      let addressIndex = 0;

      while (true) {
        try {
          const userAddress = await contract.monthlyEligibleAddresses(
            currentMonthIndex,
            rankIndex,
            addressIndex
          );

          console.log("the addressssss is", userAddress);
          if (!userAddress) break;
          const userDetails = await fetchUserDetails(userAddress);

          userAddresses.push({
            address: userAddress,
            avatar: userDetails.avatar,
          });
          addressIndex++;
        } catch {
          break;
        }
      }

      // Calculate the total number of addresses for the current rank
      const totalAddresses = addresses
        .filter((data) => data.rank === userRank) // Filter by rank
        .reduce((sum, data) => sum + data.list.length, 0); // Sum up all addresses in the list

      console.log("Total Addresses for Rank:", totalAddresses);

      if (userAddresses.length > 0) {
        setAddresses([
          { rank: userRank ?? "Unknown Rank", list: userAddresses },
        ]);
      } else {
        setAddresses([]);
      }
    } catch (error) {
      console.error("Error fetching addresses for user rank:", error);
      setAddresses([]);
    } finally {
      console.log("Setting loadingAddresses to false...");
      setLoadingAddresses(false);
    }
  };

  useEffect(() => {
    if (currentMonthIndex >= 0 && userRank) {
      fetchAddressesForUserRank();
    }
  }, [currentMonthIndex, userRank]);

  useEffect(() => {
    if (currentMonthIndex >= 0 && walletProvider) {
      fetchDataForRanks(currentMonthIndex);
    }
  }, [currentMonthIndex, walletProvider]);

  const rabShrPrsntg = async (rankIndex: number) => {
    if (!walletProvider) {
      console.warn("Wallet provider not available for rank share percentage");
      setRankshare("Not Connected");
      return;
    }

    try {
      const ethersProvider = new ethers.providers.Web3Provider(walletProvider);
      const contract = new ethers.Contract(
        contractAddress,
        contractAbi,
        ethersProvider
      );

      const rankPercentage = await contract.rabShrPrsntg(rankIndex);
      const formattedPercentage = (rankPercentage.toNumber() / 100).toFixed(2);
      setRankshare(`${formattedPercentage}%`);
    } catch (error) {
      console.error("Error fetching rank share percentage:", error);
      setRankshare("Error fetching data");
    }
  };

  useEffect(() => {
    if (currentMonthIndex >= 0) {
      fetchMonthlyTotalAmount();
    }
  }, [currentMonthIndex, walletProvider]);

  useEffect(() => {
    const fetchRankPayouts = async () => {
      if (!isConnected || !walletProvider || !address) {
        console.warn("Prerequisites not met for fetching rank payouts");
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

        const ranksToFetch = [
          "DIAMOND",
          "BLUE_DIAMOND",
          "BLACK_DIAMOND",
          "ROYAL_DIAMOND",
          "CROWN_DIAMOND",
        ];
        let remainingPayoutsData: { [key: string]: string } = {};
        let maxPayoutsData: { [key: string]: string } = {};

        for (let rankIndex = 4; rankIndex <= 8; rankIndex++) {
          try {
            const remainingPayout = await contract.getRemainingPayouts(
              address,
              rankIndex
            );
            const maxPayout = await contract.maxPyts(rankIndex);

            remainingPayoutsData[ranksToFetch[rankIndex - 4]] =
              remainingPayout.toString();
            maxPayoutsData[ranksToFetch[rankIndex - 4]] = maxPayout.toString();
          } catch (error) {
            console.error(
              `Error fetching payouts for rank ${rankIndex}:`,
              error
            );
            remainingPayoutsData[ranksToFetch[rankIndex - 4]] = "Error";
            maxPayoutsData[ranksToFetch[rankIndex - 4]] = "Error";
          }
        }

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

    fetchRankPayouts();
  }, [isConnected, walletProvider, address]);

  const maxPyts = async (rankIndex: number) => {
    if (!walletProvider) {
      console.warn("Wallet provider not available for max payouts");
      return;
    }

    try {
      const ethersProvider = new ethers.providers.Web3Provider(walletProvider);
      const signer = ethersProvider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        contractAbi,
        signer
      );

      if (ADMIN_ADDRESSES.includes(address?.toLowerCase() || "")) {
        console.log("Admin detected - Skipping maxPayouts API call");
        return;
      }

      const maxPayout = await contract.maxPyts(rankIndex);
      setMaxPayouts((prev) => ({
        ...prev,
        [getRankName(rankIndex.toString())]: maxPayout.toString(),
      }));
    } catch (error) {
      console.error("Error fetching max payouts:", error);
    }
  };

  const getRemainingPayouts = async () => {
    if (!isConnected || !walletProvider || !address || !userDetails) {
      console.warn("Prerequisites not met for fetching remaining payouts");
      return;
    }
    if (ADMIN_ADDRESSES.includes(address.toLowerCase())) {
      console.log("Admin user detected, skipping payout calculation.");
      return;
    }

    try {
      const ethersProvider = new ethers.providers.Web3Provider(walletProvider);
      const signer = ethersProvider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        contractAbi,
        signer
      );

      const rankIndex = getRankIndex(userDetails.currentRank);
      const payouts = await contract.getRemainingPayouts(address, rankIndex);

      setRemainingPayouts((prev) => ({
        ...prev,
        [userDetails.currentRank]: payouts.toString(),
      }));
    } catch (error) {
      console.error("Error fetching remaining payouts:", error);
    }
  };

  useEffect(() => {
    if (isConnected && walletProvider && address) {
      const isAdmin = ADMIN_ADDRESSES.includes(address.toLowerCase());
      console.log("Admin Check: ", isAdmin);

      if (!isAdmin) {
        getRemainingPayouts();
      }
    }
  }, [isConnected, walletProvider, address]);

  useEffect(() => {
    const fetchCurrentMon = async () => {
      try {
        if (!walletProvider) {
          console.error("Provider is not available");
          return;
        }

        const ethersProvider = new ethers.providers.Web3Provider(
          walletProvider
        );
        const signer = ethersProvider.getSigner();
        const contract = new ethers.Contract(
          contractAddress,
          contractAbi,
          signer
        );

        const currentmonth = await contract.currentMonthIndex();
        setcurrentmonth(currentmonth.toString());
      } catch (error) {
        console.error("Error fetching contract data:", error);
        setcurrentmonth("Error");
      }
    };

    fetchCurrentMon();
  }, [walletProvider]);

  useEffect(() => {
    const fetchContractData = async () => {
      try {
        if (!walletProvider) {
          console.error("Provider is not available");
          return;
        }

        const ethersProvider = new ethers.providers.Web3Provider(
          walletProvider
        );
        const signer = ethersProvider.getSigner();
        const contract = new ethers.Contract(
          contractAddress,
          contractAbi,
          signer
        );

        const ttlRab = await contract.getTtlRabDstrbtd();
        setTotalRab(parseFloat(ethers.utils.formatEther(ttlRab)).toFixed(2));

        const mnthlyRab = await contract.getMnthlyRABPoolBalance();
        setMonthlyRab(
          parseFloat(ethers.utils.formatEther(mnthlyRab)).toFixed(2)
        );
      } catch (error) {
        console.error("Error fetching contract data:", error);
        setTotalRab("Error");
        setMonthlyRab("Error");
      }
    };

    fetchContractData();
  }, [walletProvider]);

  const fetchMonthlyTotalAmount = async () => {
    if (!walletProvider) {
      console.error("Wallet provider is not available");
      return;
    }

    try {
      const ethersProvider = new ethers.providers.Web3Provider(walletProvider);
      const contract = new ethers.Contract(
        contractAddress,
        contractAbi,
        ethersProvider
      );

      const lastMonthIndex = await contract.currentMonthIndex();
      const lastMon = lastMonthIndex.toNumber();

      console.log("the lastmonindex",lastMonthIndex.toNumber());

      const { totalAmount } = await contract.monthlyRabPools(lastMon);

      const monthly = await contract.getMnthlyRABPoolBalance();

      const formattedTotalAmount = parseFloat(
        ethers.utils.formatEther(totalAmount)
      ).toFixed(2);
      const formattedTimestamp = parseFloat(
        ethers.utils.formatEther(monthly)
      ).toFixed(2);

      setMonthlyRabindex(formattedTotalAmount);
      setMonthlyRab(formattedTimestamp);
    } catch (error) {
      console.error(`Error fetching data for last month:`, error);
      setMonthlyRabindex("Error");
      setMonthlyRab("Error fetching timestamp");
    }
  };

  useEffect(() => {
    if (currentMonthIndex >= 0) {
      fetchMonthlyTotalAmount();
    }
  }, [currentMonthIndex]);

  const fetchRabStartTimestamp = async (): Promise<number | null> => {
    try {
      if (!walletProvider) {
        console.warn("Wallet provider not available");
        return null;
      }
      const provider = new ethers.providers.Web3Provider(walletProvider);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        contractAbi,
        signer
      );

      const startTimestamp = await contract.rabStartTimestamp();
      return startTimestamp.toNumber();
    } catch (error) {
      console.error("Error fetching rabStartTimestamp:", error);
      return null;
    }
  };

  useEffect(() => {
    const fetchTimestamps = async () => {
      if (!walletProvider) {
        console.warn("Wallet provider not available");
        return;
      }

      try {
        const provider = new ethers.providers.Web3Provider(walletProvider);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(
          contractAddress,
          contractAbi,
          signer
        );

        let start, end;

        console.log("the curr1 is",currentMonthIndex);

        if (currentMonthIndex === 0) {
          start = await contract.rabStartTimestamp();
          console.log("the nefore start is",start)
          start = start.toNumber();

          console.log("the start is",start);
        } else {

          console.log("the curr22 is",currentMonthIndex);
          const monthlyData = await contract.monthlyRabPools(
            currentMonthIndex - 2
          );

          console.log("the mon is",monthlyData);
          start = monthlyData.distributionTimestamp.toNumber();
          console.log("the newmon is start is",start);
        }


        console.log("the start is",start);
        end = start + 60 * 60;

        console.log("Calculated new_Start Time:", start);
        console.log("Calculated new_End Time:", end);
        console.log("Current Time:", Math.floor(Date.now() / 1000));

        setStartTime(start);
        setEndTime(end);
      } catch (error) {
        console.error("Error fetching timestamps:", error);
      }
    };

    fetchTimestamps();
  }, [currentMonthIndex, walletProvider]);



  useEffect(() => {
    const fetchTimestamps = async () => {
      const start = await fetchRabStartTimestamp();
      if (start) {
        const totalDurationSeconds = 60 * 60;
        const end = start + totalDurationSeconds;

        console.log("the end is",end);

        setStartTime(start);
        setEndTime(end);
      }
    };

    fetchTimestamps();
  }, []);

  // useEffect(() => {
  //   // Add more logging to understand timestamp values
  //   console.log("Start Time:", startTime);
  //   console.log("End Time:", endTime);
  //   console.log("Current Time:", Math.floor(Date.now() / 1000));
  // }, [startTime, endTime]);

  useEffect(() => {
    if (!endTime) return;

    const interval = setInterval(() => {
      const currentTime = Math.floor(Date.now() / 1000); // Current timestamp in seconds
      const remaining = Math.max(endTime - currentTime, 0);

       console.log("the end time is",endTime);
       console.log("the current time is",currentTime);
      console.log("the rem is",remaining);

      if (remaining <= 1 && !isExpired) {
        setIsExpired(true);
        // setRemainingTime("00D :00Hrs :00Min :00Sec"); // Display all zeroes when time is up
        clearInterval(interval);
        // setTimeout(() => {
        //   window.location.reload();
        // }, 2000);

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
  }, [endTime]);

  useEffect(() => {
    const fetchAddress = async () => {
      if (walletProvider) {
        try {
          const provider = new ethers.providers.Web3Provider(walletProvider);
          const signer = provider.getSigner();
          const address = await signer.getAddress();

          const avatar = multiavatar(address);

          setAvatarSVG(avatar);
        } catch (error) {
          console.error("Error fetching connected address:", error);
        }
      }
    };
    fetchAddress();
  }, [walletProvider]);

  // const copyToClipboard = (text: string, addrIdx: string) => {
  //   navigator.clipboard
  //     .writeText(text)
  //     .then(() => {
  //       setCopiedState((prev) => ({
  //         ...prev,
  //         [addrIdx]: true,
  //       }));

  //       setTimeout(() => {
  //         setCopiedState((prev) => ({
  //           ...prev,
  //           [addrIdx]: false,
  //         }));
  //       }, 2000);
  //     })
  //     .catch((err) => {
  //       console.error("Failed to copy: ", err);
  //     });

      
  // };

 
  const getDisplayTime = (currentMonthIndex: number) => {
    // Calculate years and remaining months
    const years = Math.floor(currentMonthIndex / 12);
    const months = currentMonthIndex % 12;

    // Formatting logic
    if (years > 0) {
      // If we have complete years
      if (months === 0) {
        // Exactly divisible by 12
        return `${years} Year${years > 1 ? "s" : ""}`;
      } else {
        // Partial year
        return `${years} Year${years > 1 ? "s" : ""} ${months} Month${
          months > 1 ? "s" : ""
        }`;
      }
    } else {
      // Less than a year
      return months;
    }
  };
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
          {[
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
              value: Elgibility ? "Eligible" : "Not-Eligible",
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
          ].map((card, index) => (
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
              // currentMonthIndex={currentMonthIndex}
              // loadingGraph={loadingGraph}
              rankData={rankData}
              loadingGraph={loadingGraph}
              // darkMode={darkMode}
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
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

interface StatCardProps {
  icon: any;
  value: string | number;
  label: string;
  gradient: string;
}

const StatCard = ({ icon: Icon, value, label, gradient }: StatCardProps) => (
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

interface TimeInfoSectionProps {
  currentMonth: string | number;
  startTime: number | null;
  endTime: number | null;
  remainingTime: string;
}

interface RankPayoutsTableProps {
  userRank: string | null;
  address: string | undefined;
  remainingPayouts: { [key: string]: string };
  maxPayouts: { [key: string]: string };
}

// Time Information Section with Enhanced Design
const TimeInfoSection: React.FC<TimeInfoSectionProps> = ({
  currentMonth,
  startTime,
  endTime,
  remainingTime,
}) => {
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
          {[
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
          ].map((item, index) => (
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
  // Rank index and helper functions
  const getRankIndex = (rankName: string): number => {
    const ranks: { [key: string]: number } = {
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

  // Admin addresses
  const ADMIN_ADDRESSES = [
    "0x978ef2f8e2bb491adf7358be7ffb527e7bd47312",
    "0x3e582a9ffd780a4dfc8aab220a644596772b919e",
  ];

  // Rank details with colors and logos
  const rankDetails = [
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
  ];

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
                const isAdmin = ADMIN_ADDRESSES.includes(
                  address?.toLowerCase() || ""
                );
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
                          ? remainingPayouts[rank.name] || "Loading..."
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
                          ? maxPayouts[rank.name] || "Loading..."
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

interface RankDistributionChartProps {
  rankData: { rank: string; count: number }[];
  loadingGraph: boolean; // Add this line
}

const RankDistributionChart: React.FC<RankDistributionChartProps> = ({
  rankData,
  loadingGraph
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

  // Enhanced color palette matching the payout table's aesthetic
  const rankColors = {
    DIAMOND: "#6366f1", // Bright indigo
    "BLUE DIAMOND": "#3b82f6", // Bright blue
    "BLACK DIAMOND": "#94a3b8", // Bright gray
    "ROYAL DIAMOND": "#8b5cf6", // Bright purple
    "CROWN DIAMOND": "#ec4899", // Bright pink
  };

  const formattedData = rankData.map((item) => ({
    rank: item.rank.replace(/_/g, " "),
    count: item.count,
    color:
      rankColors[item.rank.replace(/_/g, " ") as keyof typeof rankColors] ||
      "#6366f1",
  }));

  const totalUsers = formattedData.reduce((sum, item) => sum + item.count, 0);

  const formatYAxis = (value: number) => Math.round(value).toString();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-white/20 dark:border-gray-700/50 rounded-xl p-4 shadow-lg"
        >
          <p className="font-medium text-gray-900 dark:text-white">{label}</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Count: {payload[0].value}
          </p>
        </motion.div>
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
          bottom: 50 
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

// Elite Ranks Configuration
const eliteRanks = [
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

interface UserAddress {
  address: string;
  nickname?: string;
  avatar?: string;
}

interface RankSectionProps {
  rank: (typeof eliteRanks)[0];
  addresses: UserAddress[];
  expanded: boolean;
  onToggle: () => void;
  onCopy: (address: string, key: string) => void;
  copiedStates: Record<string, boolean>;
}

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

interface EligibleAddressesProps {
  currentMonthIndex?: number;
  rankAddresses: Record<string, UserAddress[]>;
  isLoading: boolean;
}

export const EligibleAddressesSection: React.FC<EligibleAddressesProps> = ({
  currentMonthIndex = 0,
  rankAddresses,
  isLoading,
}) => {
  const [expandedRank, setExpandedRank] = useState<string | null>(null);
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});

  const handleCopy = async (address: string, key: string) => {

    console.log(currentMonthIndex);
    try {
      await navigator.clipboard.writeText(address);
      setCopiedStates((prev) => ({ ...prev, [key]: true }));
      setTimeout(() => {
        setCopiedStates((prev) => ({ ...prev, [key]: false }));
      }, 2000);
    } catch (error) {
      console.error("Copy failed", error);
    }
  };

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
          onToggle={() =>
            setExpandedRank(expandedRank === rank.name ? null : rank.name)
          }
          onCopy={handleCopy}
          copiedStates={copiedStates}
        />
      ))}
    </div>
  );
};

export default Rankach;
