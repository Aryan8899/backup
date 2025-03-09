//new

import { useState, useEffect } from "react";
import { ethers, BrowserProvider, Contract } from "ethers";
import {
  Provider,
  useAppKit,
  useAppKitProvider,
  useAppKitAccount,
} from "@reown/appkit/react";
import { userApi, RegistrationRequest } from "../api/userApi";
import { rankApi } from "../api/rankApi";
import { useBlockchain } from "../blockchainusecon/BlockchainContext";
import axios from "axios";
import { usePriceData } from "../context/PriceContext";
import { useDarkMode } from "../context/DarkModeContext";
import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, useLocation } from "react-router-dom";
import { contractAbi } from "../contracts/Props/contractAbi";
import { contractAddress } from "../contracts/Props/contractAddress";
import tokenAbi from "../contracts/token/tokenAbi";
import tokenAdd from "../contracts/token/tokenAdd";

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

interface Rank {
  id: number;
  name: string;
  image: string;
  gradient: string;
}

const ranks: Rank[] = [
  { id: 0, name: "STAR", image: rank0, gradient: "from-blue-400 to-blue-600" },
  {
    id: 1,
    name: "BRONZE",
    image: rank1,
    gradient: "from-amber-600 to-amber-800",
  },
  {
    id: 2,
    name: "SILVER",
    image: rank2,
    gradient: "from-gray-300 to-gray-500",
  },
  {
    id: 3,
    name: "GOLD",
    image: rank3,
    gradient: "from-yellow-400 to-yellow-600",
  },
  {
    id: 4,
    name: "DIAMOND",
    image: rank4,
    gradient: "from-cyan-400 to-cyan-600",
  },
  {
    id: 5,
    name: "BLUE_DIAMOND",
    image: rank5,
    gradient: "from-blue-500 to-blue-700",
  },
  {
    id: 6,
    name: "BLACK_DIAMOND",
    image: rank6,
    gradient: "from-gray-700 to-gray-900",
  },
  {
    id: 7,
    name: "ROYAL_DIAMOND",
    image: rank7,
    gradient: "from-purple-500 to-purple-700",
  },
  {
    id: 8,
    name: "CROWN_DIAMOND",
    image: rank8,
    gradient: "from-yellow-500 to-red-500",
  },
];

interface RankDetail {
  id: number;
  name: string;
  cumulativePrice: string;
  addedFeePrice: string;
  rankPriceInITC: string;
  // Adding new properties from rankApi
  baseCostITC: string;
  adminFee: string;
  totalITCCost: string;
}

const ADMIN_ADDRESSES = [
  "0x3E582a9FFD780A4DFC8AAb220A644596772B919E".toLowerCase(),
];

