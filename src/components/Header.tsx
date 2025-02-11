import { useState, useEffect } from "react";
import {
  useWeb3Modal,
  useWeb3ModalAccount,
  useWeb3ModalProvider,
} from "@web3modal/ethers5/react";
import { useLocation, useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import { motion, AnimatePresence } from "framer-motion";
import { usePriceData } from "../components/PriceContext";
import { useDarkMode } from "./DarkModeContext";
import FeaturesSection from "../components/FeaturesSection";
import Light from "../components/Light";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import tokenAbi from "./token/tokenAbi";
import tokenAddress from "./token/tokenAdd";
import contractAbi from "./Props/contractAbi";
import contractAddress from "./Props/contractAddress";
import { Menu, X, Moon, Sun, Wallet } from "lucide-react";

interface NavigationItem {
  name: string;
  path: string;
  minRank?: number;
}

const Header = () => {
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [itcBalance, setItcBalance] = useState("0.00");
  const { walletProvider } = useWeb3ModalProvider();
  const [menuOpen, setMenuOpen] = useState(false);
  const { open } = useWeb3Modal();
  const { address, isConnected } = useWeb3ModalAccount();
  const location = useLocation();
  const navigate = useNavigate();
  const [userRank, setUserRank] = useState(0);

  const navigationItems: NavigationItem[] = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Referral Tree", path: "/referral-tree" },
    { name: "LTGB", path: "/LtgBon" },
    { name: "RAB", path: "/rab", minRank: 4 },
    { name: "Rank Detail", path: "/rank-detail" },
    { name: "Transactions", path: "/Tansactions" },
  ];
  const { priceData } = usePriceData();

  const [previousPrice, setPreviousPrice] = useState(priceData?.TITCperTUSDT);

  useEffect(() => {
    if (priceData?.TITCperTUSDT !== previousPrice) {
      setPreviousPrice(priceData?.TITCperTUSDT);
    }
  }, [priceData?.TITCperTUSDT]);

  const fetchItcBalance = async () => {
    if (!walletProvider || !isConnected || !address) return;
    try {
      const provider = new ethers.providers.Web3Provider(walletProvider);
      const contract = new ethers.Contract(tokenAddress, tokenAbi, provider);
      const balance = await contract.balanceOf(address);
      setItcBalance(parseFloat(ethers.utils.formatEther(balance)).toFixed(2));
    } catch (error) {
      console.error("Error fetching balance:", error);
      setItcBalance("0.00");
    }
  };

  useEffect(() => {
    const interval = setInterval(fetchItcBalance, 10000);
    fetchItcBalance();
    return () => clearInterval(interval);
  }, [isConnected, walletProvider, address]);

  const fetchUserDetails = async () => {
    if (!walletProvider) return;

    try {
      const ethersProvider = new ethers.providers.Web3Provider(walletProvider);
      const signer = ethersProvider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        contractAbi,
        signer
      );
      const userData = await contract.users(address);
      const currentRank = userData[1];
      setUserRank(currentRank);
    } catch (error) {
      console.error("Error fetching user details:", error);
      setUserRank(-1);
    }
  };

  useEffect(() => {
    if (isConnected && walletProvider && address) {
      fetchUserDetails();
    }
  }, [isConnected, walletProvider, address, location.pathname]);

  const handleMobileConnect = async (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      if (typeof open !== "function") {
        throw new Error("Wallet connection function is not available.");
      }
      await open();
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  const handleWalletClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (isConnected) {
      await open({ view: "Account" });
    } else {
      await open({ view: "Connect" });
    }
  };

  const ADMIN_ADDRESSES = [
    "0x978ef2f8e2BB491Adf7358be7fFB527E7bD47312".toLowerCase(),
    "0x3E582a9FFD780A4DFC8AAb220A644596772B919E".toLowerCase(),
  ];

  const isAdmin = (userAddress: string | undefined): boolean => {
    if (!userAddress) return false;
    return ADMIN_ADDRESSES.includes(userAddress.toLowerCase());
  };

  const handleNavigation = (item: NavigationItem) => {
    if (!address) return;

    if (isAdmin(address) && item.path === "/dashboard") {
      navigate("/admin/dashboard");
      return;
    }

    if (
      !isAdmin(address) &&
      item.minRank !== undefined &&
      userRank < item.minRank
    ) {
      navigate("/NewRach");
      return;
    }

    navigate(item.path);
    setMenuOpen(false);
  };

  useEffect(() => {
    const checkUserStatus = async () => {
      if (!walletProvider || !address || !isConnected) return;

      try {
        const ethersProvider = new ethers.providers.Web3Provider(
          walletProvider
        );
        const contract = new ethers.Contract(
          contractAddress,
          contractAbi,
          ethersProvider
        );

        if (isAdmin(address)) {
          localStorage.setItem("isAdmin", "true");
          if (location.pathname === "/dashboard") {
            navigate("/admin/dashboard");
          }
          return;
        }

        const userData = await contract.users(address);
        if (userData.isActive) {
          localStorage.setItem("isAdmin", "false");
          if (location.pathname === "/admin/dashboard") {
            navigate("/dashboard");
          }
        }
      } catch (error) {
        console.error("Error checking user status:", error);
        localStorage.removeItem("isAdmin");
      }
    };

    checkUserStatus();
  }, [address, isConnected, walletProvider, location.pathname]);

  const isActivePath = (path: string): boolean => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  const headerVariants = {
    hidden: { y: -100 },
    visible: {
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20,
      },
    },
  };

  const menuVariants = {
    closed: {
      opacity: 0,
      scale: 0.95,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
    open: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        staggerChildren: 0.1,
      },
    },
  };

  // Rest of your return statement remains the same
  return (
<> 
    <div className="fixed inset-0 -z-10">
    {darkMode ? <FeaturesSection /> : <Light />}
  </div>

    <div className="relative">
      <motion.header
        variants={headerVariants}
        initial="hidden"
        animate="visible"
        className={`sticky my-5 mx-6 inset-x-0 top-0 z-[70] px-6 py-3 backdrop-blur-xl transition-all duration-300 ${
          darkMode
            ? "bg-gray-900/80 border-gray-800"
            : "bg-white/70 border-gray-100"
        } border rounded-3xl shadow-lg`}
      >
        <div className="flex items-center justify-between ">
          {/* Logo */}
          <motion.div whileHover={{ scale: 1.3 }} whileTap={{ scale: 0.95 }}>
            <a href="/">
              <img
                className="h-12 w-auto"
                src="https://cticlub.org/assets/images/brand/itclogow.png"
                alt="ITC Logo"
              />
            </a>
          </motion.div>

          {/* ITC Price in Navbar - Desktop Only */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`hidden lg:flex items-center px-5 py-2 rounded-xl backdrop-blur-xl mx-4 ${
              darkMode
                ? "bg-gray-800 text-gray-300"
                : "bg-white/80 text-gray-600"
            } shadow-lg`}
          >
            <motion.div
              className="flex items-center space-x-3"
              animate={{
                scale: [1, 1.02, 1],
                transition: { duration: 1, repeat: Infinity },
              }}
            >
              <span className="text-sm font-semibold uppercase opacity-75">
                ITC Price
              </span>
              <motion.span
                key={priceData?.TITCperTUSDT}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`text-lg font-bold ${
                  parseFloat(priceData?.TITCperTUSDT || "0.0") >
                  parseFloat(previousPrice || "0.0")
                    ? "text-green-500"
                    : parseFloat(priceData?.TITCperTUSDT || "0.0") <
                      parseFloat(previousPrice || "0.0")
                    ? "text-red-500"
                    : darkMode
                    ? "text-white"
                    : "text-gray-900"
                }`}
              >
                ${parseFloat(priceData?.TITCperTUSDT || "0.0").toFixed(6)}
              </motion.span>
            </motion.div>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-4 flex-grow justify-center">
            {navigationItems.map((item) => (
              <motion.button
                key={item.name}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleNavigation(item)}
                className={`px-3 py-1.5 text-sm font-medium transition-all duration-200 rounded-lg ${
                  isActivePath(item.path)
                    ? darkMode
                      ? "bg-gray-800 text-white"
                      : "bg-gray-100 text-gray-900"
                    : darkMode
                    ? "text-gray-300 hover:bg-gray-800"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                {item.name}
              </motion.button>
            ))}
          </div>

          {/* Desktop Wallet & Theme Toggle */}
          <div className="hidden lg:flex items-center space-x-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className={`flex items-center px-3 py-2 rounded-xl ${
                darkMode ? "bg-gray-800 text-white" : "bg-gray-50 text-gray-700"
              }`}
            >
              <Wallet className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">{itcBalance} ITC</span>
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.08 }}
              onClick={handleWalletClick}
              className="relative px-6 py-2 text-sm font-semibold text-black dark:text-white rounded-xl border border-[#8000ffac] transition-all duration-300 
             backdrop-blur-lg bg-white/10 group overflow-hidden"
            >
              {/* Neon background that appears on hover */}
              <span className="absolute inset-0 bg-gradient-to-br from-[#00D4FF] to-[#9400D3] scale-x-0 origin-left transition-transform duration-300 ease-out group-hover:scale-x-100" />

              {/* Glowing Border Effect */}
              <span className="absolute inset-0 border border-[#00FFFF] rounded-xl opacity-50 transition-opacity duration-300 group-hover:opacity-100" />

              {/* Button text */}
              <span className="relative z-10">
                {!isConnected
                  ? "Connect Wallet"
                  : `${address?.slice(0, 6)}...${address?.slice(-4)}`}
              </span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1, rotate: 180 }}
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg ${
                darkMode
                  ? "bg-gray-800 text-yellow-400"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {darkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </motion.button>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setMenuOpen(!menuOpen)}
              className={`p-2 rounded-lg ${
                darkMode ? "text-white" : "text-gray-600"
              }`}
            >
              {menuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`fixed left-0 right-0 top-[calc(100%+1.25rem)] mx-6 z-[80] p-4 backdrop-blur-xl ${
                darkMode ? "bg-gray-900/95" : "bg-white/95"
              } rounded-2xl shadow-lg border ${
                darkMode ? "border-gray-800" : "border-gray-100"
              }`}
              style={{
                maxHeight: "calc(100vh - 120px)",
                overflowY: "auto",
              }}
            >
              {/* Navigation Items */}
              <div className="space-y-2">
                {navigationItems.map((item) => (
                  <motion.button
                    key={item.name}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => {
                      handleNavigation(item);
                      setMenuOpen(false);
                    }}
                    className={`block w-full text-left px-4 py-2 rounded-lg text-sm font-medium ${
                      isActivePath(item.path)
                        ? darkMode
                          ? "bg-gray-800 text-white"
                          : "bg-gray-100 text-gray-900"
                        : darkMode
                        ? "text-gray-300 hover:bg-gray-800"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {item.name}
                  </motion.button>
                ))}
              </div>

              {/* Mobile Wallet Section */}
              <div className="mt-4 space-y-3">
                <div
                  className={`p-4 rounded-xl ${
                    darkMode ? "bg-gray-800" : "bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-sm font-medium ${
                        darkMode ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      <Wallet className="w-4 h-4 inline mr-2" />
                      ITC Balance
                    </span>
                    <span className="text-sm font-bold">{itcBalance} ITC</span>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    onClick={handleMobileConnect}
                    className="relative w-full px-6 py-3 text-sm font-semibold text-black dark:text-white rounded-xl border border-[#9400D3] transition-all duration-300 
             backdrop-blur-lg bg-gradient-to-br from-[#4C00FF] to-[#9400D3] group overflow-hidden md:bg-white/10 md:text-black"
                  >
                    {/* Neon hover background */}
                    <span className="absolute inset-0 bg-gradient-to-br from-[#00D4FF] to-[#9400D3] scale-x-100 md:scale-x-0 origin-left transition-transform duration-300 ease-out group-hover:scale-x-100" />

                    {/* Glowing Border Effect */}
                    <span className="absolute inset-0 border border-[#00FFFF] rounded-xl opacity-70 transition-opacity duration-300 group-hover:opacity-100" />

                    {/* Button text */}
                    <span className="relative z-10">
                      {!isConnected
                        ? "Connect Wallet"
                        : `${address?.slice(0, 6)}...${address?.slice(-4)}`}
                    </span>
                  </motion.button>
                </div>

                {/* Theme Toggle */}
                <div
                  className={`p-4 rounded-xl ${
                    darkMode ? "bg-gray-800" : "bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-sm font-medium ${
                        darkMode ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      Theme
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 180 }}
                      onClick={toggleDarkMode}
                      className={`p-2 rounded-lg ${
                        darkMode
                          ? "bg-gray-700 text-yellow-400"
                          : "bg-white text-gray-600"
                      }`}
                    >
                      {darkMode ? (
                        <Sun className="w-5 h-5" />
                      ) : (
                        <Moon className="w-5 h-5" />
                      )}
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* ITC Price in Mobile Menu */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-3 p-4 rounded-xl ${
                  darkMode ? "bg-gray-800" : "bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-sm font-medium ${
                      darkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    ITC Price
                  </span>
                  <motion.span
                    key={priceData?.TITCperTUSDT}
                    className={`text-base font-bold ${
                      parseFloat(priceData?.TITCperTUSDT || "0.0") >
                      parseFloat(previousPrice || "0.0")
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    ${parseFloat(priceData?.TITCperTUSDT || "0.0").toFixed(4)}
                  </motion.span>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <ToastContainer position="top-right" autoClose={5000} />
    </div>

</>
  );
};

export default Header;
