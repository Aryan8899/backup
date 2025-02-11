import { useEffect, useState, useRef } from "react";
import { useDarkMode } from "../components/DarkModeContext";
import multiavatar from "@multiavatar/multiavatar";
import { usePriceData } from "../components/PriceContext.tsx";
import { useWeb3ModalAccount } from "@web3modal/ethers5/react";
import axios from "axios"; // Import axios for making HTTP requests
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BigNumber, constants } from "ethers";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import contractAbi from "./Props/contractAbi.ts"; // Adjust path as needed
import contractAddress from "./Props/contractAddress.ts"; // Adjust path as needed
// At the top of your component, modify the imports and provider handling
import { useWeb3ModalProvider } from "@web3modal/ethers5/react"; // Add this import if not present
import { Bar } from "react-chartjs-2";
import {
  CheckCheck,
  Copy,
  User,
  Award,
  Trophy,
  Info,
  TrendingUp,
  Gift,
  Calendar,
  DollarSign,
  Clock,
  Link,
  Activity,
  ChevronDown,
  Share2,
  Sparkles,
  ArrowUpCircle,
} from "lucide-react";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use"; // Helps adjust confetti to screen size

import * as Tooltip from "@radix-ui/react-tooltip";
import { cn } from "../../components/lib/utils";
import { Camera } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/components/ui/dialog";
import { Button } from "../../components/components/ui/button";
import { Input } from "../../components/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/components/ui/card";

import { motion } from "framer-motion";

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
}

interface ProfileSectionProps {
  address?: string;
  className?: string;
}

