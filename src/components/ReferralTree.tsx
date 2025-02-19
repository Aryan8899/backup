import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import {
  useWeb3ModalAccount,
  useWeb3ModalProvider,
} from "@web3modal/ethers5/react";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import FeaturesSection from "../components/FeaturesSection";
import Light from "../components/Light";
import { useDarkMode } from "../components/DarkModeContext";
import contractAbi from "./Props/contractAbi.ts";
import contractAddress from "./Props/contractAddress.ts";
import "../index.css";
import axios from "axios";
import SimpleBar from "simplebar-react";
import "simplebar/dist/simplebar.min.css";
import multiavatar from "@multiavatar/multiavatar";
import { useNavigate } from "react-router-dom";

interface ReferralNode {
  address: string;
  rank: string;
  referrals: ReferralNode[];
}

// interface UserDetails {
//   avatar: string;
//   nickname: string;
// }

const ReferralTree = () => {
  const navigate = useNavigate();
  const { darkMode } = useDarkMode();
  const { address, isConnected } = useWeb3ModalAccount();
  const { address: userAddress } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();
  const [treeData, setTreeData] = useState<ReferralNode | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [isScrollable, setIsScrollable] = useState(false);
  const [userDetails, setUserDetails] = useState<
    Record<string, { avatar: string; nickname: string }>
  >({});
  const [isProviderReady, setIsProviderReady] = useState(false);
  const [userData, setUserData] = useState<{
    nickname: string;
    avatar: string;
  } | null>(null);
  //const [avatarSVG, setAvatarSVG] = useState<string>("");
  const [isInitialized, setIsInitialized] = useState(false);

  // Memoize heavy functions
  const fetchUserDetails = useCallback(async (address: string) => {
    try {
      if (!ethers.utils.isAddress(address)) {
        return {
          avatar: "",
          nickname: "Unknown"
        };
      }
      console.log("new one is")
      const response = await axios.get(
        `https://server.cryptomx.site/api/users/${address}`
      );
  
      const user = response.data.data;
      console.log("new is the api",user)
      return {
         avatar: user.avatar || "",
        nickname: user.nickname || "Unknown",
      };

      console.log(userData,isProviderReady,isScrollable)
    } catch (error) {
      console.error(`Error fetching user details for ${address}:`, error);
      if (axios.isAxiosError(error) && error.response?.status !== 404) {
        console.error(`Error fetching user details for ${address}:`, error);
      }
      return {
        avatar: "",
        nickname: "Unknown",
      };
    }
  }, []);

  // Check registration status once on mount
  useEffect(() => {
    let mounted = true;

    const checkRegistration = async () => {
      if (!isConnected || !walletProvider || !address) return;

      try {
        const provider = new ethers.providers.Web3Provider(walletProvider);
        const contract = new ethers.Contract(
          contractAddress,
          contractAbi,
          provider
        );
        const userData = await contract.users(address);

        if (mounted) {
          if (!userData || !userData.isActive) {
            navigate("/");
          } else {
            setIsInitialized(true);
          }
        }
      } catch (error) {
        console.error("Registration check error:", error);
        if (mounted) navigate("/");
      }
    };
    

    checkRegistration();
    return () => {
      mounted = false;
    };
  }, [userAddress,isConnected,isInitialized, fetchUserDetails,walletProvider, address]);

  // Set provider ready state
  useEffect(() => {
    setIsProviderReady(!!walletProvider);
    if (userAddress && isInitialized) {
      const initUser = async () => {
        try {
          const response = await axios.get(
            `https://server.cryptomx.site/api/users/${userAddress}`
          );
          setUserData(response.data.data);
        } catch (error) {
          console.error("User data fetch error:", error);
        }
      };
      initUser();
    }

    
  }, [walletProvider,userAddress, isInitialized, fetchUserDetails]);

  // Handle user data initialization
  // useEffect(() => {
   
  // }, [userAddress, isInitialized]);

  const getRankName = (rankIndex: number) => {
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
    return ranks[rankIndex] || "Unknown Rank";
  };

  // Tree data loading
  useEffect(() => {
    let mounted = true;

    const loadTreeData = async () => {
      if (!userAddress || !walletProvider || !isInitialized) return;

      try {
        setIsLoading(true);
        const provider = new ethers.providers.Web3Provider(walletProvider);
        const contract = new ethers.Contract(
          contractAddress,
          contractAbi,
          provider
        );

        const fetchReferrals = async (
          address: string
        ): Promise<ReferralNode> => {
          const referrals = await contract.getUserReferrals(address);
          const userData = await contract.users(address);
          const rankIndex = Number(userData[0]?.toString() || "0");
          const rank = getRankName(rankIndex);

          const details = await fetchUserDetails(address);
          if (mounted) {
            setUserDetails((prev) => ({
              ...prev,
              [address]: details,
            }));
          }

          const referralNodes = await Promise.all(
            referrals.map((referral: any) => fetchReferrals(referral))
          );

          return { address, rank, referrals: referralNodes };
        };

        const tree = await fetchReferrals(userAddress);
        if (mounted) {
          setTreeData(tree);
          setIsScrollable(calculateTreeDepth(tree) > 3);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Tree data loading error:", error);
        if (mounted) {
          setError("Failed to load referral tree.");
          setIsLoading(false);
        }
      }
    };

    loadTreeData();
    return () => {
      mounted = false;
    };
  }, [userAddress, walletProvider, isInitialized, fetchUserDetails]);

  const toggleNodeExpansion = (address: string) => {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(address)) {
        newSet.delete(address);
      } else {
        newSet.add(address);
      }
      return newSet;
    });
  };

  const shortenAddress = (address: string) =>
    `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;

  const calculateTreeDepth = (node: ReferralNode | null, depth = 0): number => {
    if (!node || node.referrals.length === 0) return depth;
    return Math.max(
      ...node.referrals.map((child) => calculateTreeDepth(child, depth + 1))
    );
  };

  const renderTree = (node: ReferralNode, level = 0, index = 0) => {
    console.log(index);
    const hasChildren = node.referrals.length > 0;
    const isExpanded = expandedNodes.has(node.address);
    const details = userDetails[node.address];
    const avatarSVG = multiavatar(node.address);

    return (
      <div
        key={node.address}
        className="referral-node-container flex flex-col items-center"
      >
        <div className="flex flex-col items-center">
          {/* Updated Node Box */}
          <div
            onClick={() => toggleNodeExpansion(node.address)}
            className={`
              relative group cursor-pointer transition-all duration-300
              ${
                darkMode
                  ? "bg-gray-800/60 backdrop-blur-xl border border-gray-700/50 hover:border-cyan-500/50"
                  : "bg-white/60 backdrop-blur-xl border border-gray-200/50 hover:border-blue-500/50"
              }
              rounded-2xl p-4 shadow-lg hover:shadow-2xl
              flex flex-col items-center justify-center
              w-64
            `}
          >
            {/* Glow Effect */}
            <div
              className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-300 
                bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-cyan-500/10 rounded-2xl blur-lg"
            />

            {/* Content */}
            <div className="relative z-10">
              <img
                src={`data:image/svg+xml;utf8,${encodeURIComponent(avatarSVG)}`}
                alt="Avatar"
                className="w-20 h-20 rounded-full mx-auto mb-3 border-2 border-white/20 group-hover:scale-105 transition-transform"
              />
              <div className="text-center space-y-1">
                <div
                  className={`text-sm ${
                    darkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  {details?.nickname || "Unknown"}
                </div>
                <div
                  className={`font-bold ${
                    darkMode ? "text-white" : "text-gray-800"
                  }`}
                >
                  {shortenAddress(node.address)}
                </div>
                <div
                  className={`inline-block px-2 py-1 rounded-full text-xs font-medium
                  ${
                    darkMode
                      ? "bg-gray-700 text-cyan-400"
                      : "bg-blue-50 text-blue-600"
                  }`}
                >
                  Rank: {node.rank}
                </div>
                <div
                  className={`text-xs ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {node.referrals.length} Referrals
                </div>
              </div>
            </div>
          </div>

          {/* Keep existing connector logic */}
          {hasChildren && isExpanded && (
            <svg
              className="w-4 h-6 text-gray-400 my-2 dark:text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          )}
        </div>

        {/* Keep existing children container logic */}
        {hasChildren && isExpanded && (
          <div className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className="w-90 h-0.5 bg-gray-400"
                style={{
                  width: `${node.referrals.length * 10}px`,
                  minWidth: "100%",
                }}
              ></div>

              <div className="flex space-x-4 mt-2">
                {node.referrals.map((child) => (
                  <div
                    key={child.address}
                    className="flex flex-col items-center"
                  >
                    <div className="w-0.5 h-6 bg-gray-400"></div>
                    {renderTree(child, level + 1)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="fixed inset-0 -z-10">
        {darkMode ? <FeaturesSection /> : <Light />}
      </div>
      {!isConnected ? (
        navigate("/")
      ) : (
        <div className="min-h-screen  p-6">
          <SimpleBar className="w-full overflow-x-auto">
            <div className="min-w-max">
              {isLoading ? (
                <div className="flex justify-center items-center h-96">
                  <div className="absolute inset-0 backdrop-blur-sm bg-white/30 dark:bg-black/30" />

                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 20,
                    }}
                    className="relative z-50 flex flex-col items-center justify-center space-y-6"
                  >
                    {/* Logo Container */}
                    <div className="relative">
                      <motion.div
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        className="relative"
                      >
                        <img
                          src="https://cticlub.org/assets/images/brand/itclogow.png"
                          alt="ITC Club Logo"
                          className="h-32 w-auto rounded-xl shadow-lg"
                        />
                      </motion.div>
                    </div>

                    {/* Loading Indicator */}
                    <div className="flex items-center space-x-3">
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                          rotate: [0, 360],
                          borderRadius: ["50%", "20%", "50%"],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        className="w-12 h-12 border-4 border-blue-500 border-t-purple-500 rounded-full"
                      />
                      <span className="text-xl font-semibold text-gray-700 dark:text-gray-300">
                        Loading...
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: ["0%", "100%", "0%"],
                        transition: {
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        },
                      }}
                      className="w-64 h-1.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                    />
                  </motion.div>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center h-96 space-y-4">
                  <AlertTriangle className="w-24 h-24 text-red-500" />
                  <p className="text-xl text-red-500">{error}</p>
                </div>
              ) : treeData ? (
                <div className="flex flex-col items-center">
                  {renderTree(treeData)}
                </div>
              ) : (
                <div className="flex justify-center items-center h-96">
                  <p
                    className={`text-xl ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    No referral data available
                  </p>
                </div>
              )}
            </div>
          </SimpleBar>
        </div>
      )}
    </>
  );
};

export default ReferralTree;
