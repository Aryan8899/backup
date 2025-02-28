import { useState, useEffect, useCallback, useMemo } from "react";
import { ethers, BrowserProvider } from "ethers";
import {
  Provider,
  useAppKitProvider,
  useAppKitAccount,
} from "@reown/appkit/react";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { useDarkMode } from "../context/DarkModeContext.tsx";
import contractAbi from "../contracts/Props/contractAbi.ts";
import contractAddress from "../contracts/Props/contractAddress.ts";
import "../index.css";
import axios from "axios";
import SimpleBar from "simplebar-react";
import "simplebar/dist/simplebar.min.css";
import { useNavigate } from "react-router-dom";
import multiavatar from "@multiavatar/multiavatar/esm";

// Interfaces
interface ReferralNode {
  address: string;
  rank: string;
  referrals: ReferralNode[];
}

interface UserDetails {
  avatar: string;
  nickname: string;
}

// Cache TTL constants - reduced for debugging
const CACHE_TTL = {
  REGISTRATION: 5 * 60 * 1000, // 5 minutes (reduced from 30)
  TREE: 5 * 60 * 1000, // 5 minutes (reduced from 15)
  USER: 10 * 60 * 1000, // 10 minutes (reduced from 60)
  REFERRALS: 5 * 60 * 1000, // 5 minutes (reduced from 15)
};

