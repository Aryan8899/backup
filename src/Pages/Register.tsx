import { useState, useEffect } from "react";
import { ethers, BrowserProvider, Contract } from "ethers";
import {
  Provider,
  useAppKit,
  useAppKitProvider,
  useAppKitAccount,
} from "@reown/appkit/react";
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
}

const ADMIN_ADDRESSES = [
  "0x3E582a9FFD780A4DFC8AAb220A644596772B919E".toLowerCase(),
  "0x0Ac0920459Ae9c1ABB3D866C1f772e7f0697B069".toLowerCase(),
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
      if (contract && address) {
        try {
          const isRegistered = await contract.users(address);
          if (isRegistered.isActive) {
            navigate("/dashboard");
          }
        } catch (error) {
          console.error("Error checking registration:", error);
        }
      }
    };

    checkIfUserIsRegistered();
  }, [contract, address, navigate]);

  useEffect(() => {
    const fetchRankDetails = async () => {
      if (contract) {
        const details: RankDetail[] = [];
        for (let i = 0; i < ranks.length; i++) {
          try {
            const rankDetail = await contract.rankDetails(i);
            const cumulativePriceUSD = parseFloat(
              rankDetail.cumulativePrice.toString()
            );

            const addedFeePrice =
              cumulativePriceUSD + cumulativePriceUSD * 0.03;
            const rankPriceInITC =
              addedFeePrice * parseFloat(priceData?.TUSDTperTITC || "0.0");

            details.push({
              id: i,
              name: ranks[i].name,
              cumulativePrice: cumulativePriceUSD.toFixed(2),
              addedFeePrice: addedFeePrice.toFixed(2),
              rankPriceInITC: rankPriceInITC.toFixed(2),
            });
          } catch (error) {
            console.error(`Error fetching rank ${i} details:`, error);
          }
        }
        setRankDetails(details);
      }
    };

    fetchRankDetails();
  }, [contract, priceData]);

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
    if (!contract || !referralAddress || !walletProvider) {
      toast.error(
        "Please connect wallet, select a rank, and enter referral address."
      );
      return;
    }

    if (address && ADMIN_ADDRESSES.includes(address.toLowerCase())) {
      navigate("/admin/dashboard");
      return;
    }

    try {
      setIsProcessing(true);

      // First check if user exists in database
      try {
        const checkUserResponse = await axios.get(
          `https://server.cryptomx.site/api/users/check/${address}`
        );

        // If user exists in database but not in contract, delete from database
        if (checkUserResponse.data.exists) {
          const isRegisteredOnChain = await contract.users(address);
          if (!isRegisteredOnChain.isActive) {
            await axios.delete(
              `https://server.cryptomx.site/api/users/${address}`
            );
          } else {
            // User exists both in database and contract
            toast.error("User already registered");
            navigate("/dashboard");
            return;
          }
        }
      } catch (error) {
        console.error("Error checking user status:", error);
        // Continue with registration if check fails
      }

      const provider = new BrowserProvider(walletProvider);
      const signer = await provider.getSigner();
      const tokenContract = new Contract(tokenAdd, tokenAbi, signer);

      const currentAllowance = await tokenContract.allowance(
        address,
        contractAddress
      );

      if (BigInt(currentAllowance) === BigInt(0)) {
        const maxUint256 = ethers.MaxUint256;
        const approveTx = await tokenContract.approve(
          contractAddress,
          maxUint256
        );
        await approveTx.wait();
      }

      // Process contract registration
      const tx = await contract.registerAndPurchaseRank(
        referralAddress,
        selectedRank
      );
      await tx.wait();

      // Only after successful contract registration, register in database
      try {
        const response = await axios.post(
          `https://server.cryptomx.site/api/users/register`,
          {
            address: address,
          }
        );

        console.log("User registered:", response.data);
        toast.success("Registration completed successfully!");
        navigate("/dashboard");
      } catch (error) {
        console.error("Error during database registration:", error);
        // Even if database registration fails, contract registration succeeded
        toast.warning(
          "Contract registration successful but database update failed. Please contact support."
        );
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Registration failed:", error);
      toast.error(
        "Registration failed. Please check your inputs and try again."
      );
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
                          <span className="text-sm">Price:</span>
                          <p
                            className={`text-lg font-semibold ${
                              darkMode
                                ? "text-white"
                                : "text-gray-800 text-opacity-90"
                            }`}
                          >
                            ${rank.addedFeePrice}
                          </p>
                        </div>
                        <div
                          className={`
                          ${darkMode ? "text-gray-300" : "text-gray-600"}
                        `}
                        >
                          <span className="text-sm">ITC Required:</span>
                          <p
                            className={`text-lg font-semibold ${
                              darkMode ? "text-cyan-400" : "text-cyan-600"
                            }`}
                          >
                            {rank.rankPriceInITC} ITC
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
