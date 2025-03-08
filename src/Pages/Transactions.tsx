import React, { useState, useEffect } from "react";
import { BrowserProvider, Contract, formatUnits } from "ethers";
import { contractAbi } from "../contracts/Props/contractAbi";
import { contractAddress } from "../contracts/Props/contractAddress";
import {
  Provider,
  useAppKitProvider,
  useAppKitAccount,
} from "@reown/appkit/react";
import { useNavigate } from "react-router-dom";
import { useDarkMode } from "../context/DarkModeContext";
import "../index.css";
import { motion } from "framer-motion";
import { userApi } from "../api/userApi";

// Import rank images
import {
  rank0,
  rank1,
  rank2,
  rank3,
  rank4,
  rank5,
  rank6,
  rank7,
  rank8,
} from "../assets/index";

interface Transaction {
  user?: string;
  from: string;
  rank?: number;
  amt: number;
  fee?: number;
  ts: any;
  tp: string;
}

const ranks = [
  { name: "STAR", image: rank0 },
  { name: "BRONZE", image: rank1 },
  { name: "SILVER", image: rank2 },
  { name: "GOLD", image: rank3 },
  { name: "DIAMOND", image: rank4 },
  { name: "BLUE_DIAMOND", image: rank5 },
  { name: "BLACK_DIAMOND", image: rank6 },
  { name: "ROYAL_DIAMOND", image: rank7 },
  { name: "CROWN_DIAMOND", image: rank8 },
];

