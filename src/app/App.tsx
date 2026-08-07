import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CommonToaster, toast } from "./components/ui/CommonToaster";
import { authStorage } from "../services/authStorage";
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
import { MarqueeTicker } from "./components/ui/MarqueeTicker";

/* MARKER-MAKE-KIT-INVOKED */

type Page = "home" | "about" | "contact" | "findus";

// These aren't real pages — they're scroll targets on the home page. The
// header/footer link to them as convenient shortcuts (Order Now → menu, etc.).
const SCROLL_TARGETS: Record<string, string> = {
  findus: "find-us",
  products: "products-anchor",
  cart: "products-anchor",
};

function HomePage({ onNavigate }: { onNavigate: (page: string) => void }) {
  return (
    <div>
      <HeroSection onNavigate={onNavigate} />
      <MarqueeTicker /> 
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
 * LOCAL DEVELOPMENT ONLY: Set BYPASS_AUTH to true to skip login.
 * Must be false in production — leaving it true opens the whole admin
 * panel to anyone who visits /admin/*.
 */
const BYPASS_AUTH = false; // Set to true to skip login during local development

function ProtectedAdminRoute({ children }: { children: JSX.Element }) {
  const [authed] = useState(() => (BYPASS_AUTH ? true : !!authStorage.getToken()));

  // Fire the access-denied toast as a side effect, never during render.
  useEffect(() => {
    if (!authed) {
      toast.authError("Access Denied", "Please log in to access the admin portal.");
    }
  }, [authed]);

  if (authed) return children;
  return <Navigate to="/admin/login" replace />;
}

function LandingPageApp() {
  const [page, setPage] = useState<Page>("home");
  const [animKey, setAnimKey] = useState(0);
  // Pending section to scroll to once it has mounted on the home page — set
  // by "findus" / "products" / "cart" navigation, cleared when reached or
  // when the user navigates somewhere else.
  const [scrollTarget, setScrollTarget] = useState<string | null>(null);

  const navigate = useCallback((p: string) => {
    const target = SCROLL_TARGETS[p];
    if (target) {
      setPage("home");
      setScrollTarget(target);
    } else {
      setPage(p as Page);
      setScrollTarget(null); // cancel any in-flight section scroll
      setAnimKey((k) => k + 1);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (page === "home") {
      setAnimKey((k) => k + 1);
    }
  }, [page]);

  // Retry scrolling to the pending section target until it mounts (sections
  // load their data asynchronously). Keyed on scrollTarget, not page, so the
  // home-page remount can't tear the timer down before it fires. Offset by
  // ~80px so the section isn't hidden under the fixed header.
  useEffect(() => {
    if (!scrollTarget) return;
    let attempts = 0;
    const timer = window.setInterval(() => {
      const el = document.getElementById(scrollTarget);
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top, behavior: "smooth" });
        window.clearInterval(timer);
        setScrollTarget(null);
      } else if (++attempts >= 20) {
        window.clearInterval(timer);
        setScrollTarget(null);
      }
    }, 100);
    return () => window.clearInterval(timer);
  }, [scrollTarget]);


  return (
    <div style={{ fontFamily: "'Lato', sans-serif", background: "#F5EFE0", minHeight: "100vh" }}>
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
      <CommonToaster position="top-right" />
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
