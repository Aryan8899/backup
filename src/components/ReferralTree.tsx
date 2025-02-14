import { useState, useEffect } from "react";
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
const ReferralTree = () => {
  const navigate = useNavigate();
  const { darkMode } = useDarkMode(); // ✅ Dark mode state is correctly retrieved

  useEffect(() => {
    console.log("Dark Mode State:", darkMode); // ✅ Debugging log to check state updates
  }, [darkMode]);

  const { address, isConnected } = useWeb3ModalAccount();
  const { address: userAddress } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();
  const [treeData, setTreeData] = useState<ReferralNode | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [isScrollable, setIsScrollable] = useState(false); // State for scrollability
  const [userAvatars, setUserAvatars] = useState<Record<string, string>>({}); // Stores avatar URLs by address
  const [userData, setUserData] = useState<{
    nickname: string;
    avatar: string;
  } | null>(null);
  const [userDetails, setUserDetails] = useState<
    Record<string, { avatar: string; nickname: string }>
  >({}); // Stores avatar and nickname by address

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

  const fetchUserDetails = async (
    address: string
  ): Promise<{ avatar: string; nickname: string }> => {
    console.log(isScrollable, userAvatars, setUserAvatars, userData);
    try {
      const response = await axios.get(
        `https://server.cryptomx.site/api/users/${address}`
      );
      const user = response.data.data;
      return {
        avatar: user.avatar || "",
        nickname: user.nickname || "Unknown", // Default to "Unknown" if nickname is not available
      }; // Return avatar URL or empty if not available
    } catch (error) {
      console.error(`Error fetching user details for ${address}:`, error);
      return {
        avatar: "",
        nickname: "Unknown",
      }; // Return empty string on error
    }
  };

  const [avatarSVG, setAvatarSVG] = useState<string>("");

  useEffect(() => {
    console.log(error);
    const fetchAddress = async () => {
      //console.log(withdrawalRab);
      if (walletProvider) {
        try {
          const provider = new ethers.providers.Web3Provider(walletProvider);
          const signer = provider.getSigner();
          const address = await signer.getAddress(); // Get connected wallet address
          // console.log("the address is", address);

          const avatar = multiavatar(address);
          setAvatarSVG(avatar);
        } catch (error) {
          console.error("Error fetching connected address:", error);
        }
      }
    };
    fetchAddress();
  }, [walletProvider]);

  const fetchReferrals = async (
    address: string,
    provider: ethers.providers.Web3Provider
  ): Promise<ReferralNode> => {
    const contract = new ethers.Contract(
      contractAddress,
      contractAbi,
      provider
    );

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

    try {
      const referrals: string[] = await contract.getUserReferrals(address);
      const userData = await contract.users(address);
      const rankIndex = Number.parseInt(userData[0]?.toString() || "0");
      const rank = getRankName(rankIndex);

      // Fetch user details (avatar and nickname)
      const details = await fetchUserDetails(address);

      // Update the userDetails map
      setUserDetails((prev) => ({
        ...prev,
        [address]: {
          avatar: details.avatar || "",
          nickname: details.nickname || "Unknown",
        },
      }));

      const referralNodes = await Promise.all(
        referrals.map((referral) => fetchReferrals(referral, provider))
      );

      return { address, rank, referrals: referralNodes };
    } catch (err) {
      console.error(`Error fetching referrals for address ${address}:`, err);
      return { address, rank: "Unknown Rank", referrals: [] };
    }
  };

  const registerUser = async (address: string) => {
    try {
      const response = await axios.get(
        `https://server.cryptomx.site/api/users/${address}`
      );

      // Extract the relevant user data
      const user = response.data.data;
      // console.log("User data::::::", user);

      // Update the state with nickname and avatar
      setUserData({
        nickname: user.nickname,
        avatar: user.avatar,
      });

      //console.log("User registered:", user);
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error message:", error.message);
      } else {
        console.error("Unknown error:", error);
      }
    }
  };

  useEffect(() => {
    if (userAddress) {
      registerUser(userAddress);
    }
  }, [userAddress]);

  useEffect(() => {
    const loadTreeData = async () => {
      if (!userAddress || !walletProvider) {
        setError("Wallet not connected.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const provider = new ethers.providers.Web3Provider(walletProvider);
        const tree = await fetchReferrals(userAddress, provider);
        setTreeData(tree);

        // Check if scrolling is required based on depth
        const depth = calculateTreeDepth(tree);
        setIsScrollable(depth > 3); // Enable scrolling only if depth exceeds 3
      } catch (err) {
        console.error("Error loading referral tree data:", err);
        setError("Failed to load referral tree.");
      } finally {
        setIsLoading(false);
      }
    };

    console.log(avatarSVG);

    loadTreeData();
  }, [userAddress, walletProvider]);

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
  // ... previous methods remain the same

  const renderTree = (node: ReferralNode, level = 0, index = 0) => {
    console.log(index)
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
            <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-300 
                bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-cyan-500/10 rounded-2xl blur-lg" />

            {/* Content */}
            <div className="relative z-10">
              <img
                src={`data:image/svg+xml;utf8,${encodeURIComponent(avatarSVG)}`}
                alt="Avatar"
                className="w-20 h-20 rounded-full mx-auto mb-3 border-2 border-white/20 group-hover:scale-105 transition-transform"
              />
              <div className="text-center space-y-1">
                <div className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                  {details?.nickname || "Unknown"}
                </div>
                <div className={`font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>
                  {shortenAddress(node.address)}
                </div>
                <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium
                  ${darkMode ? "bg-gray-700 text-cyan-400" : "bg-blue-50 text-blue-600"}`}>
                  Rank: {node.rank}
                </div>
                <div className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
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
                      animate={{
                        scale: [1, 1.05, 1],
                        rotate: [0, 2, -2, 0],
                      }}
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