const RegisterRank = () => {
  const { darkMode, toggleDarkMode } = useDarkMode();
  const navigate = useNavigate();
  const location = useLocation();
  const { open } = useAppKit();
  const { address } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider<Provider>("eip155");
  const { priceData } = usePriceData();
  const [isProcessing, setIsProcessing] = useState(false);
  const [rankDetails, setRankDetails] = useState<RankDetail[]>([]);
  const [selectedRank, setSelectedRank] = useState<number>(0);
  const [referralAddress, setReferralAddress] = useState<string>("");
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [referrerAddress, setReferrerAddress] = useState("");
  const [sessionData, setSessionData] = useState<any>(null);
  const { account, isConnected, connect, approveTokens, deposit, balance } =
    useBlockchain();
  const [success, setSuccess] = useState("");
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const referral = queryParams.get("referral");
    if (referral) {
      setReferralAddress(referral);
    }
  }, [location]);

  useEffect(() => {
    // Check for admin status first
    if (address && ADMIN_ADDRESSES.includes(address.toLowerCase())) {
      navigate("/admin/dashboard");
      return; // Exit early for admin addresses
    }

    const checkIfUserIsRegistered = async () => {
      if (address) {
        try {
          // First check via API
          const userCheckResponse = await userApi.getUserByAddress(address);
          console.log("Full User Check Response:", userCheckResponse);

          // Enhanced logging for status and data
          console.log("Response Status:", userCheckResponse.status);
          console.log("Response User Data:", userCheckResponse.data?.user);

          // More robust checking - access isActive from nested user object
          if (
            userCheckResponse.status === "success" &&
            userCheckResponse.data?.user &&
            userCheckResponse.data.user.isActive === true
          ) {
            console.log("User is active - navigating to dashboard");
            toast.info("You are already registered");
            navigate("/dashboard");
            return;
          } else {
            console.log("User not active or incomplete registration", {
              status: userCheckResponse.status,
              isActive: userCheckResponse.data?.user?.isActive,
              userData: userCheckResponse.data?.user,
            });
          }
        } catch (error) {
          console.error("Detailed Error checking registration:", error);

          // If it's an axios error, log more details
          if (axios.isAxiosError(error)) {
            console.error("Axios Error Details:", {
              response: error.response?.data,
              status: error.response?.status,
              message: error.message,
            });
          }
        }
      } else {
        console.warn("No address provided for registration check");
      }
    };

    checkIfUserIsRegistered();
  }, [contract, address, navigate]);

  useEffect(() => {
    const fetchRankDetails = async () => {
      setIsLoading(true);

      try {
        const details: RankDetail[] = [];

        for (let i = 0; i < ranks.length; i++) {
          try {
            // Use rankApi to fetch price details for each rank
            const response = await rankApi.getRankPrice(ranks[i].name);
            const priceDetails = response.data;

            details.push({
              id: i,
              name: ranks[i].name,
              // Maintain old properties for backward compatibility
              cumulativePrice: "0.00",
              addedFeePrice: "0.00",
              rankPriceInITC: priceDetails.totalITCCost?.toFixed(2) || "0.00",
              // Add new properties from rankApi
              baseCostITC: priceDetails.baseCostITC?.toFixed(2) || "0.00",
              adminFee: priceDetails.adminFee?.toFixed(2) || "0.00",
              totalITCCost: priceDetails.totalITCCost?.toFixed(2) || "0.00",
            });
          } catch (error) {
            console.error(
              `Error fetching price for rank ${ranks[i].name}:`,
              error
            );
            // Add with placeholder values in case of error
            details.push({
              id: i,
              name: ranks[i].name,
              cumulativePrice: "0.00",
              addedFeePrice: "0.00",
              rankPriceInITC: "0.00",
              baseCostITC: "0.00",
              adminFee: "0.00",
              totalITCCost: "0.00",
            });
          }
        }

        setRankDetails(details);
      } catch (error) {
        console.error("Error fetching rank details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRankDetails();
  }, []);

  useEffect(() => {
    if (walletProvider) {
      const initializeContract = async () => {
        const provider = new BrowserProvider(walletProvider);
        const signer = await provider.getSigner();
        const contractInstance = new Contract(
          contractAddress,
          contractAbi,
          signer
        );
        setContract(contractInstance);
      };
      initializeContract();
    }
  }, [walletProvider]);

  const handleRegistration = async () => {
    // Reset processing state and clear previous errors
    setIsProcessing(true);
    setSuccess("");

    // Validate inputs
    if (!address) {
      toast.error("Please connect your wallet");
      setIsProcessing(false);
      return;
    }

    if (!referralAddress) {
      toast.error("Please enter a referral address");
      setIsProcessing(false);
      return;
    }

    if (selectedRank === null) {
      toast.error("Please select a rank");
      setIsProcessing(false);
      return;
    }

    // Validate referral address format
    if (!ethers.isAddress(referralAddress)) {
      toast.error("Invalid referral address format");
      setIsProcessing(false);
      return;
    }

    // Prevent self-referral
    if (referralAddress.toLowerCase() === address.toLowerCase()) {
      toast.error("You cannot use your own address as referral");
      setIsProcessing(false);
      return;
    }

    try {
      // 1️⃣ **Register the user** (Session Creation)
      const registrationRequest = {
        address: address,
        referrerAddress: referralAddress,
        rank: ranks[selectedRank].name,
      };

      console.log("📢 Calling /api/users/register...");
      const sessionResponse = await axios.post(
        "http://localhost:3000/api/users/register",
        registrationRequest
      );

      const sessionData = sessionResponse.data;
      console.log("✅ Registration session created:", sessionData);

      // 2️⃣ **Approve Tokens**
      try {
        console.log("📢 Approving tokens...");
        await approveTokens(sessionData.totalCost.toString());
        console.log("✅ Tokens approved!");
      } catch (approvalError) {
        console.error("❌ Token approval failed:", approvalError);
        toast.error("Token approval failed. Please try again.");
        setIsProcessing(false);
        return;
      }

      // 3️⃣ **Deposit Tokens**
      let depositTransaction;
      try {
        console.log("📢 Depositing tokens...");
        depositTransaction = await deposit(
          sessionData.totalCost.toString(),
          sessionData.sessionId
        );
        console.log("✅ Tokens deposited:", depositTransaction);
      } catch (depositError) {
        console.error("❌ Token deposit failed:", depositError);
        toast.error("Token deposit failed. Please try again.");
        setIsProcessing(false);
        return;
      }

      // 4️⃣ **Process Registration on Backend**
      let processRegistrationResponse;
      try {
        console.log("📢 Processing registration...");
        processRegistrationResponse = await axios.post(
          "http://localhost:3000/api/users/process-registration",
          {
            sessionData: sessionData,
            transactionHash: depositTransaction.hash,
          }
        );
        console.log(
          "✅ Registration processed:",
          processRegistrationResponse.data
        );
      } catch (processError) {
        console.error("❌ Registration processing failed:", processError);
        toast.error("Registration processing failed. Please contact support.");
        setIsProcessing(false);
        return;
      }

      // 5️⃣ **Final Success Message**
      setSuccess("🎉 Registration completed successfully!");
      toast.success("Registration completed successfully!");
      navigate("/dashboard");
    } catch (error) {
      console.error("❌ Comprehensive registration error:", error);
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Registration failed";
        toast.error(errorMessage);
      } else if (error instanceof Error) {
        toast.error(error.message || "An unexpected error occurred");
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <ToastContainer />
      <div
        className={`relative min-h-screen flex items-center justify-center p-4`}
      >
        <motion.button
          whileHover={{ scale: 1.1, rotate: 180 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleDarkMode}
          className={`fixed top-6 right-6 p-3 rounded-xl backdrop-blur-xl border transition-all duration-300 shadow-lg z-50 ${
            darkMode
              ? "bg-gray-800/80 border-gray-700 text-yellow-400"
              : "bg-white/80 border-gray-300 text-gray-700 hover:bg-gray-100"
          }`}
        >
          {darkMode ? (
            <Sun className="w-6 h-6" />
          ) : (
            <Moon className="w-6 h-6" />
          )}
        </motion.button>

        <div
          className={`w-full max-w-6xl ${
            darkMode
              ? "bg-white/10 border-white/20"
              : "bg-white/90 border-gray-200 shadow-xl"
          } backdrop-blur-lg rounded-2xl shadow-2xl p-8 space-y-8 border z-10`}
        >
          <div className="flex flex-col items-center space-y-4">
            <img
              className="w-20 h-20 lg:w-24 lg:h-24"
              src="https://cticlub.org/assets/images/brand/itclogow.png"
              alt="logo"
            />
            <h1
              className={`text-4xl font-bold ${
                darkMode ? "text-white" : "text-gray-800 text-opacity-90"
              } text-center`}
            >
              Register & Select Your Rank
            </h1>
            <p
              className={`${
                darkMode ? "text-gray-300" : "text-gray-700 text-opacity-80"
              } text-center max-w-2xl`}
            >
              Choose your preferred rank to begin your journey. Each rank offers
              unique benefits and opportunities.
            </p>
          </div>

          {!address ? (
            <div className="flex flex-col items-center space-y-4">
              <button
                onClick={() => open()}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Connect Wallet to Continue
              </button>
              <p
                className={`${
                  darkMode ? "text-gray-600" : "text-gray-700 text-opacity-70"
                } text-sm`}
              >
                Connect your wallet to access registration
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              <div
                className={`
                ${
                  darkMode
                    ? "bg-white/5 border-white/10"
                    : "bg-gray-100 border-gray-200"
                } rounded-xl p-4 border`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`
      w-3 h-3 rounded-full animate-pulse 
      ${darkMode ? "bg-green-400" : "bg-green-500"}`}
                    />
                    <span
                      className={`
        text-sm font-medium tracking-wider uppercase  sm:text-sm
        ${darkMode ? "text-gray-300" : "text-gray-700 text-opacity-80"}`}
                    >
                      Connected Wallet
                    </span>
                  </div>
                  <span
                    className={`
    font-mono text-sm tracking-wider break-words 
    ${
      darkMode
        ? "text-white"
        : "text-gray-800 font-semibold bg-gray-200 px-2 py-1 rounded-md"
    }
  `}
                  >
                    {address
                      ? window.innerWidth < 640
                        ? `${address.slice(0, 3)}...${address.slice(-3)}` // Shorten for small screens
                        : address
                      : "N/A"}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label
                  className={`
                  ${darkMode ? "text-gray-300" : "text-gray-700"}
                  text-sm`}
                >
                  Referral Address
                </label>
                <input
                  type="text"
                  placeholder="Enter referral address"
                  value={referralAddress}
                  onChange={(e) => setReferralAddress(e.target.value)}
                  className={`
                    w-full rounded-xl px-6 py-4 focus:outline-none transition-colors
                    ${
                      darkMode
                        ? "bg-white/5 border-white/20 text-white focus:border-cyan-500"
                        : "bg-gray-100 border border-gray-300 text-gray-800 focus:border-cyan-600 focus:ring-2 focus:ring-cyan-200"
                    }`}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rankDetails.map((rank) => (
                  <div
                    key={rank.id}
                    onClick={() => setSelectedRank(rank.id)}
                    className={`
                      relative overflow-hidden rounded-xl border transition-all duration-300 cursor-pointer
                      ${
                        selectedRank === rank.id
                          ? "border-cyan-500 shadow-lg shadow-cyan-500/30"
                          : `${
                              darkMode
                                ? "border-white/10 hover:border-white/30"
                                : "border-gray-300 hover:border-cyan-400"
                            }`
                      }
                      ${
                        rank.name === "CROWN_DIAMOND"
                          ? "md:col-span-2 lg:col-span-1"
                          : ""
                      }
                    `}
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${
                        ranks[rank.id].gradient
                      } opacity-10`}
                    />

                    <div className="relative p-6 flex flex-col items-center space-y-4">
                      <img
                        src={ranks[rank.id].image}
                        alt={rank.name}
                        className="w-20 h-20 object-contain mb-4"
                      />
                      <h3
                        className={`text-xl font-bold ${
                          darkMode
                            ? "text-white"
                            : "text-gray-800 text-opacity-90"
                        }`}
                      >
                        {rank.name}
                      </h3>

                      <div className="space-y-2 text-center">
                        <div
                          className={`
                          ${darkMode ? "text-gray-300" : "text-gray-600"}
                        `}
                        >
                          <span className="text-sm">Base Cost:</span>
                          <p
                            className={`text-lg font-semibold ${
                              darkMode
                                ? "text-white"
                                : "text-gray-800 text-opacity-90"
                            }`}
                          >
                            {rank.baseCostITC} ITC
                          </p>
                        </div>
                        <div
                          className={`
                          ${darkMode ? "text-gray-300" : "text-gray-600"}
                        `}
                        >
                          <span className="text-sm">Admin Fee:</span>
                          <p
                            className={`text-lg font-semibold ${
                              darkMode ? "text-cyan-400" : "text-cyan-600"
                            }`}
                          >
                            {rank.adminFee} ITC
                          </p>
                        </div>

                        <div
                          className={`
                            ${darkMode ? "text-gray-300" : "text-gray-600"}
                          `}
                        >
                          <span className="text-sm">Total Cost:</span>
                          <p
                            className={`text-lg font-semibold ${
                              darkMode ? "text-cyan-400" : "text-cyan-600"
                            }`}
                          >
                            {rank.totalITCCost} ITC
                          </p>
                        </div>
                      </div>

                      {selectedRank === rank.id && (
                        <div className="absolute top-4 right-4">
                          <div className="bg-cyan-500 rounded-full p-1">
                            <svg
                              className="w-4 h-4 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleRegistration}
                disabled={isProcessing || !referralAddress}
                className={`
                  w-full py-4 px-6 rounded-xl text-white font-semibold transition-all duration-300
                  ${
                    isProcessing || !referralAddress
                      ? "bg-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 transform hover:scale-[1.02]"
                  }
                `}
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  "Register & Purchase Rank"
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default RegisterRank;