const Dashboard = () => {
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [rankMessage, setRankMessage] = useState("");
  const [showMarquee, setShowMarquee] = useState(false);
  const [isRankExpired, setIsRankExpired] = useState(false);
  const { priceData } = usePriceData();
  const [avatarSVG, setAvatarSVG] = useState<string>("");
  const { darkMode } = useDarkMode();
  const [backgroundKey, setBackgroundKey] = useState(
    darkMode ? "dark" : "light"
  );
  const [newNickname, setNewNickname] = useState("");
  const [userData, setUserData] = useState<{
    nickname: string;
    referralQR: string;
    profileImage?: string;
    address?: string;
  } | null>(null);
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

  useEffect(() => {
    console.log("Dark Mode Changed, Re-rendering Background");
    setBackgroundKey(darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    const timeout = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    console.log(totalInvestment, qrCodeUrl);
    const registerUser = async (address: string) => {
      try {
        const response = await axios.get(
          `https://itcback-production.up.railway.app/api/users/${address}`
        );

        const user = response.data.data;
        setUserData({
          nickname: user.nickname,
          referralQR: user.referralQR,
          profileImage: user.profileImage,
          address: address, // Add this line
        });

        // Keep your existing QR code URL setting
        const url = `https://res.cloudinary.com/dygw3ixdr/image/upload/v1737705516/qr-codes/${address}.png`;
        setQrCodeUrl(url);
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Failed to load user data");
      }
    };

    if (address) {
      registerUser(address);
    }
  });

  const handleUpdateNickname = async () => {
    if (!address) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      const response = await axios.put(
        `https://itcback-production.up.railway.app/api/users/update`,
        {
          nickname: newNickname,
          address: address,
        }
      );

      if (response.data.success) {
        setUserData((prev) =>
          prev
            ? {
                ...prev,
                nickname: newNickname,
              }
            : null
        );
        toast.success("Nickname updated successfully");
        setShowNicknameModal(false);
      }
    } catch (error) {
      console.error("Error updating nickname:", error);
      toast.error("Failed to update nickname");
    }
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Add this section for preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);

    setIsUploading(true);

    if (!address) {
      toast.error("Wallet address not found. Cannot upload the image.");
      setIsUploading(false);
      setPreviewImage(null);
      return;
    }

    try {
      // Upload image to Cloudinary
      const cloudinaryUploadUrl = `https://api.cloudinary.com/v1_1/<your-cloud-name>/image/upload`;
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "<your-upload-preset>"); // Replace with your Cloudinary preset

      const cloudinaryResponse = await axios.post(
        cloudinaryUploadUrl,
        formData
      );

      const cloudinaryImageUrl = cloudinaryResponse.data.secure_url;

      // Store Cloudinary image URL in backend
      const backendResponse = await axios.post(
        "https://itcback-production.up.railway.app/api/users/upload-image",
        { imageUrl: cloudinaryImageUrl, address: address },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (backendResponse.data.success) {
        setUserData((prev) =>
          prev ? { ...prev, profileImage: cloudinaryImageUrl } : null
        );
        toast.success("Profile image updated successfully");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
      setPreviewImage(null); // Reset preview if upload fails
    } finally {
      setIsUploading(false);
    }
  };

  interface RankTotals {
    [key: string]: string; // This allows string indexing
  }

  interface RankData {
    cnt: ethers.BigNumber;
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
  const { address, isConnected } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();
  const [isProviderReady, setIsProviderReady] = useState(false);
  const [inviteLink, setInviteLink] = useState(
    `https://cryptomx.site/#/register?referral=undefined`
  );
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    console.log(error, withdrawalRab);
    const fetchAddress = async () => {
      //console.log(withdrawalRab);
      if (walletProvider) {
        try {
          const provider = new ethers.providers.Web3Provider(walletProvider);
          const signer = provider.getSigner();
          const address = await signer.getAddress(); // Get connected wallet address
          // console.log("the address is", address);
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

  const currentRankIndex = ranks.findIndex(
    (rank) => rank.name === userDetails?.currentRank
  );

  // Filtered ranks greater than the user's current rank
  const filteredRanks = ranks.filter((rank) => rank.index > currentRankIndex);

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

  const darkenColor = (hex: string, amount: number) => {
    let usePound = false;
    if (hex[0] === "#") {
      hex = hex.slice(1);
      usePound = true;
    }

    let num = parseInt(hex, 16);
    let r = (num >> 16) + amount;
    let g = ((num >> 8) & 0x00ff) + amount;
    let b = (num & 0x0000ff) + amount;

    r = Math.min(255, Math.max(0, r));
    g = Math.min(255, Math.max(0, g));
    b = Math.min(255, Math.max(0, b));

    return (
      (usePound ? "#" : "") +
      ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)
    );
  };

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
        const baseCounts = [];
        const cubeCounts = [];

        // Recursive function to fetch referrals up to 12 levels deep
        const getReferralCounts = async (
          userAddress: any,
          level = 1,
          maxLevel = 12,
          rankIndex: any
        ) => {
          if (level > maxLevel) return 0;

          try {
            const referrals = await contract.getUserReferrals(userAddress);
            let rankCount = 0;

            for (const referral of referrals) {
              const userDetails = await contract.uS(referral);
              if (userDetails.currentRank.toNumber() === rankIndex) {
                rankCount++;
              }
              rankCount += await getReferralCounts(
                referral,
                level + 1,
                maxLevel,
                rankIndex
              );
            }

            return rankCount;
          } catch (error) {
            console.error(
              `Error fetching referrals for ${userAddress}:`,
              error
            );
            return 0;
          }
        };

        // Update the rank loop to use the modified function:
        for (let rank of allRanks) {
          try {
            const rankStatus = await contract.getUserReferralRankCount(
              address,
              rank.index
            );
            let count = rankStatus.toNumber();
            count += await getReferralCounts(address, 1, 12, rank.index);

            activeRanks.push(rank);
            userCounts.push(count);
            baseCounts.push(count * 0.9);
            cubeCounts.push(count * 0.1);
          } catch (error) {
            console.error(`Error fetching data for rank ${rank.name}:`, error);
            activeRanks.push(rank);
            userCounts.push(0);
          }
        }

        // Generate graph data
        const graphData = {
          labels: activeRanks.map((rank) => rank.name),
          datasets: [
            {
              label: "Number of Users",
              data: userCounts,
              backgroundColor: activeRanks.map((rank) => rank.color + "80"),
              borderColor: activeRanks.map((rank) =>
                rank.color === "#000000"
                  ? "#111111"
                  : darkenColor(rank.color, -30)
              ),
              borderWidth: 2,
              borderRadius: {
                topLeft: 8,
                topRight: 8,
                bottomLeft: 0,
                bottomRight: 0,
              },
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

      // console.log("with", withdrawalBonus);

      // Format the data
      // setWithdrawalBonus(
      //   parseFloat(
      //     ethers.utils.formatEther(withdrawalBonusData || "0")
      //   ).toFixed(4)
      // );
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

      console.log(
        "the value issssss:",
        ethers.utils.formatEther(withdrawalLevelData || "0")
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
      const ethersProvider = new ethers.providers.Web3Provider(walletProvider);
      const signer = ethersProvider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        contractAbi,
        signer
      );

      console.log("before");
      const tx = await contract.withdrawLevelIncome(); // Level Distribution Pool withdrawal function
      await tx.wait();

      console.log("After ");

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

  const handleWithdrawRab = async () => {
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
      setWithdrawalRab(
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
      console.error("Error during RAB withdrawal:", error);
      toast.error("Failed to withdraw RAB .");
    } finally {
      setIsLoadingRab(false);
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

        // Fetch user data
        const userData = await contract.users(address);
        // console.log("Raw user data:", userData);

        const formatTimestamp = (timestamp: BigNumber): string => {
          if (timestamp.eq(constants.MaxUint256)) {
            return "Never";
          }
          const timestampInt = parseInt(timestamp.toString(), 10);
          return timestampInt > 0
            ? new Date(timestampInt * 1000).toLocaleDateString()
            : "Not updated";
        };

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
          parseFloat(ethers.utils.formatEther(totalBonusData || "0")) +
          parseFloat(ethers.utils.formatEther(totalRABData || "0")) +
          parseFloat(ethers.utils.formatEther(totalLevelData || "0"));

        console.log("the total is", total);
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

        // Extract the necessary details
        const expectedTime = userData[2]; // Expected time (e.g., last rank update time)
        const expiryTime = userData[3]; // Expiry time
        // Ensure current time is an integer before creating a BigNumber
        const currentTime = BigNumber.from(Math.floor(Date.now() / 1000)); // Use Math.floor to remove decimals

        // Compute active/inactive status
        const isActive =
          currentTime.gte(expectedTime) && currentTime.lt(expiryTime);
        const isExpired = currentTime.gt(expiryTime);

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
          rewards: total.toString(),
        };

        console.log("Formatted user data:::::", formattedData);
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
      const currentTime = Date.now();
      const oneHourBeforeExpiry = expiryTime - 60 * 60 * 1000;

      if (currentTime > expiryTime) {
        setIsRankExpired(true);
      } else {
        setIsRankExpired(false);
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
    console.log(handleRankSelection);
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

  const closeToastManually = () => {
    toast.dismiss();
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
            <div className="text-3xl font-bold text-white tracking-tight">
              {value}
              <span className="text-purple-300 ml-1">+</span>
            </div>
            <div className="text-sm font-medium text-white/80 mt-1">
              {label}
            </div>
          </div>
        </div>

        {/* Circular Background Glow */}
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
                          {previewImage || userData?.profileImage ? (
                            <img
                              src={previewImage || userData?.profileImage}
                              alt="Profile"
                              className="w-24 h-24 object-cover rounded-full border-2 border-white/80"
                            />
                          ) : (
                            <div className="w-24 h-24 rounded-full border-2 border-white/80 flex items-center justify-center bg-gray-800">
                              <User className="w-12 h-12 text-white/80" />
                            </div>
                          )}

                          {/* Camera Icon Overlay */}
                          <button
                            onClick={() => fileInputRef.current?.click()}
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
                          <Button onClick={handleUpdateNickname}>
                            Save Changes
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  {/* Level Bonus Card */}
                  <div className="relative group overflow-hidden rounded-3xl border border-white/20 shadow-lg">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 to-teal-600/20 group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 backdrop-blur-xl" />
                    <div className="relative p-8">
                      <div className="flex items-center gap-3 mb-6">
                        <Trophy className="w-6 h-6 text-emerald-500" />
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                          Level Bonus
                        </h3>
                      </div>

                      {!isConnected ? (
                        <div className="text-center text-gray-600 dark:text-white/70">
                          Connect wallet to view
                        </div>
                      ) : isLoadingLevel ? (
                        <div className="text-center text-gray-600 dark:text-white/70">
                          Loading...
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div>
                            <span className="text-sm text-gray-600 dark:text-white/70">
                              Withdrawal Level:
                            </span>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                              {withdrawalLevel}
                            </div>
                            <button
                              onClick={handleWithdrawLevel}
                              className="mt-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg
                        hover:from-emerald-600 hover:to-teal-600 transform transition-all duration-300 
                        hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
                            >
                              Withdraw
                            </button>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600 dark:text-white/70">
                              Total Level:
                            </span>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                              {totalLevel}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* RAB Card */}
                  <div className="relative group overflow-hidden rounded-3xl border border-white/20 shadow-lg">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-600/20 to-orange-600/20 group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 backdrop-blur-xl" />
                    <div className="relative p-8">
                      <div className="flex items-center gap-3 mb-6">
                        <Award className="w-6 h-6 text-amber-500" />
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                          Rank Achievement
                        </h3>
                      </div>

                      {!isConnected ? (
                        <div className="text-center text-gray-600 dark:text-white/70">
                          Connect wallet to view
                        </div>
                      ) : isLoadingRab ? (
                        <div className="text-center text-gray-600 dark:text-white/70">
                          Loading...
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div>
                            <span className="text-sm text-gray-600 dark:text-white/70">
                              Withdrawal RAB:
                            </span>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                              {withdrawalRAB}
                            </div>
                            <button
                              onClick={handleWithdrawRab}
                              className="mt-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg
                        hover:from-amber-600 hover:to-orange-600 transform transition-all duration-300 
                        hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
                            >
                              Withdraw
                            </button>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600 dark:text-white/70">
                              Total RAB:
                            </span>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                              {totalRAB}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Lifetime Growth Bonus Card */}
                  <div className="relative group overflow-hidden rounded-3xl border border-white/20 shadow-lg">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-cyan-600/20 group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 backdrop-blur-xl" />
                    <div className="relative p-8">
                      <div className="flex items-center gap-3 mb-6">
                        <TrendingUp className="w-6 h-6 text-blue-500" />
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                          Growth Bonus
                        </h3>
                      </div>

                      {!isConnected ? (
                        <div className="text-center text-gray-600 dark:text-white/70">
                          Connect wallet to view
                        </div>
                      ) : isLoading ? (
                        <div className="text-center text-gray-600 dark:text-white/70">
                          Loading...
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600 dark:text-white/70">
                                On Hold Bonus:
                              </span>
                              <Tooltip.Provider>
                                <Tooltip.Root>
                                  <Tooltip.Trigger asChild>
                                    <Info className="w-4 h-4 text-blue-500 cursor-help" />
                                  </Tooltip.Trigger>
                                  <Tooltip.Portal>
                                    <Tooltip.Content className="bg-white/10 backdrop-blur-md p-2 z-50 rounded-lg border border-white/20 text-white text-sm">
                                      Transfers after two referrals
                                      <Tooltip.Arrow className="fill-white/20" />
                                    </Tooltip.Content>
                                  </Tooltip.Portal>
                                </Tooltip.Root>
                              </Tooltip.Provider>
                            </div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                              {totalPendingAmount}
                            </div>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600 dark:text-white/70">
                              Total Bonus:
                            </span>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                              {totalBonus}
                            </div>
                          </div>
                        </div>
                      )}
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
                      Total Rewards
                    </h3>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                      {Number(userDetails?.rewards).toFixed(2) || "0.00"}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-white/70">
                      Total Earnings
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              {/* User Details Card - Adjusted size */}
              <Card className="md:col-span-4 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-800/80 to-cyan-600/20 group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 backdrop-blur-xl" />

                <div className="relative z-10">
                  <CardHeader className="pb-8">
                    <div className="flex flex-col items-center justify-center w-full">
                      <div className="relative group mb-6 transform hover:scale-105 transition-all duration-300">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full blur-lg opacity-75 group-hover:opacity-100 transition duration-700 animate-pulse" />
                        <div className="relative p-5 bg-slate-900/90 rounded-full ring-2 ring-white/20 hover:ring-white/40 transition-all duration-300">
                          <User className="h-10 w-10 text-cyan-400" />
                        </div>
                      </div>
                      <CardTitle className="text-3xl font-bold text-center">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 animate-gradient">
                          User Details
                        </span>
                      </CardTitle>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        {
                          icon: Link,
                          label: "Referrer",
                          value: userDetails?.referrer
                            ? `${userDetails.referrer.slice(
                                0,
                                6
                              )}...${userDetails.referrer.slice(-4)}`
                            : "N/A",
                        },
                        {
                          icon: Award,
                          label: "Current Rank",
                          value: userDetails?.currentRank,
                        },
                        {
                          icon: Clock,
                          label: "Last Update",
                          value: userDetails?.lastRankUpdateTime,
                        },
                        {
                          icon: Calendar,
                          label: "Rank Expiry",
                          value: !isRankExpired ? (
                            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-gradient-to-r from-red-500/10 to-red-600/10 animate-pulse border border-red-500/20">
                              <span className="text-red-500 animate-bounce">
                                ⚠️
                              </span>
                              <span className="font-extrabold tracking-wider bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">
                                RANK EXPIRED
                              </span>
                            </span>
                          ) : (
                            userDetails?.rankExpiryTime
                          ),
                        },
                        {
                          icon: DollarSign,
                          label: "Total Purchase",
                          value:
                            Number(userDetails?.totalInvestment).toFixed(2) ||
                            "0.00",
                        },
                        {
                          icon: Activity,
                          label: "Status",
                          value: userDetails?.isActive ? "Active" : "Inactive",
                        },
                      ].map((item, index) => (
                        <div
                          key={index}
                          className="relative group p-4 rounded-2xl border border-white/10 
                bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl
                hover:from-slate-800/80 hover:to-slate-900/80
                transition-all duration-500 ease-out
                hover:border-white/20 hover:shadow-2xl
                hover:transform hover:scale-105"
                        >
                          <h4 className="flex items-center gap-3 text-sm font-medium text-slate-200">
                            <div className="p-2 rounded-xl bg-slate-800/90 ring-1 ring-white/10 group-hover:ring-white/20 transition-all duration-300">
                              <item.icon className="h-4 w-4 text-cyan-400" />
                            </div>
                            {item.label}
                          </h4>
                          <p className="mt-3 font-mono text-sm text-white/90 font-medium">
                            {item.value || "N/A"}
                          </p>
                          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-all duration-700" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </div>
              </Card>

              {/* Teams Ranks Progression Card - Enhanced dark mode and effects */}
              <div className="md:col-span-8 rounded-3xl relative overflow-hidden group h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-800/90 to-slate-900/90 dark:from-slate-800/95 dark:to-slate-900/95" />

                <div
                  className="relative p-6 backdrop-blur-xl border-2 border-gray-300/10 dark:border-green-600/20 
          shadow-xl dark:shadow-slate-900/50 hover:shadow-2xl transition-all duration-500 h-full"
                >
                  <div className="flex justify-center items-center mb-6">
                    <h2
                      className="font-bold text-xl md:text-2xl bg-gradient-to-r 
              from-slate-100 to-slate-300 dark:from-white dark:to-gray-300 
              bg-clip-text text-transparent transition-colors duration-300"
                    >
                      Teams Ranks Progression
                    </h2>
                  </div>

                  <div className="w-full overflow-x-auto rounded-xl bg-slate-800/40 p-4">
                    <div className="min-w-[355px] h-[400px]">
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
                                  weight: "bold",
                                  family: "'Inter', sans-serif",
                                },
                                color: "#FFFFFF",
                                padding: 10,
                              },
                              title: {
                                display: true,
                                text: "Number of Users",
                                font: {
                                  size: 14,
                                  weight: "bold",
                                  family: "'Inter', sans-serif",
                                },
                                color: "#FFFFFF",
                                padding: 12,
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
                                  size: 10,
                                  weight: "bold",
                                  family: "'Inter', sans-serif",
                                },
                                color: "#FFFFFF",
                                padding: 8,
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
                              backgroundColor: (context) => {
                                const ctx = context.chart.ctx;
                                const gradient = ctx.createLinearGradient(
                                  0,
                                  0,
                                  0,
                                  300
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
                              borderRadius: 8,
                              borderWidth: 0,
                              hoverBackgroundColor: (context) => {
                                const ctx = context.chart.ctx;
                                const gradient = ctx.createLinearGradient(
                                  0,
                                  0,
                                  0,
                                  300
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

            <div className="w-full space-y-6">
              <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
                {/* Enhanced Referral Link Section */}
                <Card
                  className="relative overflow-hidden group p-6 rounded-3xl border-2 border-gray-200/20 
          bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-800 dark:to-slate-900
          hover:shadow-2xl hover:border-blue-500/20 transition-all duration-500"
                >
                  {/* Animated background effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                        <Share2 className="w-5 h-5" />
                      </div>
                      <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                        Referral Link
                      </h3>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-6">
                      <div className="relative group/qr">
                        <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur-lg opacity-0 group-hover/qr:opacity-20 transition-opacity duration-500" />
                        <img
                          src={userData?.referralQR}
                          alt="QR Code"
                          className="w-32 h-32 rounded-xl border-2 border-white/10 shadow-lg transition-transform duration-300 group-hover/qr:scale-105"
                        />
                      </div>

                      <div className="flex flex-col gap-3 w-full">
                        <div className="relative">
                          <input
                            className="w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 rounded-xl border border-gray-200/20 
                    focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/20 transition-all duration-300
                    text-sm font-medium backdrop-blur-sm"
                            value={inviteLink}
                            readOnly
                          />
                          <button
                            onClick={copyToClipboard}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg
                    bg-gradient-to-r from-blue-500 to-cyan-500 text-white
                    hover:from-blue-600 hover:to-cyan-600 transition-all duration-300
                    focus:ring-2 focus:ring-blue-500/20"
                          >
                            {isCopied ? (
                              <CheckCheck className="w-4 h-4" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Share your referral link to grow your community and
                          earn rewards
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Enhanced Rank Update Section */}
                <Card
                  className="relative overflow-visible group p-6 rounded-3xl border-2 border-gray-200/20 
    bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-800 dark:to-slate-900
    hover:shadow-2xl hover:border-purple-500/20 transition-all duration-500"
                >
                  {/* Animated background effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                          <Trophy className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                          Rank Upgrade
                        </h3>
                      </div>

                      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10">
                        <Sparkles className="w-4 h-4 text-purple-500" />
                        <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                          {userDetails?.currentRank || "Loading..."}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Enhanced Dropdown */}
                      <div className="relative">
                        <button
                          onClick={() => setDropdownOpen((prev) => !prev)}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200/20 
            bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm
            hover:bg-white/70 dark:hover:bg-slate-800/70
            focus:ring-2 focus:ring-purple-500/20 
            transition-all duration-300
            flex items-center justify-between"
                        >
                          <span className="text-sm font-medium">
                            {selectedRank || "Select your rank"}
                          </span>
                          <ChevronDown
                            className={`w-4 h-4 transition-transform duration-300 ${
                              dropdownOpen ? "rotate-180" : ""
                            }`}
                          />
                        </button>

                        {dropdownOpen && (
                          <>
                            <div
                              className="fixed inset-0 z-30"
                              onClick={() => setDropdownOpen(false)}
                            />
                            <div
                              className="absolute z-40 w-full mt-2 py-2 rounded-xl border border-gray-200/20 
                bg-white/90 dark:bg-slate-800/90 backdrop-blur-md shadow-xl
                max-h-64 overflow-y-auto"
                            >
                              {filteredRanks.map((rank, index) => {
                                const currentRankDetail = rankDetails.find(
                                  (detail) =>
                                    detail.name === userDetails?.currentRank &&
                                    detail.rankUpgradePriceUSD !== undefined
                                );

                                const targetRankDetail = rankDetails.find(
                                  (detail) =>
                                    detail.name === rank.name &&
                                    detail.rankUpgradePriceUSD !== undefined
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
                                  priceDifferenceUSD && priceData?.TUSDTperTITC
                                    ? (
                                        priceDifferenceUSD *
                                        Number(priceData?.TUSDTperTITC)
                                      ).toFixed(4)
                                    : "Loading...";

                                return (
                                  <div
                                    key={index}
                                    onClick={() => {
                                      setSelectedRank(rank.name);
                                      setDropdownOpen(false);
                                    }}
                                    className="px-4 py-3 hover:bg-purple-50 dark:hover:bg-purple-900/20 
                      cursor-pointer transition-colors duration-200"
                                  >
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="font-medium text-purple-600 dark:text-purple-400">
                                        {rank.name}
                                      </span>
                                      <ArrowUpCircle className="w-4 h-4 text-purple-500" />
                                    </div>
                                    <div className="space-y-1 text-sm text-gray-500 dark:text-gray-400">
                                      <div className="flex justify-between">
                                        <span>Upgrade Cost:</span>
                                        <span className="font-medium">
                                          ${priceDifferenceUSD.toFixed(2)} USD
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>ITC Price:</span>
                                        <span className="font-medium">
                                          {priceDifferenceITC} ITC
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </>
                        )}
                      </div>

                      {/* Enhanced Upgrade Button */}
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
                        className={`w-full px-6 py-3 rounded-xl font-medium
          transition-all duration-300 transform hover:scale-[1.02]
          ${
            selectedRank &&
            (parseFloat(userDetails?.rewards || "0") >= selectedRankPriceUSD ||
              parseFloat(userDetails?.rewards || "0") >= selectedRankPriceITC)
              ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:from-purple-700 hover:to-pink-700"
              : "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
          }`}
                      >
                        Upgrade Rank
                      </button>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;
