import React, { lazy, Suspense, useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { useDarkMode } from "./components/DarkModeContext";

// Lazy load components
const Dashboard = lazy(() => import("./components/Dashboard"));
const ReferralTree = lazy(() => import("./components/ReferralTree"));
const Header = lazy(() => import("./components/Header"));
const Footer = lazy(() => import("./components/Footer"));
const RAB = lazy(() => import("./components/Rankach"));
const Register = lazy(() => import("./components/Register"));
const RankDetailsPage = lazy(() => import("./components/RankDetails"));
const NewRach = lazy(() => import("./components/NewrRach"));
const LtgBon = lazy(() => import("./components/LtgBon"));
const AdminDashboard = lazy(() => import("./components/AdminDashboard"));
const Loader = lazy(() => import("./components/Loader"));
const Transactions = lazy(() => import("./components/Transactions"));
const FeaturesSection = lazy(() => import("./components/FeaturesSection"));
const Light = lazy(() => import("./components/Light"));

import "./index.css";

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const { darkMode } = useDarkMode();

  useEffect(() => {
    const skipLoadingRoutes = ["/referral-tree", "/LtgBon"];

    if (skipLoadingRoutes.includes(location.pathname)) {
      setLoading(false);
    } else {
      setLoading(true);
      const timer = setTimeout(() => setLoading(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [location]);

  return (
    <div className="relative min-h-screen">
      {/* Background Component */}
      <div className="fixed inset-0 -z-10">
        {darkMode ? <FeaturesSection /> : <Light />}
      </div>

      {/* Loading Indicator */}
      {loading && <Loader />}

      {/* Header (Conditionally Rendered) */}
      {location.pathname !== "/" && (
        <Suspense fallback={<div>Loading...</div>}>
          <Header />
        </Suspense>
      )}

      {/* Routes with Suspense for Lazy Loading */}
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/referral-tree" element={<ReferralTree />} />
          <Route path="/rab" element={<RAB />} />
          <Route path="/register" element={<Register />} />
          <Route path="/rank-detail" element={<RankDetailsPage />} />
          <Route path="/NewRach" element={<NewRach />} />
          <Route path="/LtgBon" element={<LtgBon />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/Tansactions" element={<Transactions />} />
        </Routes>
      </Suspense>

      <Footer />
    </div>
  );
};

export default App;
