import React from "react";
import { motion } from "framer-motion";

const Loader: React.FC = () => {
  return (
    <div className="fixed inset-0 flex justify-center items-center z-[9999] bg-transparent">
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
  );
};

export default Loader;
