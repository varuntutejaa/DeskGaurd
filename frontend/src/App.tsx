import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { LandingPage } from "@/pages/LandingPage";
import { LibraryMapPage } from "@/pages/LibraryMapPage";
import { CheckInPage } from "@/pages/CheckInPage";
import { LoginPage } from "@/pages/LoginPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { useAuth } from "@/lib/auth";

function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** Redirect to login if not signed in. */
function RequireAuth({ children }: { children: React.ReactNode }) {
  const user = useAuth();
  const location = useLocation();
  if (!user) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }
  return <>{children}</>;
}

/** Redirect to library if signed in but not admin. */
function RequireAdmin({ children }: { children: React.ReactNode }) {
  const user = useAuth();
  const location = useLocation();
  if (!user) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }
  if (user.role !== "admin") {
    return <Navigate to="/library" replace />;
  }
  return <>{children}</>;
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* public */}
        <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
        <Route path="/login/:role?" element={<PageTransition><LoginPage /></PageTransition>} />

        {/* requires any login */}
        <Route path="/library" element={
          <RequireAuth><PageTransition><LibraryMapPage /></PageTransition></RequireAuth>
        } />
        <Route path="/checkin/:seatId" element={
          <RequireAuth><PageTransition><CheckInPage /></PageTransition></RequireAuth>
        } />

        {/* requires admin */}
        <Route path="/dashboard" element={
          <RequireAdmin><PageTransition><DashboardPage /></PageTransition></RequireAdmin>
        } />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}
