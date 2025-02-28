declare function multiavatar(text: string): string;

import { useEffect, useState, useRef } from "react";
import { useDarkMode } from "../context/DarkModeContext.tsx";
import { BrowserProvider, Contract, formatUnits } from "ethers";
//import multiavatar from "@multiavatar/multiavatar";
import { ZeroAddress, isAddress } from "ethers";
//import { usePriceData } from "../components/PriceContext.tsx";
import {rank4, rank5, rank6, rank7, rank8} from "../assets/index"
import {
  Provider,
  useAppKitProvider,
  useAppKitAccount,
} from "@reown/appkit/react";
import axios from "axios"; // Import axios for making HTTP requests
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
//import { BigNumber } from "ethers";
import { Loader2, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import contractAbi from "../contracts/Props/contractAbi.ts"; // Adjust path as needed
import contractAddress from "../contracts/Props/contractAddress.ts"; // Adjust path as needed
// At the top of your component, modify the imports and provider handling
//import { useWeb3ModalProvider } from "@web3modal/ethers5/react"; // Add this import if not present
import { Bar } from "react-chartjs-2";

import { motion, AnimatePresence } from "framer-motion";
import {
  Copy,
  Wallet,
  User,
  Award,
  Trophy,
  TrendingUp,
  Gift,
  ChevronUp,
  DollarSign,
  ChevronDown,
  Check,
} from "lucide-react";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use"; // Helps adjust confetti to screen size

//import * as Tooltip from "@radix-ui/react-tooltip";
import { cn } from "../../components/lib/utils.ts";
import { Camera } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/components/ui/dialog.tsx";
import { Button } from "../../components/components/ui/button.tsx";
import { Input } from "../../components/components/ui/input.tsx";
import { Card } from "../../components/components/ui/card.tsx";

//import { motion } from "framer-motion";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Legend,
} from "chart.js";

// Register chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Legend);

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

interface Rank {
  name: string;
  index: number;
  multiplier: number;
}

interface UserData {
  nickname: string;
  referralQR?: string;
  profileImage?: string;
  address?: string;
  avatar?: string;
}

// interface ProfileSectionProps {
//   address?: string;
//   className?: string;
// }

