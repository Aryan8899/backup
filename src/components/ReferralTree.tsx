import { useState, useEffect, useCallback, useMemo } from "react";
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
import { useNavigate } from "react-router-dom";
import multiavatar from '@multiavatar/multiavatar/esm';

// Interfaces
interface ReferralNode {
  address: string;
  rank: string;
  referrals: ReferralNode[];
}

const ReferralTree = () => {
  const navigate = useNavigate();
  const { darkMode } = useDarkMode();
  const { address, isConnected } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();

  // Core state
  const [treeData, setTreeData] = useState<ReferralNode | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [userDetails, setUserDetails] = useState<
    Record<string, { avatar: string; nickname: string }>
  >({});
  const [loadingNodes, setLoadingNodes] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Memoized contract
  const contract = useMemo(() => {
    if (!walletProvider) return null;
    try {
      const provider = new ethers.providers.Web3Provider(walletProvider);
      return new ethers.Contract(contractAddress, contractAbi, provider);
    } catch (e) {
      console.error("Contract init error:", e);
      return null;
    }
  }, [walletProvider]);

  // Utility function to get rank name
  const getRankName = useCallback((rankIndex: number): string => {
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
  }, []);

  // Utility to shorten address
  const shortenAddress = useCallback(
    (address: string): string =>
      `${address.substring(0, 6)}...${address.substring(address.length - 4)}`,
    []
  );

  // Cache control
  const cache = useMemo(() => {
    return {
      get: (key: string): any => {
        try {
          const item = localStorage.getItem(`rtree_${key}`);
          if (!item) return null;
          return JSON.parse(item);
        } catch (e) {
          return null;
        }
      },
      set: (key: string, data: any): void => {
        try {
          localStorage.setItem(`rtree_${key}`, JSON.stringify(data));
        } catch (e) {
          // Ignore storage errors
        }
      },
    };
  }, []);

  const getMultiavatarSvg = useCallback((addressStr: string): string => {
    try {
      // Use multiavatar function to generate SVG string
      return multiavatar(addressStr);
    } catch (error) {
      console.error("Error generating multiavatar:", error);
      // Return empty SVG as fallback
      return '<svg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="40" r="40" fill="#e0e0e0"/></svg>';
    }
  }, []);
  
  const svgToDataUrl = useCallback((svgString: string): string => {
    try {
      // Encode the SVG string for the data URL
      const encodedSvg = encodeURIComponent(svgString);
      return `data:image/svg+xml,${encodedSvg}`;
    } catch (error) {
      console.error("Error converting SVG to data URL:", error);
      return '';
    }
  }, []);

  // Fetch user details
  const fetchUserDetails = useCallback(
    async (userAddress: string) => {
      try {
        // Check cache first
        const cachedUser = cache.get(`user_${userAddress}`);
        if (cachedUser) {
          setUserDetails((prev) => ({
            ...prev,
            [userAddress]: cachedUser,
          }));
          return cachedUser;
        }

        // Otherwise fetch from API
        const response = await axios.get(
          `https://server.cryptomx.site/api/users/${userAddress}`,
          { timeout: 3000 }
        );

        const user = response.data.data;
        const userData = {
          avatar: user?.avatar || "",
          nickname: user?.nickname || "Unknown",
        };

        // Update state and cache
        setUserDetails((prev) => ({
          ...prev,
          [userAddress]: userData,
        }));

        cache.set(`user_${userAddress}`, userData);
        return userData;
      } catch (error) {
        console.error(`Error fetching user details for ${userAddress}:`, error);

        const fallbackData = {
          avatar: "",
          nickname: "Unknown",
        };

        setUserDetails((prev) => ({
          ...prev,
          [userAddress]: fallbackData,
        }));

        return fallbackData;
      }
    },
    [cache]
  );

  // Check registration status once on mount
  useEffect(() => {
    if (!isConnected || !walletProvider || !address || !contract) {
      setIsLoading(false);
      return;
    }

    const checkRegistration = async () => {
      try {
        // Check cache first
        const cachedStatus = cache.get(`reg_${address}`);
        if (cachedStatus !== null) {
          if (!cachedStatus) {
            navigate("/");
          } else {
            setIsInitialized(true);
            setIsLoading(false);
          }
          return;
        }

        const userData = await contract.users(address);
        const isActive = userData && userData.isActive;

        cache.set(`reg_${address}`, isActive);

        if (!isActive) {
          navigate("/");
        } else {
          setIsInitialized(true);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Registration check error:", error);
        setIsLoading(false);
        navigate("/");
      }
    };

    checkRegistration();
  }, [isConnected, walletProvider, address, contract, navigate, cache]);

  // Load root tree data
  useEffect(() => {
    if (!address || !contract || !isInitialized) return;

    const loadTreeData = async () => {
      try {
        setIsLoading(true);

        // Check cache first
        const cachedTree = cache.get(`tree_${address}`);
        if (cachedTree) {
          setTreeData(cachedTree);
          setIsLoading(false);
          setExpandedNodes(new Set([address]));

          // Pre-fetch user details for root
          fetchUserDetails(address);

          // Pre-fetch first level referrals
          if (cachedTree?.referrals) {
            cachedTree.referrals.forEach((ref: ReferralNode) => {
              fetchUserDetails(ref.address);
            });
          }

          return;
        }

        // Get user rank
        const userData = await contract.users(address);
        const rankIndex = Number(userData[0]?.toString() || "0");
        const rank = getRankName(rankIndex);

        // Get referrals for root
        const firstLevelReferrals = await contract.getUserReferrals(address);

        // Build referral nodes for first level
        const referrals: ReferralNode[] = await Promise.all(
          firstLevelReferrals.map(async (refAddress: string) => {
            try {
              const refData = await contract.users(refAddress);
              const refRankIndex = Number(refData[0]?.toString() || "0");
              return {
                address: refAddress,
                rank: getRankName(refRankIndex),
                referrals: [], // Empty initially
              };
            } catch (e) {
              return {
                address: refAddress,
                rank: "Unknown",
                referrals: [],
              };
            }
          })
        );

        // Create root node
        const rootNode: ReferralNode = {
          address,
          rank,
          referrals,
        };

        // Update state
        setTreeData(rootNode);
        setIsLoading(false);
        setExpandedNodes(new Set([address]));

        // Cache tree data
        cache.set(`tree_${address}`, rootNode);

        // Fetch user details for first level
        fetchUserDetails(address);
        referrals.forEach((ref) => {
          fetchUserDetails(ref.address);
        });
      } catch (error) {
        console.error("Tree loading error:", error);
        setError("Failed to load referral tree.");
        setIsLoading(false);
      }
    };

    loadTreeData();
  }, [address, contract, isInitialized, getRankName, fetchUserDetails, cache]);

  // Load child referrals when a node is expanded
  const loadReferrals = useCallback(
    async (nodeAddress: string) => {
      if (!contract || !nodeAddress || loadingNodes.has(nodeAddress)) return;

      // First check if this node already has its referrals loaded
      const hasReferrals = findNode(
        treeData,
        nodeAddress,
        (node) => node.referrals.length > 0
      );
      if (hasReferrals) return;

      // Mark node as loading
      setLoadingNodes((prev) => {
        const newSet = new Set(prev);
        newSet.add(nodeAddress);
        return newSet;
      });

      try {
        // Check cache first
        const cachedRefs = cache.get(`refs_${nodeAddress}`);
        if (cachedRefs) {
          updateTreeWithReferrals(nodeAddress, cachedRefs);

          // Fetch user details for the referrals
          cachedRefs.forEach((ref: ReferralNode) => {
            fetchUserDetails(ref.address);
          });

          return;
        }

        // Get referrals from contract
        const referralAddresses = await contract.getUserReferrals(nodeAddress);

        // Build referral nodes
        const referrals: ReferralNode[] = await Promise.all(
          referralAddresses.map(async (refAddress: string) => {
            try {
              const refData = await contract.users(refAddress);
              const refRankIndex = Number(refData[0]?.toString() || "0");
              return {
                address: refAddress,
                rank: getRankName(refRankIndex),
                referrals: [], // Empty initially
              };
            } catch (e) {
              return {
                address: refAddress,
                rank: "Unknown",
                referrals: [],
              };
            }
          })
        );

        // Update tree with new referrals
        updateTreeWithReferrals(nodeAddress, referrals);

        // Cache the results
        cache.set(`refs_${nodeAddress}`, referrals);

        // Fetch user details for the referrals
        referrals.forEach((ref) => {
          fetchUserDetails(ref.address);
        });
      } catch (error) {
        console.error(`Error loading referrals for ${nodeAddress}:`, error);
      } finally {
        // Mark node as done loading
        setLoadingNodes((prev) => {
          const newSet = new Set(prev);
          newSet.delete(nodeAddress);
          return newSet;
        });
      }
    },
    [contract, loadingNodes, treeData, getRankName, fetchUserDetails, cache]
  );

  // Helper function to find a node in the tree
  function findNode(
    node: ReferralNode | null,
    targetAddress: string,
    predicate: (node: ReferralNode) => boolean = () => true
  ): boolean {
    if (!node) return false;
    if (node.address === targetAddress && predicate(node)) return true;

    for (const child of node.referrals) {
      if (findNode(child, targetAddress, predicate)) return true;
    }

    return false;
  }

  // Helper function to update the tree with new referrals
  const updateTreeWithReferrals = useCallback(
    (nodeAddress: string, referrals: ReferralNode[]) => {
      setTreeData((currentTree) => {
        if (!currentTree) return null;

        // Clone the tree and update the specified node
        function updateNode(node: ReferralNode): ReferralNode {
          if (node.address === nodeAddress) {
            return {
              ...node,
              referrals,
            };
          }

          return {
            ...node,
            referrals: node.referrals.map(updateNode),
          };
        }

        return updateNode(currentTree);
      });
    },
    []
  );

  // Toggle node expansion
  const toggleNodeExpansion = useCallback(
    (nodeAddress: string) => {
      // Don't allow toggling while loading
      if (loadingNodes.has(nodeAddress)) return;

      setExpandedNodes((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(nodeAddress)) {
          newSet.delete(nodeAddress);
        } else {
          newSet.add(nodeAddress);
          // Load referrals when expanding
          loadReferrals(nodeAddress);
        }
        return newSet;
      });
    },
    [loadingNodes, loadReferrals]
  );

  

  // Render a single node
  const renderNode = useCallback(
    (node: ReferralNode) => {
      const hasChildren = node.referrals.length > 0;
      const isExpanded = expandedNodes.has(node.address);
      const isLoading = loadingNodes.has(node.address);
      const details = userDetails[node.address] || {
        avatar: "",
        nickname: "Unknown",
      };

      const getAvatarSource = () => {
        if (details.avatar && details.avatar.trim() !== "") {
          return details.avatar;
        }
        
        // Generate multiavatar data URL as fallback
        const svgString = getMultiavatarSvg(node.address);
        return svgToDataUrl(svgString);
      };

      return (
        <div
          key={node.address}
          className="referral-node-container flex flex-col items-center"
        >
          <div className="flex flex-col items-center">
            {/* Node box */}
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
              {/* Glow effect */}
              <div
                className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-300 
                bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-cyan-500/10 rounded-2xl blur-lg"
              />

              {/* Content */}
              <div className="relative z-10">
                <img
                  src={getAvatarSource()}
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
                    {isLoading
                      ? "Loading..."
                      : `${node.referrals.length} Referrals`}
                  </div>
                </div>
              </div>

              {/* Loading indicator */}
              {isLoading && (
                <div className="absolute top-1 right-1">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {/* Expand indicator */}
              {node.referrals.length > 0 && (
                <div className="absolute bottom-1 right-1">
                  <svg
                    className={`w-4 h-4 transform transition-transform ${
                      isExpanded ? "rotate-180" : "rotate-0"
                    } text-gray-400`}
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
                </div>
              )}
            </div>

            {/* Connector */}
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

          {/* Children */}
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
                      {renderNode(child)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      );
    },
    [
      expandedNodes,
      loadingNodes,
      userDetails,
      darkMode,
      toggleNodeExpansion,
      shortenAddress,
    ]
  );

  // Main render
  return (
    <>
      <div className="fixed inset-0 -z-10">
        {darkMode ? <FeaturesSection /> : <Light />}
      </div>

      {!isConnected ? (
        navigate("/")
      ) : (
        <div className="min-h-screen p-6">
          <SimpleBar className="w-full overflow-x-auto">
            <div className="min-w-max">
              {isLoading ? (
                <div className="flex justify-center items-center h-96">
                  <div className="absolute inset-0 backdrop-blur-sm bg-white/30 dark:bg-black/30" />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="relative z-50 flex flex-col items-center justify-center space-y-6"
                  >
                    {/* Logo */}
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

                    {/* Loading indicator */}
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

                    {/* Progress bar */}
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
                  {renderNode(treeData)}
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
