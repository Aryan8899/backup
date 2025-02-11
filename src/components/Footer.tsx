import React from "react";
import { FaFacebookF, FaXTwitter, FaInstagram } from "react-icons/fa6";
import { Mail, Phone, MapPin, LucideIcon } from "lucide-react";
import robotImage from "../assets/robot.png";
import { motion } from "framer-motion";

interface NavigationItem {
  name: string;
  path: string;
  minRank?: number;
}

interface SocialIconProps {
  Icon: any;
  href: string;
}

interface ContactItemProps {
  Icon: LucideIcon;
  text: string;
}

const navigationItems: NavigationItem[] = [
  { name: "Dashboard", path: "/dashboard" },
  { name: "Referral Tree", path: "/referral-tree" },
  { name: "LTGB", path: "/LtgBon" },
  { name: "RAB", path: "/rab", minRank: 4 },
  { name: "Rank Detail", path: "/rank-detail" },
  { name: "Transactions", path: "/Tansactions" },
];

const SocialIcon: React.FC<SocialIconProps> = ({ Icon, href }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="group relative p-2 sm:p-3 bg-gradient-to-br from-gray-50 to-gray-100 
      dark:from-slate-800 dark:to-slate-900
      rounded-xl hover:shadow-xl transition-all duration-500 ease-in-out
      border border-gray-200/20 hover:border-blue-500/40
      hover:-translate-y-1"
  >
    <Icon
      size={16}
      className="text-gray-600 dark:text-gray-400 sm:text-[20px]
      group-hover:text-blue-500 transform transition-all duration-500 
      group-hover:scale-110 ease-in-out"
    />
    <div
      className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 
      via-blue-500/10 to-purple-500/0 opacity-0 group-hover:opacity-100 
      transition-opacity duration-500 ease-in-out"
    />
  </a>
);

const ContactItem: React.FC<ContactItemProps> = ({ Icon, text }) => (
  <div
    className="flex items-center gap-2 sm:gap-3 text-gray-600 dark:text-gray-400 
    hover:text-blue-500 transition-all duration-300 ease-in-out
    cursor-pointer group"
  >
    <Icon className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:scale-110" />
    <span className="text-xs sm:text-sm transition-colors duration-300">
      {text}
    </span>
  </div>
);

const NavigationLink: React.FC<NavigationItem> = ({ name, path }) => (
  <a
    href={path}
    className="block text-gray-600 dark:text-gray-400 hover:text-blue-500 
      transition-all duration-300 ease-in-out text-xs sm:text-sm group
      relative overflow-hidden"
  >
    <span className="relative z-10 group-hover:translate-x-2 inline-block transition-transform duration-300">
      {name}
    </span>
    <span
      className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500/30 
      group-hover:w-full transition-all duration-300 ease-in-out"
    />
  </a>
);

const Footer = () => {
  return (
    <footer className="relative w-full bg-white dark:bg-slate-900 border-t border-gray-200/20">
      {/* Enhanced background for light mode */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-50/50 to-blue-50/30 transition-colors duration-500" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,theme(colors.blue.50/0.2),transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,theme(colors.purple.50/0.2),transparent_70%)]" />

      {/* Dark mode background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-800 dark:opacity-100 opacity-0 transition-opacity duration-500" />

      {/* 3D Robot Image Section - Always visible and responsive */}
      <motion.div
        className="absolute right-0 bottom-0 w-24 h-24 sm:w-32 sm:h-32 md:w-48 md:h-48 lg:w-64 lg:h-64 
        pointer-events-none mix-blend-multiply dark:mix-blend-screen 
        transform transition-transform duration-500 hover:scale-105"
        animate={{
          y: [0, -15, 0],
          rotate: [0, 1, -1, 0],
          scale: [1, 1.02, 1],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
        }}
      >
        <motion.img
          src={robotImage}
          alt="Decorative Robot"
          className="w-full h-full object-contain filter contrast-125 brightness-110 transition-all duration-500"
          initial={{ opacity: 0.8 }}
          animate={{
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
          }}
        />
      </motion.div>

      <div className="relative max-w-7xl mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-4 space-y-4">
            <div className="flex items-center gap-4">
              <img
                className="w-12 h-12 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-500 ease-in-out"
                src="https://cticlub.org/assets/images/brand/itclogow.png"
                alt="ITC Club Logo"
              />
              <div>
                <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  ITC CLUB
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Building the future together
                </p>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Join our community and explore the future of technology and
              innovation. We're dedicated to creating meaningful connections and
              fostering growth.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="col-span-1 lg:col-span-3 space-y-4">
            <h4 className="text-base font-semibold text-gray-800 dark:text-white">
              Navigation
            </h4>
            <nav className="space-y-2">
              {navigationItems.map((item) => (
                <NavigationLink key={item.path} {...item} />
              ))}
            </nav>
          </div>

          {/* Contact Information */}
          <div className="col-span-1 lg:col-span-3 space-y-4">
            <h4 className="text-base font-semibold text-gray-800 dark:text-white">
              Contact Us
            </h4>
            <div className="space-y-3">
              <ContactItem Icon={Mail} text="contact@itcclub.com" />
              <ContactItem Icon={Phone} text="+1 (555) 123-4567" />
              <ContactItem Icon={MapPin} text="123 Innovation Street" />
            </div>
          </div>

          {/* Social Links */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-2 space-y-4">
            <h4 className="text-base font-semibold text-gray-800 dark:text-white">
              Follow Us
            </h4>
            <div className="flex gap-3">
              <SocialIcon Icon={FaFacebookF} href="https://facebook.com" />
              <SocialIcon Icon={FaXTwitter} href="https://x.com" />
              <SocialIcon Icon={FaInstagram} href="https://instagram.com" />
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-6 border-t border-gray-200/20">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-600 dark:text-gray-400 text-center sm:text-left">
              &copy; {new Date().getFullYear()}{" "}
              <span className="font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                ITC CLUB
              </span>
              . All rights reserved.
            </p>
            {/* <div className="flex gap-4 text-xs text-gray-600 dark:text-gray-400">
              <a
                href="#"
                className="hover:text-blue-500 transition-all duration-300 ease-in-out
                relative group overflow-hidden"
              >
                <span className="relative z-10">Privacy Policy</span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500/30 
                  group-hover:w-full transition-all duration-300 ease-in-out" />
              </a>
              <a
                href="#"
                className="hover:text-blue-500 transition-all duration-300 ease-in-out
                relative group overflow-hidden"
              >
                <span className="relative z-10">Terms of Service</span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500/30 
                  group-hover:w-full transition-all duration-300 ease-in-out" />
              </a>
            </div> */}
          </div>
        </div>
      </div>

      {/* Enhanced Decorative Elements */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
      <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-blue-500/50 to-transparent" />
      <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-blue-500/50 to-transparent" />
    </footer>
  );
};

export default Footer;