const Transactions = () => {
  const navigate = useNavigate();
  const { darkMode } = useDarkMode();
  const { walletProvider } = useAppKitProvider<Provider>("eip155");
  const { address, isConnected } = useAppKitAccount();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [withdrawals, setWithdrawals] = useState<Transaction[]>([]);
  const [selectedTab, setSelectedTab] = useState<string>(
    "Purchase Transactions"
  );
  const [isLoading, setIsLoading] = useState(true);

  const [userData, setUserData] = useState<any>(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(20);

  // Simple functions for UI


  const getRankName = (rankIndex: number): string => {
    return ranks[rankIndex]?.name || "Unknown Rank";
  };

  const getTransactionTypeStyle = (tp: string, darkMode: boolean): string => {
    if (!tp)
      return darkMode
        ? "bg-gray-700 text-gray-300"
        : "bg-gray-200 text-gray-700";
    const cleanedTp = tp.toLowerCase().trim();

    if (darkMode) {
      switch (cleanedTp) {
        case "rank purchased":
        case "rank upgrade":
          return "bg-blue-900 text-blue-200";
        case "ltgb distribution":
        case "rab income withdrawal":
        case "level income withdrawal":
          return "bg-green-900 text-green-200";
        default:
          return "bg-gray-700 text-gray-300";
      }
    } else {
      switch (cleanedTp) {
        case "rank purchased":
        case "rank upgrade":
          return "bg-blue-100 text-blue-800";
        case "ltgb distribution":
        case "rab income withdrawal":
        case "level income withdrawal":
          return "bg-green-100 text-green-800";
        default:
          return "bg-gray-200 text-gray-700";
      }
    }
  };


   // Fetch transactions based on type
  // Fetch transactions based on type
// Add debugging to check API responses


const formatTimestamp = (timestamp) => {
  if (!timestamp) return "N/A";
  
  try {
    // Convert ISO string to Date object
    const date = new Date(timestamp);
    
    // Check if date is valid
    if (isNaN(date.getTime())) return "N/A";
    
    // Format the date as desired
    return date.toLocaleString();
  } catch (error) {
    console.error("Error formatting timestamp:", error);
    return "N/A";
  }
};

// Add a helper function to get rank index from name
const getRankIndex = (rankName) => {
  if (!rankName) return -1;
  const index = ranks.findIndex(rank => rank.name === rankName);
  return index >= 0 ? index : -1;
};


const fetchTransactions = async (userId: string) => {
  try {
    console.log("Fetching transactions from API for user ID:", userId);
    
    // Fetch purchase transactions
    const purchaseResponse = await Promise.all([
      userApi.getUserTransactions(userId, page, limit, "RANK_PURCHASE"),
      userApi.getUserTransactions(userId, page, limit, "RANK_UPGRADE"),
      userApi.getUserTransactions(userId, page, limit, "LEVEL_INCOME")
    ]);

    // Fetch withdrawal transactions
    const withdrawalResponse = await Promise.all([
      userApi.getUserTransactions(userId, page, limit, "LEVEL_WITHDRAWAL"),
      userApi.getUserTransactions(userId, page, limit, "LTG_WITHDRAWAL"),
      userApi.getUserTransactions(userId, page, limit, "RAB_WITHDRAWAL")
    ]);

    // Process purchase transactions with proper mapping based on the provided sample
    const allPurchaseTransactions = purchaseResponse.flatMap(response => {
      return (response.data?.transactions || []).map(tx => {
        console.log("Processing transaction:", tx);
        
        // Map according to your sample data structure
        const mappedTx = {
          // Use fromAddress for the sponsor (from field)
          from: tx.fromAddress || tx.sponsorAddress || "Unknown",
          
          // Convert rank name to index
          rank: tx.rank ? getRankIndex(tx.rank) : -1,
          
          // Use amount directly
          amt: parseFloat(tx.amount || 0),
          
          // Format timestamp using createdAt or timestamp
          ts: formatTimestamp(tx.createdAt || tx.timestamp),
          
          // Use type as the transaction type
          tp: tx.type || tx.transactionType || "Unknown"
        };
        
        console.log("Mapped transaction:", mappedTx);
        return mappedTx;
      });
    });

    // Similar process for withdrawals
    const allWithdrawalTransactions = withdrawalResponse.flatMap(response => {
      return (response.data?.transactions || []).map(tx => ({
        from: tx.fromAddress || tx.sourceAddress || "Unknown",
        amt: parseFloat(tx.amount || 0),
        ts: formatTimestamp(tx.createdAt || tx.timestamp),
        tp: tx.type || tx.transactionType || "Unknown"
      }));
    });

    console.log("Final processed purchase transactions:", allPurchaseTransactions);
    console.log("Final processed withdrawal transactions:", allWithdrawalTransactions);

    // Set transactions and withdrawals
    setTransactions(allPurchaseTransactions);
    setWithdrawals(allWithdrawalTransactions);

    // Calculate total pages
    const purchasePages = purchaseResponse
      .map(response => response.data?.pagination?.pages || 1)
      .reduce((max, current) => Math.max(max, current), 1);

    const withdrawalPages = withdrawalResponse
      .map(response => response.data?.pagination?.pages || 1)
      .reduce((max, current) => Math.max(max, current), 1);

    setTotalPages(Math.max(purchasePages, withdrawalPages));

  } catch (error) {
    console.error("Failed to fetch transactions:", error);
  } finally {
    setIsLoading(false);
  }
};


  // Pagination handler
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
  };

  // Determine which transactions to display
 




  useEffect(() => {
    const fetchUserDataAndTransactions = async () => {
      if (!isConnected || !address) return;

      setIsLoading(true);

      try {
        // Fetch user data
        const userResponse = await userApi.getUserByAddress(address);
        const userData = userResponse.data?.user;

        if (!userData) {
          setIsLoading(false);
          return;
        }

        setUserData(userData);

        // Fetch purchase transactions
        await fetchTransactions(userData.id);
      } catch (error) {
        console.error("Failed to fetch user data or transactions:", error);
        setIsLoading(false);
      }
    };

    fetchUserDataAndTransactions();
  }, [isConnected, address, page]);

  

  const shortenAddress = (address: string) => {
    if (!address) return "N/A";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Check if user is registered
  useEffect(() => {
    const checkRegistration = async () => {
      if (!isConnected) {
        // Give a brief delay to allow wallet to connect on page load
        setTimeout(() => {
          if (!isConnected) navigate("/");
        }, 2000);
        return;
      }

      if (!walletProvider || !address) return;

      try {
        const userResponse = await userApi.getUserByAddress(address);
      const userData1 = userResponse.data?.user;

      console.log("the userdata is",userData1)

      setUserData(userData1);
        // if (!userData || !userData.isActive) {
        //   navigate("/");
        // }
      } catch (error) {
        console.error("Error checking registration:", error);
      }
    };

    checkRegistration();
  }, [walletProvider, address, isConnected, navigate]);


  // Add this to a useEffect that runs once on component mount


  // Direct data fetching - simpler approach to ensure data is fetched
  useEffect(() => {
    const fetchData = async () => {
      if (!walletProvider || !address) return;

      setIsLoading(true);
      console.log("Fetching transaction data...");

      try {
        const provider = new BrowserProvider(walletProvider);
        const signer = await provider.getSigner();
        const contract = new Contract(contractAddress, contractAbi, signer);

        // Load cached data while waiting for fresh data
        try {
          const cachedPurchases = localStorage.getItem("transaction_purchases");
          const cachedWithdrawals = localStorage.getItem(
            "transaction_withdrawals"
          );

          if (cachedPurchases) {
            const parsedData = JSON.parse(cachedPurchases);
            //setTransactions(parsedData);
            console.log("Loaded cached purchases:", parsedData.length);
          }

          if (cachedWithdrawals) {
            const parsedData = JSON.parse(cachedWithdrawals);
           // setWithdrawals(parsedData);
            console.log("Loaded cached withdrawals:", parsedData.length);
          }
        } catch (e) {
          console.error("Error loading from cache:", e);
        }

        // Fetch purchases
        // if (contract.getUserInptTxn) {
        //   console.log("Fetching purchase transactions...");
        //   const rawTxns = await contract.getUserInptTxn(address);
        //   console.log("Raw purchase data:", rawTxns);

        //   const formattedTxns = rawTxns.map((txn: any) => ({
        //     from: txn[1] || "Unknown",
        //     rank: Number(txn[2] ?? -1),
        //     amt: Number(txn[3] || 0),
        //     ts: txn[4]
        //       ? new Date(Number(txn[4]) * 1000).toLocaleString()
        //       : "N/A",
        //     tp: txn.tp || txn[5] ? txn[5].toString() : "Unknown",
        //   }));

        //   console.log("Formatted purchases:", formattedTxns);
        //   setTransactions(formattedTxns);
        //   localStorage.setItem(
        //     "transaction_purchases",
        //     JSON.stringify(formattedTxns)
        //   );
        // } else {
        //   console.warn("getUserInptTxn function does not exist in contract");
        // }

        // // Fetch withdrawals
        // if (contract.getUserWthdrlTxn) {
        //   console.log("Fetching withdrawal transactions...");
        //   const withdrawalsData = await contract.getUserWthdrlTxn(address);
        //   console.log("Raw withdrawal data:", withdrawalsData);

        //   const formattedWithdrawals = withdrawalsData.map((txn: any) => ({
        //     from: txn.from || "Unknown",
        //     amt: parseFloat(formatUnits(txn.ttlamt || "0", 18)),
        //     ts: txn.ts
        //       ? new Date(Number(txn.ts) * 1000).toLocaleString()
        //       : "N/A",
        //     tp: txn.tp || "Unknown",
        //   }));

        //   console.log("Formatted withdrawals:", formattedWithdrawals);
        //   setWithdrawals(formattedWithdrawals);
        //   localStorage.setItem(
        //     "transaction_withdrawals",
        //     JSON.stringify(formattedWithdrawals)
        //   );
        // } else {
        //   console.warn("getUserWthdrlTxn function does not exist in contract");
        // }
      } catch (error) {
        console.error("Error fetching transaction data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [walletProvider, address]);

  // Determine which transactions to display
  const displayTransactions =
    selectedTab === "Purchase Transactions" ? transactions : withdrawals;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen p-4 md:p-6 lg:p-8"
    >
      <div className={`min-h-screen p-4 md:p-6 lg:p-8`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent mb-2 sm:mb-3 md:mb-4">
              Transaction History
            </h1>

            <div className="relative">
              <select
                value={selectedTab}
                onChange={(e) => setSelectedTab(e.target.value)}
                className={`appearance-none ${
                  darkMode
                    ? "bg-gray-800 text-purple-400"
                    : "bg-white text-purple-600"
                } border-2 border-purple-500 rounded-lg px-6 py-3 font-medium shadow-lg hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer`}
              >
                <option value="Purchase Transactions">
                  Purchase Transactions
                </option>
                <option value="Withdrawals">Withdrawals</option>
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg
                  className="w-5 h-5 text-purple-500"
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
            </div>
          </div>

          <div
            className={`${
              darkMode ? "bg-gray-800" : "bg-white"
            } rounded-2xl shadow-xl overflow-hidden border ${
              darkMode ? "border-gray-700" : "border-gray-200"
            } transition-all duration-300`}
          >
            {isLoading && displayTransactions.length === 0 ? (
              <div className="flex justify-center items-center h-20 text-gray-500">
                Loading transactions...
              </div>
            ) : displayTransactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <svg
                  className="w-16 h-16 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p
                  className={`text-xl ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  No transactions found
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  Reload Data
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-purple-600 to-blue-500 text-white">
                      <th className="px-6 py-4 text-left">#</th>
                      <th className="px-6 py-4 text-left">
                        {selectedTab === "Purchase Transactions"
                          ? "Sponsor"
                          : "From"}
                      </th>
                      {selectedTab === "Purchase Transactions" && (
                        <th className="px-6 py-4 text-left">Rank</th>
                      )}
                      <th className="px-6 py-4 text-right">
                        {selectedTab === "Purchase Transactions"
                          ? "Amount (USD)"
                          : "Amount (ITC)"}
                      </th>
                      <th className="px-6 py-4 text-left">Date & Time</th>
                      <th className="px-6 py-4 text-left">Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayTransactions.map((txn, index) => (
                      <tr
                        key={index}
                        className={`border-b ${
                          darkMode
                            ? "border-gray-700 hover:bg-gray-700/50"
                            : "border-gray-200 hover:bg-gray-50"
                        } transition-colors duration-200`}
                      >
                        <td
                          className={`px-6 py-4 ${
                            darkMode ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          {index + 1}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <span
                              className={`font-medium ${
                                darkMode ? "text-gray-100" : "text-gray-900"
                              }`}
                              title={txn.from}
                            >
                              {shortenAddress(txn.from || "N/A")}
                            </span>
                          </div>
                        </td>
                        {selectedTab === "Purchase Transactions" && (
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              {txn.rank !== undefined &&
                              txn.rank >= 0 &&
                              txn.rank < ranks.length ? (
                                <>
                                  <img
                                    src={ranks[txn.rank]?.image}
                                    alt={getRankName(txn.rank)}
                                    className="h-8 w-8 rounded-full object-cover ring-2 ring-purple-500"
                                  />
                                  <span
                                    className={`font-medium ${
                                      darkMode
                                        ? "text-gray-100"
                                        : "text-gray-900"
                                    }`}
                                  >
                                    {getRankName(txn.rank)}
                                  </span>
                                </>
                              ) : (
                                <span className="text-gray-500">Unknown</span>
                              )}
                            </div>
                          </td>
                        )}
                        <td className="px-6 py-4 text-right">
                          <span
                            className={`font-medium ${
                              darkMode ? "text-gray-100" : "text-gray-900"
                            }`}
                          >
                            {selectedTab === "Purchase Transactions"
                              ? `$${parseFloat(String(txn.amt)).toFixed(2)}`
                              : `${txn.amt ? txn.amt.toFixed(4) : "0.0000"}`}
                              
                          </span>
                        </td>
                        <td
                          className={`px-6 py-4 ${
                            darkMode ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          {txn.ts || "N/A"}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getTransactionTypeStyle(
                              txn.tp,
                              darkMode
                            )}`}
                          >
                            {txn.tp || "Unknown"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Transactions;