const Dashboard = () => {
  const [totalRab, setTotalRab] = useState<string>("Loading...");
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [rankMessage, setRankMessage] = useState("");
  const [showMarquee, setShowMarquee] = useState(false);
  const [isRankExpired, setIsRankExpired] = useState<"loading" | boolean>(
    "loading"
  );

  // const { priceData } = usePriceData();
  const [avatarSVG, setAvatarSVG] = useState<string>("");
  const { darkMode } = useDarkMode();
  const [backgroundKey, setBackgroundKey] = useState(
    darkMode ? "dark" : "light"
  );
  const [newNickname, setNewNickname] = useState("");
  const [userData, setUserData] = useState<UserData | null>(null);

  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [usrCnt, setUsrCnt] = useState<number | null>(null);
  const [count, setCount] = useState(0);
  const [rankDetails, setRankDetails] = useState<any[]>([]);
  const [totalPendingAmount, setTotalPendingAmount] =
    useState<string>("Loading...");
  const [totalInvestment, setTotalInvestment] = useState("0");
  const navigate = useNavigate();
  const [connectedAddress, setConnectedAddress] = useState<string>("");
  const [rankGraphData, setRankGraphData] = useState<GraphData>({
    labels: [],
    datasets: [],
  });
  const [countLTGPool, setCountLTGPool] = useState(0);
  const [countRTGPool, setCountRTGPool] = useState(0);
  const [countLDPPool, setCountLDPPool] = useState(0);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (
    !avatarSVG &&
    !setAvatarSVG &&
    !totalInvestment &&
    !totalPendingAmount &&
    !setConnectedAddress
  ) {
    console.log("update!!");
  }

  useEffect(() => {
    console.log("Dark Mode Changed, Re-rendering Background");
    setBackgroundKey(darkMode ? "dark" : "light");
  }, [darkMode]);

  if (!isRankExpired && !backgroundKey && !rankDetails && !qrCodeUrl) {
    console.log("update!!");
  }

  useEffect(() => {
    const timeout = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timeout);
  }, []);

  const [monthlyRab, setMonthlyRab] = useState<string>("Loading...");

  useEffect(() => {
    //console.log(avatarSVG,backgroundKey,totalInvestment,qrCodeUrl)
    // console.log(totalInvestment, qrCodeUrl);
    const registerUser = async (address: string) => {
      try {
        const response = await axios.get(
          `https://server.cryptomx.site/api/users/${address}`
        );

        const user = response.data.data;
        setUserData({
          nickname: user.nickname,
          referralQR: user.referralQR,
          profileImage: user.profileImage,
          avatar: user.avatar, // Make sure this is being set
          address: address, // Add this line
        });

        if (user.avatar) {
          setAvatarUrl(user.avatar);
          //console.log('Setting avatar URL:', user.avatar);
        }

        // Keep your existing QR code URL setting
        const url = `https://res.cloudinary.com/dygw3ixdr/image/upload/v1737705516/qr-codes/${address}.png`;
        setQrCodeUrl(url);
      } catch (error) {
        console.error("Error fetching user data:", error);
        // toast.error("Failed to load user data");
      }
    };

    if (address) {
      registerUser(address);
    }
  });

  const [isNicknameLoading, setIsNicknameLoading] = useState(false);
  const handleUpdateNickname = async () => {
    if (!address) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      setIsNicknameLoading(true);
      const response = await axios.put(
        `https://server.cryptomx.site/api/users/update-nickname`,
        {
          nickname: newNickname,
          address: address,
        }
      );

      // ✅ Check response status instead of success field
      if (response.status === 200) {
        toast.success("Nickname updated successfully");
        setUserData((prev) =>
          prev ? { ...prev, nickname: newNickname } : null
        );
        setShowNicknameModal(false);
      } else {
        console.warn("Unexpected response structure:", response.data);
        toast.error("Nickname update may not have been successful.");
      }
    } catch (error) {
      console.error("Error updating nickname:", error);
      toast.error("Something went wrong. Please try again.");
      setIsNicknameLoading(false);
    }
  };

  //const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null); // Define state

  // First, update the state management for avatar
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Add this useEffect to handle initial avatar loading
  useEffect(() => {
    console.log(avatarUrl);
    if (userData?.avatar) {
      setAvatarUrl(userData.avatar);
    }
  }, [userData?.avatar]);

  // Modify the handleImageUpload function
  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Preview Image
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);

    if (!address) {
      toast.error("Wallet address not found. Cannot upload the image.");
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("avatar", file);
      formData.append("address", address);

      //console.log('Uploading avatar for address:', address);

      const response = await axios.put(
        "https://server.cryptomx.site/api/users/update-avatar",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Check if the response has the expected structure
      if (response.data && response.data.data) {
        const newAvatarUrl = response.data.data.avatar;
        if (newAvatarUrl) {
          // Update both states
          setUserData((prev) => ({
            ...prev!,
            avatar: newAvatarUrl,
          }));
          setAvatarUrl(newAvatarUrl);
          setPreviewImage(null);

          // Fetch updated user data
          const userResponse = await axios.get(
            `https://server.cryptomx.site/api/users/${address}`
          );

          if (userResponse.data && userResponse.data.data) {
            setUserData(userResponse.data.data);
          }

          toast.success("Avatar updated successfully!");
        } else {
          throw new Error("Avatar URL not found in response");
        }
      } else {
        throw new Error("Invalid response structure");
      }
    } catch (error) {
      console.error("Upload error details:", error);
      if (axios.isAxiosError(error)) {
        console.error("Response data:", error.response?.data);
        console.error("Response status:", error.response?.status);
      }
      // Only show error toast if the upload actually failed
      if (
        error instanceof Error &&
        !error.message.includes("Avatar URL not found")
      ) {
        toast.error("Failed to upload image.");
      }
    } finally {
      setIsUploading(false);
    }
  };

  interface RankTotals {
    [key: string]: string; // This allows string indexing
  }

  interface RankData {
    cnt: BigInt;
    // Add other properties from your contract's rUC return type if any
  }

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

  const [totalLTGPool, setTotalLTGPool] = useState<number | null>(null);
  const [totalRTGPool, setTotalRTGPool] = useState<number | null>(null);
  const [totalLDPPool, setTotalLDPPool] = useState<number | null>(null);

  const [withdrawalRAB, setWithdrawalRAB] = useState("0");

  const [withdrawalLevel, setWithdrawalLevel] = useState("0");
  const [withdrawalRab, setWithdrawalRab] = useState("0");
  const [totalLevel, setTotalLevel] = useState("0");

  const [totalRAB, setTotalRAB] = useState("0");
  const [withdrawalBonus, setWithdrawalBonus] = useState("0");
  const [totalBonus, setTotalBonus] = useState("0");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ErrorType>(null);
  type ErrorType = string | null;
  // const { open } = useWeb3Modal();
  const { address, isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider<Provider>("eip155");
  const [isProviderReady, setIsProviderReady] = useState(false);
  const [inviteLink, setInviteLink] = useState(
    `https://cryptomx.site/#/register?referral=undefined`
  );
  //const [isCopied, setIsCopied] = useState(false);

  if (
    !withdrawalRab &&
    !withdrawalLevel &&
    !totalLevel &&
    !totalRAB &&
    !isLoading &&
    totalBonus &&
    withdrawalRAB &&
    inviteLink
  ) {
    console.log("update!!");
  }

  useEffect(() => {
    const fetchContractData = async () => {
      try {
        if (!walletProvider) {
          console.error("Provider is not available");
          return;
        }

        const ethersProvider = new BrowserProvider(walletProvider);
        const signer = await ethersProvider.getSigner();
        const contract = new Contract(contractAddress, contractAbi, signer);

        const ttlRab = await contract.getTtlRabDstrbtd();
        setTotalRab(parseFloat(formatUnits(ttlRab, 18)).toFixed(2));

        const mnthlyRab = await contract.getMnthlyRABPoolBalance();
        setMonthlyRab(parseFloat(formatUnits(mnthlyRab, 18)).toFixed(2));
      } catch (error) {
        console.error("Error fetching contract data:", error);
        setTotalRab("Error");
        setMonthlyRab("Error");
      }
    };

    fetchContractData();
  }, [walletProvider]);

  if (!error && !withdrawalBonus) {
    console.log("update!!");
  }

  // useEffect(() => {
  //   const fetchAddress = async () => {
  //     //console.log(withdrawalRab);
  //     if (walletProvider) {
  //       try {
  //         const provider = new ethers.providers.Web3Provider(walletProvider);
  //         const signer = provider.getSigner();
  //         const address = await signer.getAddress(); // Get connected wallet address
  //         // console.log("the address is", address);
  //         setConnectedAddress(address);
  //         const avatar = multiavatar(address);
  //         setAvatarSVG(avatar);
  //       } catch (error) {
  //         console.error("Error fetching connected address:", error);
  //       }
  //     }
  //   };
  //   fetchAddress();
  // }, [walletProvider]);

  const fetchRankDetails = async () => {
    try {
      if (!isConnected || !walletProvider || !isProviderReady) return;

      const provider = new BrowserProvider(walletProvider);
      const signer = await provider.getSigner();
      const contract = new Contract(contractAddress, contractAbi, signer);
      const details = [];
      let pendingAmountTotal = BigInt("0");
      for (let i = 0; i <= 8; i++) {
        const response = await contract.getRankLTG(connectedAddress, i); // Pass connected wallet address and rank ID

        // Add the pending amount to the total
        if (i <= 7) {
          pendingAmountTotal = pendingAmountTotal + response.pendingAmount;
        }

        details.push({
          id: i,
          name: ranks[i].name,
          count: response.count.toString(),
          pendingAmount: formatUnits(response.pendingAmount, 18),
          totalDistributedAmount: formatUnits(response.ttlDstrbtdAmount, 18),
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
        parseFloat(formatUnits(pendingAmountTotal, 18)).toFixed(2)
      );
    } catch (error) {
      console.error("Error initializing contract:", error);
    }
  };

  useEffect(() => {
    fetchRankDetails();
  }, [isConnected, walletProvider, isProviderReady]);

  // Notification for rank expiration

  useEffect(() => {
    if (userDetails?.rankExpiryTime && userDetails?.currentRank) {
      const rankIndex = ranks.findIndex(
        (rank) => rank.name === userDetails.currentRank
      );
      const goldRankIndex = ranks.findIndex((rank) => rank.name === "GOLD");
      const diamondRankIndex = ranks.findIndex(
        (rank) => rank.name === "DIAMOND"
      );

      // Set the rank-specific message
      if (rankIndex < goldRankIndex) {
        setRankMessage("Rank is going to expire. Upgrade your rank!");
      } else if (rankIndex >= diamondRankIndex) {
        setRankMessage(
          "Rank is going to expire. Either upgrade your rank or join the elite rank referral program!"
        );
      } else {
        setRankMessage(""); // No message for other cases
      }

      // Calculate time remaining
      const expiryTime = new Date(userDetails.rankExpiryTime).getTime();
      const currentTime = Date.now();
      const oneHourBeforeExpiry = expiryTime - 60 * 60 * 1000;

      // Show marquee only within 1 hour of expiry
      if (currentTime >= oneHourBeforeExpiry && currentTime < expiryTime) {
        setShowMarquee(true); // Show marquee during the 1-hour window
      } else {
        setShowMarquee(false); // Hide marquee otherwise
      }
    }
  }, [userDetails?.rankExpiryTime, userDetails?.currentRank]);

  // const copyToClipboard = () => {
  //   navigator.clipboard
  //     .writeText(inviteLink)
  //     .then(() => {
  //       setIsCopied(true); // Change button to tick sign
  //       setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
  //     })
  //     .catch((err) => {
  //       console.error("Failed to copy: ", err);
  //     });
  // };

  const [menuOpen, setMenuOpen] = useState(false);

  const currentRankIndex = ranks.findIndex(
    (rank) => rank.name === userDetails?.currentRank
  );

  // Filtered ranks greater than the user's current rank
  const filteredRanks = ranks.filter((rank) => rank.index > currentRankIndex);

  if (filteredRanks) {
    console.log("hi");
  }

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
        const ethersProvider = new BrowserProvider(walletProvider);
        const signer = await ethersProvider.getSigner();
        const contract = new Contract(contractAddress, contractAbi, signer);

        // Fetch `usrCnt` from the contract
        const usrCntValue = await contract.usrCnt();
        setUsrCnt(Number(usrCntValue)); // Convert BigNumber to a regular number
      } catch (error) {
        console.error("Error fetching usrCnt:", error);
        setUsrCnt(null); // Reset `usrCnt` in case of an error
      }
    };

    fetchUsrCnt();
  }, [isConnected, walletProvider, isProviderReady]);

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

  // const darkenColor = (hex: string, amount: number) => {
  //   let usePound = false;
  //   if (hex[0] === "#") {
  //     hex = hex.slice(1);
  //     usePound = true;
  //   }

  //   let num = parseInt(hex, 16);
  //   let r = (num >> 16) + amount;
  //   let g = ((num >> 8) & 0x00ff) + amount;
  //   let b = (num & 0x0000ff) + amount;

  //   r = Math.min(255, Math.max(0, r));
  //   g = Math.min(255, Math.max(0, g));
  //   b = Math.min(255, Math.max(0, b));

  //   return (
  //     (usePound ? "#" : "") +
  //     ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)
  //   );
  // };

  useEffect(() => {
    const generateRankGraphData = async () => {
      if (!isConnected || !walletProvider || !isProviderReady) return;

      try {
        const ethersProvider = new BrowserProvider(walletProvider);
        const signer = await ethersProvider.getSigner();
        const contract = new Contract(contractAddress, contractAbi, signer);

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
            const count = Number(rankStatus); // Get the user count
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
      // console.log("Fetching total investment...", error);

      try {
        const ethersProvider = new BrowserProvider(walletProvider);
        const signer = await ethersProvider.getSigner();
        const contract = new Contract(contractAddress, contractAbi, signer);

        // Fetch total investment
        const totalInvestmentData = await contract.getTtlInvstmnt(); // Pass address here
        const formattedInvestment = parseFloat(
          formatUnits(totalInvestmentData || "0", 18)
        ).toFixed(2); // Format to 2 decimal places

        //  console.log("Formatted total investment:", formattedInvestment);
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
        const ethersProvider = new BrowserProvider(walletProvider);
        const signer = await ethersProvider.getSigner();
        const contract = new Contract(contractAddress, contractAbi, signer);

        // Fetch pool values with proper error handling
        const [ltgValue, rtgValue, ldpValue] = await Promise.all([
          contract
            .getTtlLtgDstrbtd()
            .then((val: ethers.BigNumberish) =>
              parseFloat(formatUnits(val, 18))
            )
            .catch(() => 0),
          contract
            .getTtlRabDstrbtd()
            .then((val: ethers.BigNumberish) =>
              parseFloat(formatUnits(val, 18))
            )
            .catch(() => 0),
          contract
            .getTtllvlDstrbtd()
            .then((val: ethers.BigNumberish) =>
              parseFloat(formatUnits(val, 18))
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

              const count = rankData.cnt;
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

  console.log(setSelectedRank);

  // Add a separate effect to handle provider initialization
  // Add provider initialization effect
  useEffect(() => {
    const initializeProvider = async () => {
      if (!isConnected || !walletProvider) {
        setIsProviderReady(false);
        return;
      }

      try {
        const ethersProvider = new BrowserProvider(walletProvider);
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
      const ethersProvider = new BrowserProvider(walletProvider);
      const signer = await ethersProvider.getSigner();
      const contract = new Contract(contractAddress, contractAbi, signer);

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

      // console.log("with", withdrawalBonus);

      // Format the data
      // setWithdrawalBonus(
      //   parseFloat(
      //     ethers.utils.formatEther(withdrawalBonusData || "0")
      //   ).toFixed(4)
      // );
      setTotalBonus(
        parseFloat(formatUnits(totalBonusData || "0", 18)).toFixed(4)
      );
      setWithdrawalRAB(
        parseFloat(formatUnits(withdrawalRABData || "0", 18)).toFixed(4)
      );
      setTotalRAB(parseFloat(formatUnits(totalRABData || "0", 18)).toFixed(4));

      // console.log(
      //   "the value issssss:",
      //   ethers.utils.formatEther(withdrawalLevelData || "0")
      // );
      setWithdrawalLevel(
        parseFloat(formatUnits(withdrawalLevelData || "0", 18)).toFixed(4)
      );
      setTotalLevel(
        parseFloat(formatUnits(totalLevelData || "0", 18)).toFixed(4)
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

  interface UserAddress {
    address: string;
    nickname?: string;
    avatar?: string;
  }

  const [rankAddresses, setRankAddresses] = useState<
    Record<string, UserAddress[]>
  >({});

  interface UserAddress {
    address: string;
    nickname?: string;
    avatar?: string;
  }
  const [currentMonthIndex, setCurrentMonthIndex] = useState<number>(0);
  const [isMonthIndexLoaded, setIsMonthIndexLoaded] = useState(false);

  const fetchCurrentMonthIndex = async () => {
    if (!walletProvider) {
      console.error("Wallet provider not available");
      return;
    }

    try {
      const ethersProvider = new BrowserProvider(walletProvider);
      const contract = new Contract(
        contractAddress,
        contractAbi,
        ethersProvider
      );

      const currentMonth = await contract.currentMonthIndex();
      console.log("the current month is", currentMonth);
      setCurrentMonthIndex(Number(currentMonth) + 1);
      setIsMonthIndexLoaded(true);
    } catch (error) {
      console.error("Error fetching current month index:", error);
    }
  };

  useEffect(() => {
    const fetchAllRankAddresses = async () => {
      if (!walletProvider) {
        setError("Wallet provider not available");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const ethersProvider = new BrowserProvider(walletProvider);
        const contract = new Contract(
          contractAddress,
          contractAbi,
          ethersProvider
        );

        const addresses: Record<string, UserAddress[]> = {};

        // Fetch addresses for each elite rank
        for (const rank of eliteRanks) {
          const rankAddressesList: UserAddress[] = [];
          let addressIndex = 0;

          while (true) {
            try {
              // Get eligible address for current month and rank
              const userAddress = await contract.monthlyEligibleAddresses(
                currentMonthIndex,
                rank.id,
                addressIndex
              );

              // Break the loop if no more addresses
              if (!userAddress || userAddress === ZeroAddress) break;

              // Get user details from your backend
              try {
                const userResponse = await axios.get(
                  `https://server.cryptomx.site/api/users/${userAddress}`
                );
                const userData = userResponse.data.data;

                rankAddressesList.push({
                  address: userAddress,
                  nickname: userData?.nickname,
                  avatar: userData?.avatar || multiavatar(userAddress),
                });
              } catch (error) {
                // If backend fails, still add address with default values
                rankAddressesList.push({
                  address: userAddress,
                  avatar: multiavatar(userAddress),
                });
              }

              addressIndex++;
            } catch (error) {
              console.error(`Error fetching address for ${rank.name}:`, error);
              break;
            }
          }

          addresses[rank.name] = rankAddressesList;
        }

        setRankAddresses(addresses);
      } catch (error) {
        console.error("Error fetching eligible addresses:", error);
        setError("Failed to fetch eligible addresses");
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch addresses after month index is loaded
    if (isMonthIndexLoaded && walletProvider) {
      fetchAllRankAddresses();
    }
  }, [walletProvider, currentMonthIndex, isMonthIndexLoaded]);

  useEffect(() => {
    if (walletProvider) {
      fetchCurrentMonthIndex();
    }
  }, [walletProvider]);

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

  interface RankSectionProps {
    rank: (typeof eliteRanks)[0];
    addresses: UserAddress[];
    expanded: boolean;
    onToggle: () => void;
    onCopy: (address: string, key: string) => void;
    copiedStates: Record<string, boolean>;
  }

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

  // const handleWithdrawRAB = async () => {
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

  //     const tx = await contract.getWthlvlIncm(address); // Rank Achievement Bonus withdrawal function
  //     await tx.wait();

  //     console.log("Withdraw RAB Transaction Hash:", tx.hash);

  //     const updatedRAB = await contract.getUsrTtlrabrcvd(address);
  //     setWithdrawalRAB(
  //       parseFloat(ethers.utils.formatEther(updatedRAB || "0")).toFixed(4)
  //     );

  //     toast.success("Rank Achievement Bonus withdrawn successfully!");
  //     window.location.reload();
  //     console.log(handleWithdrawRAB); // This will make it "used" without executing
  //   } catch (error) {
  //     console.error("Error during RAB withdrawal:", error);
  //     toast.error("Failed to withdraw Rank Achievement Bonus.");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const upgradeRank = async () => {
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
      const ethersProvider = new BrowserProvider(walletProvider);
      const signer = await ethersProvider.getSigner();
      const contract = new Contract(contractAddress, contractAbi, signer);

      const rankIndex = ranks.findIndex((rank) => rank.name === selectedRank);

      //console.log("the rank isss ", rankIndex);
      if (rankIndex < 0) {
        toast.info("Invalid rank selected.");
        return;
      }

      // Assuming the contract has a function `upgradeToRank` that takes the rank index
      const tx = await contract.upgradeRank(rankIndex); // Replace `upgradeToRank` with your contract's function

      await tx.wait();

      console.log(
        `Successfully upgraded to ${selectedRank}. Transaction:`,
        tx.hash
      );
      setShowConfetti(true);
      toast.success(`🎉Successfully upgraded to ${selectedRank}.`);
      //console.log("rank is upgraded in this");
      setTimeout(() => {
        setShowConfetti(false);
        window.location.reload(); // Reload after animation
      }, 5000);
    } catch (error) {
      console.error("Error upgrading rank:", error);
      toast.error("Failed to upgrade rank. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const [isLoadingLevel, setIsLoadingLevel] = useState(false);
  const [isLoadingRab, setIsLoadingRab] = useState(false);
  //const [isLoadingBonus, setIsLoadingBonus] = useState(false);

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
      const ethersProvider = new BrowserProvider(walletProvider);
      const signer = await ethersProvider.getSigner();
      const contract = new Contract(contractAddress, contractAbi, signer);

      // console.log("before");
      const tx = await contract.withdrawLevelIncome(); // Level Distribution Pool withdrawal function
      await tx.wait();

      // console.log("After ");

      // console.log("Withdraw Level Transaction Hashhhhhhh:", tx.hash);

      const updatedLevel = await contract.getUsrTtllvlrcvd(address);
      setWithdrawalLevel(
        parseFloat(formatUnits(updatedLevel || "0")).toFixed(4)
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

  const handleWithdrawRab = async () => {
    if (!isConnected || !walletProvider || !isProviderReady || !address) {
      console.warn(
        "Wallet not connected, provider not ready, or address missing"
      );
      return;
    }

    try {
      setIsLoadingRab(true);
      const ethersProvider = new BrowserProvider(walletProvider);
      const signer = await ethersProvider.getSigner();
      const contract = new Contract(contractAddress, contractAbi, signer);

      const tx = await contract.claimMonthlyRab(); // Level Distribution Pool withdrawal function
      await tx.wait();

      // console.log("Withdraw Level Transaction Hash:", tx.hash);

      const updatedLevel = await contract.getUsrTtllvlrcvd(address);
      setWithdrawalRab(parseFloat(formatUnits(updatedLevel || "0")).toFixed(4));

      setShowConfetti(true);
      fetchBonusData();

      setTimeout(() => {
        setShowConfetti(false);

        // Reload after animation
      }, 5000);

      toast.success("🎉RAB  withdrawn successfully!");
      // window.location.reload();
    } catch (error) {
      console.error("Error during RAB withdrawal:", error);
      toast.error("Failed to withdraw RAB .");
    } finally {
      setIsLoadingRab(false);
    }
  };

  if (isLoadingLevel && isLoadingRab) {
    handleWithdrawLevel();
    handleWithdrawRab();
    upgradeRank();
  }

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

    // ...

    const fetchUserDetails = async () => {
      if (!isConnected || !walletProvider || !isProviderReady || !address) {
        console.warn("Prerequisites not met for fetching user details");
        return;
      }

      try {
        const ethersProvider = new BrowserProvider(walletProvider);
        const signer = await ethersProvider.getSigner();
        const contract = new Contract(contractAddress, contractAbi, signer);

        // Fetch user data
        const userData = await contract.users(address);
        // console.log("Raw user data:", userData);

        const formatTimestamp = (timestamp: any): string => {
          try {
            // Log the incoming timestamp
            //console.log("Original timestamp:", timestamp);

            // Convert to number and log
            const timestampNum = Number(timestamp);
            // console.log("Converted to number:", timestampNum);

            if (isNaN(timestampNum) || timestampNum === 0) {
              //console.log("Invalid timestamp detected");
              return "Not updated";
            }

            // Log milliseconds conversion
            // console.log("In milliseconds:", timestampNum * 1000);

            // Log final date
            const finalDate = new Date(
              timestampNum * 1000
            ).toLocaleDateString();
            // console.log("Final formatted date:", finalDate);

            return finalDate;
          } catch (error) {
            //console.error('Error formatting timestamp:', error);
            return "Invalid timestamp";
          }
        };
        // Then when using it:
        //console.log("Raw userData.lastRankUpdateTime:", userData.lastRankUpdateTime);
        // const formattedDate = formatTimestamp(Number(userData.lastRankUpdateTime));
        // //console.log("Final result:", formattedDate);

        // //console.log("Raw userData.rankExpiryTime:", userData.rankExpiryTime);
        // const formattedDate2 = formatTimestamp(Number(userData.rankExpiryTime));
        //console.log("Final result of Raw userData.rankExpiryTime:", formattedDate2);

        const [totalBonusData, totalRABData, totalLevelData] =
          await Promise.all([
            // Pass address here
            contract.getUsrTtlLtgrcvd(address), // Pass address here
            // Pass address here
            contract.getUsrTtlrabrcvd(address), // Pass address here
            // Pass address here
            contract.getUsrTtllvlrcvd(address), // Pass address here
          ]);

        const total =
          parseFloat(formatUnits(totalBonusData || "0", 18)) +
          parseFloat(formatUnits(totalRABData || "0", 18)) +
          parseFloat(formatUnits(totalLevelData || "0", 18));

        // console.log("the total is", total);
        // ─── 1) Build a total of rewards at indices [1], [3], [5] ────────────
        // let rewardSumBN = BigNumber.from(0);
        // if (Array.isArray(userData[6])) {
        //   // Safely convert each element to a BigNumber if present, otherwise 0
        //   const r1 = userData[6][1]
        //     ? BigNumber.from(userData[6][1])
        //     : BigNumber.from(0);
        //   const r3 = userData[6][3]
        //     ? BigNumber.from(userData[6][2])
        //     : BigNumber.from(0);
        //   const r5 = userData[6][5]
        //     ? BigNumber.from(userData[6][4])
        //     : BigNumber.from(0);

        //   // Sum them all
        //   rewardSumBN = rewardSumBN.add(r1).add(r3).add(r5);
        // }

        // console.log("the total purchase is", Number(userData.userTotalInvestment));

        // Extract the necessary details
        const expectedTime = userData[0]?.toString(); // Expected time (e.g., last rank update time)
        const expiryTime = userData.rankExpiryTime; // Expiry time
        // Ensure current time is an integer before creating a BigNumber
        const currentTime = BigInt(Math.floor(Date.now() / 1000));

        // console.log("the excpeted time is",expectedTime);
        // console.log("the  time is",expiryTime);
        // console.log("the ime is",currentTime);

        // Compute active/inactive status
        const isActive =
          currentTime >= expectedTime && currentTime < expiryTime;
        const isExpired = currentTime > expiryTime;

        const formattedData = {
          referrer: userData[2] || "No referrer",
          currentRank: getRankName(userData[0]?.toString() || "0"),
          lastRankUpdateTime: formatTimestamp(
            Number(userData.lastRankUpdateTime)
          ),
          rankExpiryTime: formatTimestamp(Number(userData.rankExpiryTime)),
          totalInvestment: formatUnits(userData[5]?.toString() || "0", 18),
          isActive: isActive && !isExpired,
          isExpired: isExpired,

          // ─── 3) Use the summed rewards for the 'rewards' field ─────────────
          rewards: total.toString(),
        };

        //console.log("Formatted user data:::::", formattedData.lastRankUpdateTime);
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

  const ADMIN_ADDRESSES = [
    "0x3E582a9FFD780A4DFC8AAb220A644596772B919E".toLowerCase(),

  ];

  useEffect(() => {
    if (!address) {
      navigate("/");
      return;
    }

    console.log("the add issss",ADMIN_ADDRESSES);

    if (!ADMIN_ADDRESSES.includes(address.toLowerCase())) {
      navigate("/");
    }
  }, [address, navigate]);

  useEffect(() => {
    if (userDetails?.rankExpiryTime && userDetails?.currentRank) {
      const rankIndex = ranks.findIndex(
        (rank) => rank.name === userDetails.currentRank
      );
      const goldRankIndex = ranks.findIndex((rank) => rank.name === "GOLD");
      const diamondRankIndex = ranks.findIndex(
        (rank) => rank.name === "DIAMOND"
      );

      // Set the rank-specific message
      if (rankIndex < goldRankIndex) {
        setRankMessage(
          "Rank is going to expire. Either upgrade your rank or sponser a new Member!"
        );
      } else if (rankIndex >= diamondRankIndex) {
        setRankMessage(
          "Rank is going to expire. Either upgrade your rank or sponser a elite rank Member!"
        );
      } else {
        setRankMessage(""); // No message for other cases
      }

      // Calculate time remaining
      const expiryTime = new Date(
        `${userDetails.rankExpiryTime} 23:59:59`
      ).getTime();

      //console.log("the expriy time is",expiryTime);
      const currentTime = Date.now();
      const oneHourBeforeExpiry = expiryTime - 60 * 60 * 1000;
      //

      // console.log("the current time is",currentTime);
      // console.log("the expriy is",expiryTime);

      if (currentTime > expiryTime) {
        setIsRankExpired(true);
        // console.log("expired");
      } else {
        setIsRankExpired(false);
        // console.log("not expired");
      }

      // Show marquee only within 1 hour of expiry
      if (currentTime >= oneHourBeforeExpiry && currentTime <= expiryTime) {
        setShowMarquee(true);
      } else {
        setShowMarquee(false);
      }
    }
  }, [userDetails?.rankExpiryTime, userDetails?.currentRank, ranks]);

  // Second useEffect for pool data
  useEffect(() => {
    const fetchPoolData = async () => {
      if (!isConnected || !walletProvider || !isProviderReady) {
        return;
      }

      try {
        const ethersProvider = new BrowserProvider(walletProvider);
        const signer = await ethersProvider.getSigner();
        const contract = new Contract(contractAddress, contractAbi, signer);

        // Fetch pool data using Promise.all
        const [totalLTGPoolData, totalRTGPoolData, totalLDPPoolData] =
          await Promise.all([
            contract.getTtlLtgDstrbtd(),
            contract.getTtlRabDstrbtd(),
            contract.getTtllvlDstrbtd(),
          ]);

        // Convert BigNumber to readable format and set the raw values as numbers

        const ltgPool = parseFloat(formatUnits(totalLTGPoolData, 18)).toFixed(
          0
        );
        const rtgPool = parseFloat(formatUnits(totalRTGPoolData, 18)).toFixed(
          0
        );
        const ldpPool = parseFloat(formatUnits(totalLDPPoolData, 18)).toFixed(
          0
        );

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
      }, 15); // Adjust the speed by changing this value

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
        const ethersProvider = new BrowserProvider(walletProvider);
        const signer = await ethersProvider.getSigner();
        const contract = new Contract(contractAddress, contractAbi, signer);

        // Fetch pool values with proper error handling
        const [ltgValue, rtgValue, ldpValue] = await Promise.all([
          contract
            .getTtlLtgDstrbtd()
            .then((val: ethers.BigNumberish) =>
              parseFloat(formatUnits(val, 18))
            )
            .catch(() => 0),
          contract
            .getTtlRabDstrbtd()
            .then((val: ethers.BigNumberish) =>
              parseFloat(formatUnits(val, 18))
            )
            .catch(() => 0),
          contract
            .getTtllvlDstrbtd()
            .then((val: ethers.BigNumberish) =>
              parseFloat(formatUnits(val, 18))
            )
            .catch(() => 0),
        ]);

        const totalPool = ltgValue + rtgValue + ldpValue;
        // setTotalPoolValue(totalPool.toFixed(4));

        // console.log("Pool values:", {
        //   ltgValue,
        //   rtgValue,
        //   ldpValue,
        //   totalPool,
        // });

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

              const count = rankData.cnt;
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

  useEffect(() => {
    const fetchRankCounts = async () => {
      if (!isConnected || !walletProvider || !isProviderReady) {
        console.warn("Wallet not connected or provider not ready");
        return;
      }

      setIsLoading(true);

      try {
        const ethersProvider = new BrowserProvider(walletProvider);
        const signer = await ethersProvider.getSigner();
        const contract = new Contract(contractAddress, contractAbi, signer);

        const updatedRankCounts: Record<string, number> = {};
        await Promise.all(
          ranks.map(async (rank) => {
            try {
              const rankStatus = await contract.rUC(rank.index);
              const count = Number(rankStatus);
              updatedRankCounts[rank.name] = count;
              // console.log(`Rank: ${rank.name}, Count: ${count}`);
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

  // Add these state variables at the beginning of your Dashboard component
  const [addressToBlacklist, setAddressToBlacklist] = useState("");
  const [isBlacklistProcessing, setIsBlacklistProcessing] = useState(false);

  // Add this function to handle blacklisting
  const handleBlacklist = async () => {
    if (!walletProvider) {
      console.warn("Wallet not connected or provider not ready");
      return;
    }
    if (isAddress(addressToBlacklist)) {
      toast.error("Please enter a valid address");
      return;
    }

    try {
      setIsBlacklistProcessing(true);
      const provider = new BrowserProvider(walletProvider);
      const signer = await provider.getSigner();
      const contract = new Contract(contractAddress, contractAbi, signer);

      const tx = await contract.blacklistAddress(addressToBlacklist);
      await tx.wait();

      toast.success("Address has been blacklisted successfully!");
      setAddressToBlacklist("");
    } catch (error) {
      console.error("Error blacklisting address:", error);
      toast.error("Failed to blacklist address");
    } finally {
      setIsBlacklistProcessing(false);
    }
  };

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
    // console.log(handleRankSelection);
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
    //console.log("menu", menuOpen);

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);

      // document.body.style.overflow = "unset";
    };
  }, [menuOpen]);

  // const [selectedRankPriceUSD, setSelectedRankPriceUSD] = useState<number>(0); // Store USD price
  // const [selectedRankPriceITC, setSelectedRankPriceITC] = useState<number>(0); // Store ITC price

  // if(!selectedRankPriceUSD && !selectedRankPriceITC){
  //   console.log("err");
  // }
  // const handleRankSelection = (
  //   rank: string,
  //   priceUSD: number,
  //   priceITC: number
  // ) => {
  //   setSelectedRank(rank);
  //   setSelectedRankPriceUSD(priceUSD);
  //   setSelectedRankPriceITC(priceITC);
  //   setDropdownOpen(false);
  // };

  const closeToastManually = () => {
    toast.dismiss();
  };

  interface StatCardProps {
    icon: any;
    value: string | number;
    label: string;
    gradient: string;
  }

  const [expandedRank, setExpandedRank] = useState<string | null>(null);
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});
  const handleCopy = async (address: string, key: string) => {
    // console.log(currentMonthIndex);
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

  const RankSection: React.FC<RankSectionProps> = ({
    rank,
    addresses,
    expanded,
    onToggle,
    onCopy,
    copiedStates,
  }) => (
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
                  {addresses.map((addr, idx) => (
                    <li
                      key={idx}
                      className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 rounded-full ring-2 ring-gray-200 dark:ring-gray-700 bg-gray-100 dark:bg-gray-600" />
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
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

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
    <>
      {!isConnected ? (
        navigate("/")
      ) : (
        <div className="relative">
          <ToastContainer
            onClick={closeToastManually}
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Global Users Counter (Not inside StatCard) */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl p-6 backdrop-blur-xl border border-white/10 shadow-xl"
              >
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                    Global User Count <span className="text-2xl">🌍</span>
                  </h2>
                  <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {usrCnt !== null ? count : "Loading..."}
                    <span className="text-purple-500">+</span>
                  </p>
                </div>
              </motion.div>

              {/* Bonus Stat Cards */}
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
                              src={previewImage || userData?.avatar}
                              alt="Profile"
                              className="w-24 h-24 object-cover rounded-full border-2 border-white/80"
                              onError={(e) => {
                                console.error("Image failed to load:", e);
                                e.currentTarget.src = ""; // Clear the source on error
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
                  <Card className="relative overflow-hidden bg-slate-900/80 backdrop-blur-sm rounded-3xl border border-slate-800/50 p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="p-3 rounded-xl bg-purple-500/10">
                        <Trophy className="w-8 h-8 text-purple-400" />
                      </div>
                      <h3 className="lg:text-xl font-bold text-purple-400">
                        Blacklist Address
                      </h3>
                    </div>

                    <div className="space-y-6 lg:space-y-8 lg:mt-4 lg:mb-4 ">
                      <input
                        type="text"
                        value={addressToBlacklist}
                        onChange={(e) => setAddressToBlacklist(e.target.value)}
                        placeholder="Enter address to blacklist"
                        className="w-full px-6 py-4 rounded-xl text-lg bg-slate-800/50 border border-slate-700/50 
            text-gray-200 placeholder:text-gray-500
            focus:outline-none focus:ring-2 focus:ring-purple-500/20 
            hover:bg-slate-800/70 transition-all duration-300"
                      />

                      <button
                        onClick={handleBlacklist}
                        disabled={
                          isBlacklistProcessing ||
                          !addressToBlacklist ||
                          !ethers.isAddress(addressToBlacklist)
                        }
                        className={`w-full py-4 rounded-xl text-lg font-medium transition-all duration-300
            ${
              !isBlacklistProcessing &&
              addressToBlacklist &&
              ethers.isAddress(addressToBlacklist)
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:opacity-90"
                : "bg-slate-700/50 text-gray-400 cursor-not-allowed"
            }`}
                      >
                        {isBlacklistProcessing ? (
                          <div className="flex items-center justify-center gap-3">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
                            <span className="text-lg">Processing...</span>
                          </div>
                        ) : (
                          "Blacklist Address"
                        )}
                      </button>
                    </div>
                  </Card>

                  {/* RAB Card */}
                  <div className="relative group overflow-hidden rounded-3xl border border-white/20 shadow-lg h-full">
                    <div className="absolute inset-0  bg-gradient-to-br from-blue-600/20 to-cyan-600/20  group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 backdrop-blur-xl" />
                    <div className="relative p-8 flex flex-col items-center justify-center h-full">
                      <div className="mb-6">
                        <div className="relative">
                          <div className="absolute -inset-1  rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt" />
                          <Wallet className="w-16 h-16 text-blue-600 relative transform group-hover:scale-110 transition-transform duration-300" />
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                        Total RAB
                      </h3>
                      <div className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                        {totalRab}
                      </div>
                    </div>
                  </div>

                  {/* Lifetime Growth Bonus Card */}
                  <div className="relative group overflow-hidden rounded-3xl border border-white/20 shadow-lg h-full">
                    <div className="absolute inset-0  bg-gradient-to-br from-blue-600/20 to-cyan-600/20  group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 backdrop-blur-xl" />
                    <div className="relative p-8 flex flex-col items-center justify-center h-full">
                      <div className="mb-6">
                        <div className="relative">
                          <div className="absolute -inset-1  group-hover:scale-105 transition-transform duration-500" />
                          <CreditCard className="w-16 h-16 text-blue-600 relative transform group-hover:scale-110 transition-transform duration-300" />
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                        Monthly RAB Pool
                      </h3>
                      <div className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                        {monthlyRab === "Loading..."
                          ? "Loading..."
                          : monthlyRab}
                      </div>
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
                      Global Bonus
                    </h3>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                      {isConnected ? totalInvestment : "0"}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-white/70">
                      Total Earnings
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* User Details Card - Adjusted size */}
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-2xl shadow-lg">
                  <h2 className="text-2xl font-bold mb-2 flex items-center space-x-3">
                    <User className="w-8 h-8" />
                    <span>Elite Ranks - Monthly Eligible Addresses</span>
                  </h2>
                  <p className="opacity-80 text-sm">
                    Explore and manage eligible addresses across elite rank
                    tiers
                  </p>
                </div>

                {eliteRanks.map((rank) => (
                  <RankSection
                    key={rank.name}
                    rank={rank}
                    addresses={rankAddresses[rank.name] || []}
                    expanded={expandedRank === rank.name}
                    onToggle={() =>
                      setExpandedRank(
                        expandedRank === rank.name ? null : rank.name
                      )
                    }
                    onCopy={handleCopy}
                    copiedStates={copiedStates}
                  />
                ))}
              </div>

              {/* Teams Ranks Progression Card - Enhanced dark mode and effects */}
              <div className="md:col-span-2 rounded-3xl relative overflow-hidden group h-full">
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
                      Teams Ranks Progression
                    </h2>
                  </div>

                  <div className="w-full overflow-x-auto rounded-xl p-2 sm:p-4">
                    <div className="min-w-[300px] sm:min-w-[355px] h-[300px] sm:h-[500px]">
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
                                maxRotation: 30,
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
                                gradient.addColorStop(
                                  0,
                                  "rgba(56, 189, 248, 1)"
                                ); // Brighter Cyan
                                gradient.addColorStop(
                                  1,
                                  "rgba(59, 130, 246, 1)"
                                ); // Brighter Blue
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
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full space-y-4 sm:space-y-6">
              <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-3">
                {/* Enhanced Referral Link Section */}

                {/* Enhanced Rank Update Section */}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;
