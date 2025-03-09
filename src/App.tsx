import React, { lazy, Suspense, useEffect, useState, useMemo } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { useDarkMode } from "./context/DarkModeContext";
import "./index.css";
import { BlockchainProvider } from "./blockchainusecon/BlockchainContext";

// Fallback loading component (non-lazy)
const LoadingFallback = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

// Lazy load components
const Dashboard = lazy(() => import("./Pages/Dashboard"));
const ReferralTree = lazy(() => import("./Pages/ReferralTree"));
const Header = lazy(() => import("./components/Layouts/Header"));
const Footer = lazy(() => import("./components/Layouts/Footer"));
const RAB = lazy(() => import("./Pages/Rankach"));
const Register = lazy(() => import("./Pages/Register"));
const RankDetailsPage = lazy(() => import("./Pages/RankDetails"));
const NewRach = lazy(() => import("./Pages/NewrRach"));
const LtgBon = lazy(() => import("./Pages/LtgBon"));
const AdminDashboard = lazy(() => import("./Pages/AdminDashboard"));
const Loader = lazy(() => import("./Pages/Loader"));
const Transactions = lazy(() => import("./Pages/Transactions"));
const FeaturesSection = lazy(() => import("./Pages/FeaturesSection"));
const Light = lazy(() => import("./Pages/Light"));
const LTGB_new = lazy(() => import("./Pages/LTGB_new"));

// Define route configuration
interface RouteConfig {
  path: string;
  component: React.LazyExoticComponent<React.ComponentType<any>>;
  skipLoading?: boolean;
}

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const { darkMode } = useDarkMode();

  // Define routes configuration
  const routes: RouteConfig[] = useMemo(
    () => [
      { path: "/", component: Register },
      { path: "/dashboard", component: Dashboard },
      { path: "/referral-tree", component: ReferralTree, skipLoading: true },
      { path: "/rab", component: RAB },
      { path: "/register", component: Register },
      { path: "/rank-detail", component: RankDetailsPage },
      { path: "/NewRach", component: NewRach },
      { path: "/LtgBon", component: LtgBon, skipLoading: true },
      { path: "/admin/dashboard", component: AdminDashboard },
      { path: "/Tansactions", component: Transactions },
      { path: "/LTGB", component: Transactions },
      { path: "/LTGB_new",component: LTGB_new }
    ],
    []
  );

  // Function to check if we should hide the header
  const shouldHideHeader = useMemo(() => {
    // Hide header if we're at root path or if URL contains /register with referral parameter
    return (
      location.pathname === "/" ||
      (location.pathname === "/register" &&
        location.search.includes("referral="))
    );
  }, [location.pathname, location.search]);

  // Handle loading state based on current route
  useEffect(() => {
    const currentRoute = routes.find(
      (route) => route.path === location.pathname
    );

    if (currentRoute?.skipLoading) {
      setLoading(false);
    } else {
      setLoading(true);
      const timer = setTimeout(() => setLoading(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [location, routes]);

  // Background component based on dark mode
  const Background = useMemo(() => {
    return (
      <div className="fixed inset-0 -z-10">
        <Suspense
          fallback={
            <div className="w-full h-full bg-gray-100 dark:bg-gray-900" />
          }
        >
          {darkMode ? <FeaturesSection /> : <Light />}
        </Suspense>
      </div>
    );
  }, [darkMode]);

  return (
    <BlockchainProvider>
    <div className="relative min-h-screen">
      {/* Background Component */}
      {Background}

      {/* Loading Indicator */}
      {/* {loading && (
        <Suspense fallback={<LoadingFallback />}>
          <Loader />
        </Suspense>
      )} */}

      {/* Header (Conditionally Rendered) */}
      {!shouldHideHeader && (
        <Suspense fallback={<LoadingFallback />}>
          <Header />
        </Suspense>
      )}

      {/* Routes with Suspense for Lazy Loading */}
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {routes.map(({ path, component: Component }) => (
            <Route key={path} path={path} element={<Component />} />
          ))}
          {/* Fallback route for 404 */}
          <Route
            path="*"
            element={
              <div className="flex justify-center items-center h-96 text-xl">
                Page not found
              </div>
            }
          />
        </Routes>
      </Suspense>

      <Suspense fallback={<LoadingFallback />}>
        <Footer />
      </Suspense>
    </div>
    </BlockchainProvider>
  );
};

export default App;
