import React from "react";
import { AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useWeb3ModalAccount } from "@web3modal/ethers5/react";

const SorryPage: React.FC = () => {
  const navigate = useNavigate();
  const { isConnected } = useWeb3ModalAccount();
  
  return (
    <> 
     {!isConnected ? (
        navigate("/")
      ) : (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="relative w-full max-w-md sm:max-w-xl md:max-w-2xl lg:max-w-4xl">
        {/* Background Effects for Dark Mode */}
        <div className="absolute inset-0 dark:block hidden">
          {/* Left Circle */}
          <div className="absolute -left-16 sm:-left-32 bottom-0 w-64 h-64 sm:w-96 sm:h-96 rounded-full bg-gradient-to-bl from-pink-600 to-blue-700 opacity-20 blur-xl" />

          {/* Right Circle */}
          <div className="absolute -right-16 sm:-right-32 bottom-16 sm:bottom-32 w-64 h-64 sm:w-96 sm:h-96 rounded-full bg-gradient-to-bl from-pink-500 to-blue-600 opacity-20 blur-xl" />
        </div>

        <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden">
          <div className="relative">
            {/* Top Decorative Wave */}
            <div className="absolute top-0 left-0 right-0">
              <svg
                className="w-full text-purple-600 dark:text-purple-500"
                viewBox="0 0 1440 120"
                fill="none"
              >
                <path
                  fill="currentColor"
                  d="M0,0 C240,120 480,120 720,60 C960,0 1200,0 1440,60 L1440,0 L0,0 Z"
                />
              </svg>
            </div>

            <div className="px-4 sm:px-8 pt-16 sm:pt-20 pb-12 sm:pb-16 relative z-10">
              {/* Icon Container */}
              <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center mb-6 sm:mb-8">
                <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-purple-600 dark:text-purple-400" />
              </div>

              {/* Content */}
              <div className="text-center space-y-4 sm:space-y-6">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
                  Elite Rank Required
                </h1>

                <div className="space-y-4">
                  <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-md mx-auto px-4 sm:px-0">
                    You haven't purchased an elite rank yet. Upgrade your rank
                    to access this feature.
                  </p>

                  <div className="pt-4">
                    <button
                      onClick={() => window.history.back()}
                      className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base rounded-lg text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M10 19l-7-7m0 0l7-7m-7 7h18"
                        />
                      </svg>
                      Go Back
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Decorative Wave */}
            <div className="absolute bottom-0 left-0 right-0 transform rotate-180">
              <svg
                className="w-full text-purple-600/10 dark:text-purple-500/5"
                viewBox="0 0 1440 120"
                fill="none"
              >
                <path
                  fill="currentColor"
                  d="M0,0 C240,120 480,120 720,60 C960,0 1200,0 1440,60 L1440,0 L0,0 Z"
                />
              </svg>
            </div>
          </div>

          {/* Bottom Info Section */}
          <div className="bg-gray-50 dark:bg-gray-800/50 px-4 sm:px-8 py-4 sm:py-6 border-t border-gray-100 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              <p className="text-center sm:text-left">Want to learn more about elite ranks?</p>
              <button className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium transition-colors mt-2 sm:mt-0">
                View Rank Details →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
     )}
    </>
  );
};

export default SorryPage;