// Rank names mapping
const RANK_NAMES = [
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

const ReferralTree = () => {
  const navigate = useNavigate();
  const { darkMode } = useDarkMode();
  const { address, isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider<Provider>("eip155");

  // Core state
  const [treeData, setTreeData] = useState<ReferralNode | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [userDetails, setUserDetails] = useState<Record<string, UserDetails>>(
    {}
  );
  const [loadingNodes, setLoadingNodes] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Memoized contract with error handling


  interface SkeletonProps {
    darkMode: boolean;
  }

  const contract = useMemo(() => {
    if (!walletProvider) {
      console.log("Wallet provider not available");
      return null;
    }

    try {
      console.log("Initializing contract with address:", contractAddress);

      // Verify if contract address is valid
      if (!contractAddress || !ethers.isAddress(contractAddress)) {
        console.error("Invalid contract address:", contractAddress);
        setError("Invalid contract configuration");
        return null;
      }

      // Check if ABI is available
      if (!contractAbi || !Array.isArray(contractAbi)) {
        console.error("Invalid contract ABI:", contractAbi);
        setError("Invalid contract configuration");
        return null;
      }

      const provider = new BrowserProvider(walletProvider);
      console.log("Provider initialized");

      const contract = new ethers.Contract(
        contractAddress,
        contractAbi,
        provider
      );
      console.log("Contract initialized successfully");
      return contract;
    } catch (e) {
      console.error("Contract initialization error:", e);
      setError("Failed to initialize contract");
      return null;
    }
  }, [walletProvider]);

  // DEBUG: Add cache debugging functionality
  useEffect(() => {
    // Log all storage keys on mount to debug
    console.log("All localStorage keys:", Object.keys(localStorage));

    // List all rtree related keys
    const rtreeKeys = Object.keys(localStorage).filter(
      (key) => key.startsWith("rtree_") || key.startsWith("$rtree_")
    );
    console.log("All rtree keys:", rtreeKeys);

    // Emergency clear of cache if needed - uncomment to reset cache
    // rtreeKeys.forEach(key => localStorage.removeItem(key));
  }, []);


  // Skeleton loader component for referral nodes
const SkeletonNode: React.FC<SkeletonProps> = ({ darkMode }) => (
  <div className="w-64 mx-auto">
    <div
      className={`
        relative rounded-2xl p-4 shadow-lg
        ${
          darkMode
            ? "bg-gray-800/60 backdrop-blur-xl border border-gray-700/50"
            : "bg-white/60 backdrop-blur-xl border border-gray-200/50"
        }
      `}
    >
      {/* Avatar skeleton */}
      <div 
        className={`
          w-20 h-20 rounded-full mx-auto mb-3 animate-pulse
          ${darkMode ? "bg-gray-700" : "bg-gray-300"}
        `}
      />
      
      {/* Text lines skeletons */}
      <div className="space-y-3">
        {/* Nickname */}
        <div 
          className={`
            h-4 w-24 mx-auto rounded-full animate-pulse
            ${darkMode ? "bg-gray-700" : "bg-gray-300"}
          `}
        />
        
        {/* Address */}
        <div 
          className={`
            h-5 w-32 mx-auto rounded-full animate-pulse
            ${darkMode ? "bg-gray-700" : "bg-gray-300"}
          `}
        />
        
        {/* Rank */}
        <div 
          className={`
            h-5 w-20 mx-auto rounded-full animate-pulse
            ${darkMode ? "bg-gray-700" : "bg-gray-300"}
          `}
        />
        
        {/* Referral count */}
        <div 
          className={`
            h-3 w-16 mx-auto rounded-full animate-pulse
            ${darkMode ? "bg-gray-700" : "bg-gray-300"}
          `}
        />
      </div>
    </div>
  </div>
);


// Skeleton tree structure
// Improved Skeleton tree structure with better spacing and width management
// Completely redesigned SkeletonTree to ensure it stays within viewport
// Compact SkeletonTree with reduced height and tighter spacing
const SkeletonTree: React.FC<SkeletonProps> = ({ darkMode }) => (
  <div className="w-full max-w-full overflow-visible py-2">
    {/* Root node with reduced size */}
    <div className="flex justify-center mb-4">
      <CompactSkeletonNode darkMode={darkMode} />
    </div>
    
    {/* Shorter vertical connector */}
    <div className="flex justify-center mb-2">
      <div 
        className={`w-1 h-8 ${darkMode ? "bg-gray-700" : "bg-gray-300"}`}
      />
    </div>
    
    {/* Child nodes with more compact layout */}
    <div className="w-full overflow-visible">
      {/* Horizontal connector line */}
      <div className="relative w-full flex justify-center mb-2">
        <div 
          className={`w-1/2 h-1 ${darkMode ? "bg-gray-700" : "bg-gray-300"}`}
          style={{ maxWidth: "400px" }}
        />
      </div>
      
      {/* More compact child nodes layout with reduced spacing */}
      <div className="flex justify-center flex-wrap gap-2">
        <div className="mb-2 mx-1">
          <CompactSkeletonNode darkMode={darkMode} />
        </div>
        <div className="mb-2 mx-1">
          <CompactSkeletonNode darkMode={darkMode} />
        </div>
        <div className="mb-2 mx-1">
          <CompactSkeletonNode darkMode={darkMode} />
        </div>
      </div>
    </div>
  </div>
);

// Smaller and more compact skeleton node
const CompactSkeletonNode: React.FC<SkeletonProps> = ({ darkMode }) => (
  <div className="w-48 mx-auto"> {/* Reduced width from 64 to 48 */}
    <div
      className={`
        relative rounded-xl p-3 shadow-md
        ${
          darkMode
            ? "bg-gray-800/60 backdrop-blur-xl border border-gray-700/50"
            : "bg-white/60 backdrop-blur-xl border border-gray-200/50"
        }
      `}
    >
      {/* Smaller avatar skeleton */}
      <div 
        className={`
          w-12 h-12 rounded-full mx-auto mb-2 animate-pulse
          ${darkMode ? "bg-gray-700" : "bg-gray-300"}
        `}
      />
      
      {/* Smaller and fewer text lines */}
      <div className="space-y-2">
        {/* Nickname */}
        <div 
          className={`
            h-3 w-16 mx-auto rounded-full animate-pulse
            ${darkMode ? "bg-gray-700" : "bg-gray-300"}
          `}
        />
        
        {/* Address */}
        <div 
          className={`
            h-3 w-24 mx-auto rounded-full animate-pulse
            ${darkMode ? "bg-gray-700" : "bg-gray-300"}
          `}
        />
        
        {/* Rank - single line instead of two */}
        <div 
          className={`
            h-3 w-16 mx-auto rounded-full animate-pulse
            ${darkMode ? "bg-gray-700" : "bg-gray-300"}
          `}
        />
      </div>
    </div>
  </div>
);

  // Cache utilities
  const cache = useMemo(() => {
    const cacheObj = {
      get: (key: string): any => {
        try {
          // Check for both potential prefixes due to previous typo
          let item = localStorage.getItem(`rtree_${key}`);

          // Also check if the item was stored with the typo prefix
          if (!item) {
            item = localStorage.getItem(`$rtree_${key}`);
            if (item) {
              console.log(`Found item with typo prefix: $rtree_${key}`);
              // If found with typo, migrate it
              try {
                const parsedItem = JSON.parse(item);
                cacheObj.set(
                  key,
                  parsedItem.data,
                  parsedItem.expiry
                    ? parsedItem.expiry - Date.now()
                    : CACHE_TTL.REGISTRATION
                );
                localStorage.removeItem(`$rtree_${key}`);
              } catch (e) {
                console.error("Error migrating cache item:", e);
              }
            }
          }

          if (!item) return null;

          const parsedItem = JSON.parse(item);
          if (parsedItem.expiry && Date.now() > parsedItem.expiry) {
            console.log(`Cache expired for key: ${key}`);
            localStorage.removeItem(`rtree_${key}`);
            localStorage.removeItem(`$rtree_${key}`); // Also remove potential typo key
            return null;
          }

          console.log(`Cache hit for key: ${key}`);
          return parsedItem.data;
        } catch (e) {
          console.error(`Error reading cache key ${key}:`, e);
          // Clear potentially corrupted data
          localStorage.removeItem(`rtree_${key}`);
          localStorage.removeItem(`$rtree_${key}`);
          return null;
        }
      },
      set: (key: string, data: any, ttl: number): void => {
        try {
          // Don't cache null or undefined values
          if (data === null || data === undefined) return;

          console.log(`Setting cache for key: ${key}, TTL: ${ttl}ms`);
          const expiry = Date.now() + ttl;

          // IMPORTANT: Use correct key prefix
          localStorage.setItem(
            `rtree_${key}`,
            JSON.stringify({ data, expiry })
          );
        } catch (e) {
          console.error(`Error writing to cache for key ${key}:`, e);
          // Attempt to clear storage if it's full
          try {
            localStorage.removeItem(`rtree_${key}`);
          } catch {
            // If still failing, clear all cache
            Object.keys(localStorage).forEach((key) => {
              if (key.startsWith("rtree_") || key.startsWith("$rtree_")) {
                localStorage.removeItem(key);
              }
            });
          }
        }
      },
      clear: (pattern?: string): void => {
        try {
          console.log(
            `Clearing cache${pattern ? ` with pattern: ${pattern}` : ""}`
          );
          Object.keys(localStorage).forEach((key) => {
            if (
              (key.startsWith("rtree_") || key.startsWith("$rtree_")) &&
              (!pattern || key.includes(pattern))
            ) {
              localStorage.removeItem(key);
            }
          });
        } catch (e) {
          console.error("Error clearing cache:", e);
        }
      },
    };

    return cacheObj;
  }, []);

  // Utility functions
  const getRankName = useCallback((rankIndex: number): string => {
    return RANK_NAMES[rankIndex] || "Unknown Rank";
  }, []);

  const shortenAddress = useCallback((address: string): string => {
    if (!address || typeof address !== "string") return "Invalid Address";
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4
    )}`;
  }, []);

  const getMultiavatarSvg = useCallback((addressStr: string): string => {
    try {
      return multiavatar(addressStr);
    } catch (error) {
      console.error("Error generating multiavatar:", error);
      return '<svg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="40" r="40" fill="#e0e0e0"/></svg>';
    }
  }, []);

  const svgToDataUrl = useCallback((svgString: string): string => {
    try {
      const encodedSvg = encodeURIComponent(svgString);
      return `data:image/svg+xml,${encodedSvg}`;
    } catch (error) {
      console.error("Error converting SVG to data URL:", error);
      return "";
    }
  }, []);

  // API calls with retry logic
  const fetchUserDetails = useCallback(
    async (userAddress: string): Promise<UserDetails> => {
      if (!userAddress) return { avatar: "", nickname: "Unknown" };

      // Check cache first
      const cacheKey = `user_${userAddress}`;
      const cachedUser = cache.get(cacheKey);
      if (cachedUser) {
        setUserDetails((prev) => ({
          ...prev,
          [userAddress]: cachedUser,
        }));
        return cachedUser;
      }

      // Retry logic
      const MAX_RETRIES = 2;
      let retries = 0;

      while (retries <= MAX_RETRIES) {
        try {
          const response = await axios.get(
            `https://server.cryptomx.site/api/users/${userAddress}`,
            { timeout: 3000 + retries * 1000 } // Increase timeout with each retry
          );

          const user = response.data.data;
          const userData = {
            avatar: user?.avatar || "",
            nickname: user?.nickname || "Unknown",
          };

          setUserDetails((prev) => ({
            ...prev,
            [userAddress]: userData,
          }));

          // Cache the result
          cache.set(cacheKey, userData, CACHE_TTL.USER);

          return userData;
        } catch (error) {
          retries++;
          if (retries > MAX_RETRIES) {
            console.error(
              `Failed to fetch user details for ${userAddress} after ${MAX_RETRIES} attempts:`,
              error
            );

            // Use fallback data
            const fallbackData = {
              avatar: "",
              nickname: shortenAddress(userAddress),
            };

            setUserDetails((prev) => ({
              ...prev,
              [userAddress]: fallbackData,
            }));

            // Cache negative result for shorter time
            cache.set(cacheKey, fallbackData, CACHE_TTL.USER / 2);

            return fallbackData;
          }

          // Wait before retrying
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      // Should never reach here due to return in the catch block,
      // but TypeScript needs a return value
      return { avatar: "", nickname: "Unknown" };
    },
    [cache, shortenAddress]
  );

  // Check registration status
  useEffect(() => {
    if (!isConnected) {
      // Don't redirect automatically, just set loading state
      setIsLoading(false);
      return;
    }

    if (!walletProvider || !address) {
      setIsLoading(false);
      setError("Wallet connection issue. Please reconnect your wallet.");
      return;
    }

    if (!contract) {
      setIsLoading(false);
      setError("Contract initialization failed. Please refresh the page.");
      return;
    }

    let isMounted = true;

    const checkRegistration = async () => {
      try {
        console.log("Checking registration for address:", address);

        // IMPORTANT: Temporarily bypass cache check to rule out cache issues
        // const cachedStatus = cache.get(`reg_${address}`);
        // if (cachedStatus !== null) {
        //   if (!cachedStatus) {
        //     navigate("/");
        //   } else if (isMounted) {
        //     setIsInitialized(true);
        //     setIsLoading(false);
        //   }
        //   return;
        // }

        // Directly check contract without cache dependency
        const userData = await contract.users(address);
        console.log("User data from contract:", userData);

        // Handle different contract response formats
        let isActive = false;

        if (userData && typeof userData.isActive === "boolean") {
          isActive = userData.isActive;
        } else if (userData && userData.length > 0) {
          // Try to extract isActive from array if it's returned that way
          isActive = Boolean(userData[1]);
        }

        console.log("User active status:", isActive);

        // Only store in cache if successful
        cache.set(`reg_${address}`, isActive, CACHE_TTL.REGISTRATION);

        if (!isActive) {
          console.log("User not active, redirecting to home");
          if (isMounted) navigate("/");
        } else if (isMounted) {
          console.log("User active, continuing to tree initialization");
          setIsInitialized(true);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Registration check error:", error);
        if (isMounted) {
          setError("Failed to verify registration status. Please try again.");
          setIsLoading(false);
        }
      }
    };

    checkRegistration();

    return () => {
      isMounted = false;
    };
  }, [isConnected, walletProvider, address, contract, navigate, cache]);

  // Tree utility functions
  const findNode = useCallback(
    (
      node: ReferralNode | null,
      targetAddress: string,
      predicate: (node: ReferralNode) => boolean = () => true
    ): boolean => {
      if (!node) return false;
      if (node.address === targetAddress && predicate(node)) return true;

      for (const child of node.referrals) {
        if (findNode(child, targetAddress, predicate)) return true;
      }

      return false;
    },
    []
  );

  // Calculate dynamic width for tree branches based on number of children
  const calculateBranchWidth = useCallback((numChildren: number): number => {
    // Base width per child with spacing
    const baseNodeWidth = 274; // Width of node
    const nodeSpacing = 150; // Space between nodes

    if (numChildren <= 1) {
      return baseNodeWidth;
    }

    // Calculate total width needed for all nodes with spacing
    // For multiple children, calculate total width with proper spacing
  return (baseNodeWidth * numChildren) + (nodeSpacing * (numChildren - 1));
  }, []);

  const updateTreeWithReferrals = useCallback(
    (nodeAddress: string, referrals: ReferralNode[]) => {
      setTreeData((currentTree) => {
        if (!currentTree) return null;

        const updateNode = (node: ReferralNode): ReferralNode => {
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
        };

        return updateNode(currentTree);
      });
    },
    []
  );

  // Load tree data
  useEffect(() => {
    if (!address || !contract || !isInitialized) {
      console.log("Tree data loading skipped", {
        hasAddress: !!address,
        hasContract: !!contract,
        isInitialized,
      });
      return;
    }

    console.log("Starting to load tree data for address:", address);
    let isMounted = true;

    const loadTreeData = async () => {
      try {
        setIsLoading(true);

        // Add emergency clear of tree cache - uncomment if needed
        // cache.clear(`tree_${address}`);

        // Check cache first
        const cacheKey = `tree_${address}`;
        console.log("Checking cache for tree data with key:", cacheKey);
        const cachedTree = cache.get(cacheKey);

        if (cachedTree) {
          console.log("Found cached tree data:", cachedTree);

          if (isMounted) {
            setTreeData(cachedTree);
            setIsLoading(false);
            setExpandedNodes(new Set([address]));
          }

          // Pre-fetch user details for root
          fetchUserDetails(address);

          // Pre-fetch first level referrals
          if (cachedTree?.referrals && isMounted) {
            console.log("Pre-fetching user details for referrals");
            cachedTree.referrals.forEach((ref: ReferralNode) => {
              fetchUserDetails(ref.address);
            });
          }

          return;
        }

        console.log("No cached tree data, fetching from contract");

        // Get user rank
        const userData = await contract.users(address);
        const rankIndex = Number(userData[0]?.toString() || "0");
        const rank = getRankName(rankIndex);

        // Get referrals for root
        const firstLevelReferrals = await contract.getUserReferrals(address);

        // Build referral nodes for first level, with concurrency limit
        const CONCURRENCY_LIMIT = 3;
        const referrals: ReferralNode[] = [];

        for (
          let i = 0;
          i < firstLevelReferrals.length;
          i += CONCURRENCY_LIMIT
        ) {
          const batch = firstLevelReferrals.slice(i, i + CONCURRENCY_LIMIT);
          const batchResults = await Promise.all(
            batch.map(async (refAddress: string) => {
              try {
                const refData = await contract.users(refAddress);
                const refRankIndex = Number(refData[0]?.toString() || "0");
                return {
                  address: refAddress,
                  rank: getRankName(refRankIndex),
                  referrals: [],
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

          referrals.push(...batchResults);
        }

        // Create root node
        const rootNode: ReferralNode = {
          address,
          rank,
          referrals,
        };

        // Cache tree data
        cache.set(cacheKey, rootNode, CACHE_TTL.TREE);

        // Update state if component still mounted
        if (isMounted) {
          setTreeData(rootNode);
          setIsLoading(false);
          setExpandedNodes(new Set([address]));
        }

        // Fetch user details for first level
        fetchUserDetails(address);
        referrals.forEach((ref) => {
          fetchUserDetails(ref.address);
        });
      } catch (error) {
        console.error("Tree loading error:", error);
        if (isMounted) {
          setError("Failed to load referral tree.");
          setIsLoading(false);
        }
      }
    };

    loadTreeData();

    return () => {
      isMounted = false;
    };
  }, [
    address,
    contract,
    isInitialized,
    getRankName,
    fetchUserDetails,
    cache,
    findNode,
  ]);

  // Error recovery function
  const recoverFromError = useCallback(() => {
    console.log("Attempting to recover from error state");

    // Clear all potentially corrupted cache
    cache.clear();

    // Reset state
    setTreeData(null);
    setExpandedNodes(new Set());
    setLoadingNodes(new Set());
    setError(null);
    setIsLoading(true);

    // Force re-initialization
    setIsInitialized(false);

    // Slight delay before re-checking registration
    setTimeout(() => {
      setIsInitialized(true);
      setIsLoading(false);
    }, 1000);
  }, [cache]);

  // Load child referrals
  const loadReferrals = useCallback(
    async (nodeAddress: string) => {
      if (!contract) {
        console.error("Contract not available for loading referrals");
        return;
      }

      if (!nodeAddress) {
        console.error("Invalid node address for loading referrals");
        return;
      }

      if (loadingNodes.has(nodeAddress)) {
        console.log(`Already loading referrals for ${nodeAddress}`);
        return;
      }

      console.log(
        `Checking if referrals for ${nodeAddress} are already loaded`
      );

      // Check if this node already has its referrals loaded
      const hasReferrals = findNode(
        treeData,
        nodeAddress,
        (node) => node.referrals.length > 0
      );

      if (hasReferrals) {
        console.log(`Referrals for ${nodeAddress} already loaded`);
        return;
      }

      console.log(`Loading referrals for ${nodeAddress}`);

      // Mark node as loading
      setLoadingNodes((prev) => {
        const newSet = new Set(prev);
        newSet.add(nodeAddress);
        return newSet;
      });

      try {
        // Check cache first
        const cacheKey = `refs_${nodeAddress}`;
        const cachedRefs = cache.get(cacheKey);

        if (cachedRefs) {
          updateTreeWithReferrals(nodeAddress, cachedRefs);

          // Fetch user details for the referrals
          cachedRefs.forEach((ref: ReferralNode) => {
            fetchUserDetails(ref.address);
          });

          return;
        }

        // Get referrals from contract with timeout protection
        const referralAddresses = (await Promise.race([
          contract.getUserReferrals(nodeAddress),
          new Promise<string[]>((_, reject) =>
            setTimeout(() => reject(new Error("Referral fetch timeout")), 10000)
          ),
        ])) as string[];

        // Build referral nodes with concurrency limit
        const CONCURRENCY_LIMIT = 3;
        const referrals: ReferralNode[] = [];

        for (let i = 0; i < referralAddresses.length; i += CONCURRENCY_LIMIT) {
          const batch = referralAddresses.slice(i, i + CONCURRENCY_LIMIT);
          const batchResults = await Promise.all(
            batch.map(async (refAddress: string) => {
              try {
                const refData = await contract.users(refAddress);
                const refRankIndex = Number(refData[0]?.toString() || "0");
                return {
                  address: refAddress,
                  rank: getRankName(refRankIndex),
                  referrals: [],
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

          referrals.push(...batchResults);
        }

        // Update tree with new referrals
        updateTreeWithReferrals(nodeAddress, referrals);

        // Cache the results
        cache.set(cacheKey, referrals, CACHE_TTL.REFERRALS);

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
    [
      contract,
      loadingNodes,
      treeData,
      getRankName,
      fetchUserDetails,
      cache,
      findNode,
      updateTreeWithReferrals,
    ]
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

      // Get avatar source with fallback to multiavatar
      const avatarSource =
        details.avatar && details.avatar.trim() !== ""
          ? details.avatar
          : svgToDataUrl(getMultiavatarSvg(node.address));

           // Calculate total width needed based on the number of child nodes
    const nodeBaseWidth = 280; // Single node width
    const nodeSpacing = 200; // Very generous spacing between sibling nodes
    

    const nodeWidth = hasChildren && isExpanded && node.referrals.length > 0
    ? nodeBaseWidth * node.referrals.length + nodeSpacing * (node.referrals.length - 1)
    : nodeBaseWidth;

      return (
        <div
          key={node.address}
          className="referral-node-container flex flex-col items-center"

          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: nodeWidth,
            minWidth: nodeWidth,
            position: "relative"
          }}
        >
         
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
              w-64 mx-auto
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
                  src={avatarSource}
                  alt="Avatar"
                  className="w-20 h-20 rounded-full mx-auto mb-3 border-2 border-white/20 group-hover:scale-105 transition-transform"
                  onError={(e) => {
                    // Fallback if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.src = svgToDataUrl(getMultiavatarSvg(node.address));
                  }}
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
                    {isLoading || !node.referrals?.length
                      ? "-"
                      : `${node.referrals.length} Referrals`}
                  </div>
                </div>
              </div>

              {/* Loading indicator */}
              {/* {isLoading && (
                <div className="absolute top-1 right-1">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )} */}

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
         

            {/* Connector */}
            {/* {hasChildren && isExpanded && (
              <svg
                className={`w-4 h-6 ${
                  darkMode ? "text-gray-500" : "text-gray-400"
                } my-2`}
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
            )} */}
          </div>

          {/* Children */}
        

{/* Children */}
{/* Children */}
{/* Children */}
{/* Children */}
{/* Children */}
{/* Children */}
{hasChildren && isExpanded && (
  <div style={{ 
    width: "100%",
    minWidth: "100%"
  }}>
    {/* Center vertical connector from parent */}
    <div style={{
      display: "flex",
      justifyContent: "center",
    }}>
      <div style={{ 
        width: "4px",
        height: "20px",
        backgroundColor: darkMode ? "#4B5563" : "#9CA3AF",
      }}></div>
    </div>
    
    {/* Table-based layout for horizontal connector and child nodes */}
    <table style={{ 
      width: "100%", 
      borderCollapse: "collapse",
      borderTop: `4px solid ${darkMode ? "#4B5563" : "#9CA3AF"}`
    }}>
  <tbody>
        <tr>
          {node.referrals.map((child, index) => (
            <td key={`cell-${child.address}`} style={{ 
              textAlign: "center", 
              verticalAlign: "top",
              position: "relative"
            }}>
              {/* Vertical connector to child */}
              <div style={{
                position: "absolute", 
                left: "50%", 
                transform: "translateX(-50%)", 
                top: "0", /* Ensures proper alignment with parent node */
                width: "4px", 
                height: "40px", /* Further increased for better connection */
                backgroundColor: darkMode ? "#4B5563" : "#9CA3AF"
              }}></div>
              
              {/* Child node with padding for connector */}
              <div style={{ paddingTop: "40px", display: "flex", justifyContent: "center" }}> {/* Center-aligned child node */}
                {renderNode(child)}
              </div>
            </td>
          ))}
        </tr>
      </tbody>


    </table>
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
      svgToDataUrl,
      getMultiavatarSvg,
    ]
  );

  // Main render
  return (
    <>
      {!isConnected ? (
        <div className="flex flex-col items-center justify-center h-96 space-y-4">
          <p
            className={`text-xl ${
              darkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Please connect your wallet to view the referral tree
          </p>
          <button
            onClick={() => navigate("/")}
            className={`px-4 py-2 rounded-lg ${
              darkMode
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
          >
            Go to Home
          </button>
        </div>
      ) : (
        <div className="min-h-screen p-6">
          <SimpleBar className="w-full overflow-x-auto">
            <div className="min-w-max">
              {isLoading ? (
                <div className="flex justify-center items-center h-96">
                  <div className="absolute inset-0 backdrop-blur-sm bg-white/30 dark:bg-black/30" />
                  <SkeletonTree darkMode={darkMode} />
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center h-96 space-y-4">
                  <AlertTriangle className="w-24 h-24 text-red-500" />
                  <p className="text-xl text-red-500">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className={`px-4 py-2 mt-4 rounded-lg ${
                      darkMode
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "bg-blue-500 hover:bg-blue-600 text-white"
                    }`}
                  >
                    Try Again
                  </button>
                </div>
              ) : treeData ? (
                <div className="flex flex-col items-center">
                  {renderNode(treeData)}
                </div>
              ) : (
                <div className="flex flex-col justify-center items-center h-96 space-y-6">
                  <p
                    className={`text-xl ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    No referral data available
                  </p>

                  <div className="flex space-x-4">
                    <button
                      onClick={() => window.location.reload()}
                      className={`px-4 py-2 rounded-lg ${
                        darkMode
                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                          : "bg-blue-500 hover:bg-blue-600 text-white"
                      }`}
                    >
                      Refresh Page
                    </button>

                    <button
                      onClick={recoverFromError}
                      className={`px-4 py-2 rounded-lg ${
                        darkMode
                          ? "bg-green-600 hover:bg-green-700 text-white"
                          : "bg-green-500 hover:bg-green-600 text-white"
                      }`}
                    >
                      Reset Data
                    </button>

                    <button
                      onClick={() => navigate("/")}
                      className={`px-4 py-2 rounded-lg ${
                        darkMode
                          ? "bg-gray-600 hover:bg-gray-700 text-white"
                          : "bg-gray-500 hover:bg-gray-600 text-white"
                      }`}
                    >
                      Return Home
                    </button>
                  </div>

                  {/* Debug info - can be removed in production */}
                  <div className="mt-8 p-4 bg-gray-800 text-gray-300 rounded-lg text-xs max-w-lg overflow-auto">
                    <h3 className="font-bold mb-2">Debug Information</h3>
                    <p>Address: {address || "Not connected"}</p>
                    <p>Contract initialized: {contract ? "Yes" : "No"}</p>
                    <p>App initialized: {isInitialized ? "Yes" : "No"}</p>
                    <p>Tree data: {treeData ? "Available" : "Not available"}</p>
                    <details>
                      <summary className="cursor-pointer">Cache Status</summary>
                      <pre className="mt-2">
                        {JSON.stringify(
                          Object.keys(localStorage)
                            .filter(
                              (key) =>
                                key.startsWith("rtree_") ||
                                key.startsWith("$rtree_")
                            )
                            .reduce(
                              (acc, key) => ({ ...acc, [key]: "cached" }),
                              {}
                            ),
                          null,
                          2
                        )}
                      </pre>
                    </details>
                  </div>
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
