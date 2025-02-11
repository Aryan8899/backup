import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { contractAbi } from "./Props/contractAbi";
import { contractAddress } from "./Props/contractAddress";
import {
  useWeb3ModalProvider,
  useWeb3ModalAccount,
} from "@web3modal/ethers5/react";
import { useNavigate } from "react-router-dom";
import FeaturesSection from "../components/FeaturesSection";
import Light from "../components/Light";
import { useDarkMode } from "../components/DarkModeContext";
import "../index.css";

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

interface Transaction {
  user: string;
  from: string;
  rank: number;
  amt: number;
  fee: number;
  ts: number;
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
  const { walletProvider } = useWeb3ModalProvider();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [withdrawals, setWithdrawals] = useState<Transaction[]>([]);
  const [selectedTab, setSelectedTab] = useState<string>(
    "Purchase Transactions"
  );
  const [isProviderReady, setIsProviderReady] = useState(false);
  const { address, isConnected } = useWeb3ModalAccount();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsProviderReady(!!walletProvider);
  }, [walletProvider]);

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

  useEffect(() => {
    const checkRegistrationStatus = async (newAddress: string) => {
      if (!isConnected || !walletProvider || !isProviderReady || !newAddress) {
        console.warn("Wallet is not connected or provider is not ready.");
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

        const userData = await contract.users(newAddress);

        if (!userData || !userData.isActive) {
          navigate("/");
        }
      } catch (error) {
        console.error("Error checking registration status:", error);
        navigate("/");
      }
    };

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length > 0) {
        checkRegistrationStatus(accounts[0]);
      } else {
        navigate("/");
      }
    };

    if (walletProvider) {
      const provider = new ethers.providers.Web3Provider(walletProvider as any);
      const externalProvider = provider.provider as any;

      if (externalProvider?.on) {
        externalProvider.on("accountsChanged", handleAccountsChanged);
      }

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
    const fetchTransactions = async () => {
      try {
        if (!walletProvider) return;

        const provider = new ethers.providers.Web3Provider(walletProvider);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(
          contractAddress,
          contractAbi,
          signer
        );

        const userAddress = await signer.getAddress();

        if (contract.getUserInptTxn) {
          const rawTxns = await contract.getUserInptTxn(userAddress);
          const formattedTxns = rawTxns.map((txn: any) => ({
            from: txn[1],
            rank: Number(txn[2] ?? -1),
            amt: txn[3].toNumber(),
            ts: txn[4]
              ? new Date(txn[4].toNumber() * 1000).toLocaleString()
              : "N/A",
            tp: txn.tp || txn[5] ? txn[5].toString() : "Unknown",
          }));
          setTransactions(formattedTxns);
        } else {
          console.warn("getUserInptTxn function does not exist in contract");
        }

        if (contract.getUserWthdrlTxn) {
          const withdrawalsData = await contract.getUserWthdrlTxn(userAddress);
          const formattedWithdrawals = withdrawalsData.map((txn: any) => ({
            from: txn.from,
            amt: parseFloat(ethers.utils.formatEther(txn.ttlamt)),
            ts: new Date(txn.ts.toNumber() * 1000).toLocaleString(),
            tp: txn.tp,
          }));
          setWithdrawals(formattedWithdrawals);
        } else {
          console.warn("getUserWthdrlTxn function does not exist in contract");
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching transactions:", error);
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [walletProvider]);

  const shortenAddress = (address: string) =>
    `${address.slice(0, 6)}...${address.slice(-4)}`;

  return (
    <div className={`min-h-screen p-4 md:p-6 lg:p-8 `}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent mb-4 md:mb-0">
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
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : selectedTab === "Purchase Transactions" &&
            transactions.length === 0 ? (
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
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-purple-600 to-blue-500 text-white">
                    <th className="px-6 py-4 text-left">#</th>
                    {selectedTab === "Purchase Transactions" ? (
                      <>
                        <th className="px-6 py-4 text-left">Sponsor</th>
                        <th className="px-6 py-4 text-left">Rank</th>
                        <th className="px-6 py-4 text-right">Amount (USD)</th>
                        <th className="px-6 py-4 text-left">Date & Time</th>
                        <th className="px-6 py-4 text-left">Type</th>
                      </>
                    ) : (
                      <>
                        <th className="px-6 py-4 text-left">From</th>
                        <th className="px-6 py-4 text-right">Amount (ITC)</th>
                        <th className="px-6 py-4 text-left">Date & Time</th>
                        <th className="px-6 py-4 text-left">Type</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {(selectedTab === "Purchase Transactions"
                    ? transactions
                    : withdrawals
                  ).map((txn, index) => (
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
                      {selectedTab === "Purchase Transactions" ? (
                        <>
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
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <img
                                src={ranks[txn.rank]?.image}
                                alt={getRankName(txn.rank)}
                                className="h-8 w-8 rounded-full object-cover ring-2 ring-purple-500"
                              />
                              <span
                                className={`font-medium ${
                                  darkMode ? "text-gray-100" : "text-gray-900"
                                }`}
                              >
                                {getRankName(txn.rank)}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span
                              className={`font-medium ${
                                darkMode ? "text-gray-100" : "text-gray-900"
                              }`}
                            >
                              ${txn.amt ? txn.amt.toFixed(2) : "0.00"}
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
                              {txn.tp}
                            </span>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-6 py-4">
                            <span
                              className={`font-medium ${
                                darkMode ? "text-gray-100" : "text-gray-900"
                              }`}
                              title={txn.from}
                            >
                              {shortenAddress(txn.from || "N/A")}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span
                              className={`font-medium ${
                                darkMode ? "text-gray-100" : "text-gray-900"
                              }`}
                            >
                              {txn.amt ? txn.amt.toFixed(4) : "0.0000"}
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
                              {txn.tp}
                            </span>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Transactions;
