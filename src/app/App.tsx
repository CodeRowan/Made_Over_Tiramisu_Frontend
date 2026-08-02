import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Toaster } from "sonner";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Header } from "./components/Header";
import { HeroSection } from "./components/HeroSection";
import { StorySection } from "./components/StorySection";
import { VideoSection } from "./components/VideoSection";
import { ProductsSection } from "./components/ProductsSection";
import { TestimonialsSection } from "./components/TestimonialsSection";
import { InstagramSection } from "./components/InstagramSection";
import { MapSection } from "./components/MapSection";
import { Footer } from "./components/Footer";
import { AboutPage } from "./components/AboutPage";
import { ContactPage } from "./components/ContactPage";

// Admin Pages
import { AdminLogin } from "./pages/AdminLogin";
import { AdminLayout } from "./pages/AdminLayout";
import { AdminDashboard } from "./pages/AdminDashboard";
import { ProductsAdmin } from "./pages/ProductsAdmin";
import { ContentAdmin } from "./pages/ContentAdmin";
import { ActivityLogAdmin } from "./pages/ActivityLogAdmin";
import { SettingsAdmin } from "./pages/SettingsAdmin";
import { TestimonialsAdmin } from "./pages/TestimonialsAdmin";
import { InstagramAdmin } from "./pages/InstagramAdmin";
import { LocationsAdmin } from "./pages/LocationsAdmin";
import { MessagesAdmin } from "./pages/MessagesAdmin";
import { PreviewFrame } from "./pages/PreviewFrame";

/* MARKER-MAKE-KIT-INVOKED */

type Page = "home" | "about" | "contact" | "findus";

function HomePage({ onNavigate }: { onNavigate: (page: string) => void }) {
  return (
    <div>
      <HeroSection onNavigate={onNavigate} />
      <StorySection />
      <VideoSection />
      <div id="products-anchor">
        <ProductsSection onNavigate={onNavigate} />
      </div>
      <TestimonialsSection />
      <InstagramSection />
      <MapSection />
    </div>
  );
}

/**
 * Protected Route Component
 * Checks if admin is logged in before allowing access
 *
 * DEVELOPMENT MODE: Set BYPASS_AUTH to true to skip login
 */
const BYPASS_AUTH = true; // Set to false to require login

function ProtectedAdminRoute({ children }: { children: JSX.Element }) {
  if (BYPASS_AUTH) {
    return children; // Skip authentication check
  }

  const token = localStorage.getItem("adminToken");
  return token ? children : <Navigate to="/admin/login" />;
}

function LandingPageApp() {
  const [page, setPage] = useState<Page>("home");
  const [animKey, setAnimKey] = useState(0);

  const navigate = useCallback((p: string) => {
    setPage(p as Page);
    window.scrollTo({ top: 0, behavior: "smooth" });
    setAnimKey((k) => k + 1);
  }, []);

  useEffect(() => {
    if (page === "home") {
      setAnimKey((k) => k + 1);
    }
  }, [page]);

  useEffect(() => {
    if (page === "findus") {
      setPage("home");
      setTimeout(() => {
        document.getElementById("find-us")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [page]);


  return (
    <div style={{ fontFamily: "'Lato', sans-serif", background: "#F5EFE0", minHeight: "100vh" }}>
      <Toaster position="top-right" />
      <Header onNavigate={navigate} currentPage={page} />

      <AnimatePresence mode="wait">
        <motion.div
          key={`${page}-${animKey}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {page === "home" && <HomePage onNavigate={navigate} />}
          {page === "about" && <AboutPage onNavigate={navigate} />}
          {page === "contact" && <ContactPage onNavigate={navigate} />}
        </motion.div>
      </AnimatePresence>

      {(page === "home" || page === "about" || page === "contact") && (
        <Footer onNavigate={navigate} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Landing Page Routes */}
        <Route path="/" element={<LandingPageApp />} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Standalone frame the admin Content preview loads in an iframe */}
        <Route path="/preview" element={<PreviewFrame />} />

        {/* Protected Admin Routes */}
        <Route
          path="/admin/*"
          element={
            <ProtectedAdminRoute>
              <AdminLayout />
            </ProtectedAdminRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="products" element={<ProductsAdmin />} />
          <Route path="content" element={<ContentAdmin />} />
          <Route path="testimonials" element={<TestimonialsAdmin />} />
          <Route path="instagram" element={<InstagramAdmin />} />
          <Route path="locations" element={<LocationsAdmin />} />
          <Route path="messages" element={<MessagesAdmin />} />
          <Route path="activity-log" element={<ActivityLogAdmin />} />
          <Route path="settings" element={<SettingsAdmin />} />
          <Route path="" element={<Navigate to="dashboard" />} />
        </Route>

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
