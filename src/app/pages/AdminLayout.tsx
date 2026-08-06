import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { productsAPI, contactAPI, testimonialsAPI, instagramAPI, locationsAPI } from "../../services/api";
import { useRealtimeUpdates } from "../../hooks/useAdminSocket";
import { useIsMobile } from "../../hooks/useIsMobile";

export function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  // Shared "Saving.../Saved!/Error saving" feedback — every page (Content
  // edits, product/testimonial/etc. saves, image uploads, live/hidden
  // toggles) flashes this through the same indicator, since they all apply
  // their own changes immediately rather than through a global save button.
  const [status, setStatus] = useState("No changes");
  const [stats, setStats] = useState({ products: 0, messages: 0, testimonials: 0, instagram: 0, locations: 0 });

  useEffect(() => {
    const userData = localStorage.getItem("adminUser");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch {
        // Corrupted/partial user object — drop it rather than crash the layout
        localStorage.removeItem("adminUser");
      }
    }
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [productsRes, contactRes, testimonialsRes, instagramRes, locationsRes] = await Promise.all([
        productsAPI.getAll(1000, 0),
        contactAPI.getUnreadCount(),
        testimonialsAPI.getAll(),
        instagramAPI.getAll(),
        locationsAPI.getAll(),
      ]);

      setStats({
        products: productsRes.data.products?.length || 0,
        messages: contactRes.data.count || 0,
        testimonials: testimonialsRes.data.testimonials?.length || 0,
        instagram: instagramRes.data.posts?.length || 0,
        locations: locationsRes.data.locations?.length || 0,
      });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  // Live nav badges: any of these resources changing (from this tab or any
  // other admin session) refreshes the counts without a manual reload.
  useRealtimeUpdates(
    ["products:changed", "testimonials:changed", "instagram:changed", "locations:changed", "messages:changed"],
    fetchStats
  );

  const currentPage = location.pathname.split("/").pop() || "dashboard";

  // Never leave the mobile nav drawer open after navigating away
  useEffect(() => setMobileNavOpen(false), [location.pathname]);

  const navItems = [
    { label: "Dashboard", path: "dashboard", badge: 0 },
    { label: "Products", path: "products", badge: stats.products },
    { label: "Content", path: "content", badge: 0 },
    { label: "Testimonials", path: "testimonials", badge: stats.testimonials },
    { label: "Instagram", path: "instagram", badge: stats.instagram },
    { label: "Locations", path: "locations", badge: stats.locations },
    { label: "Messages", path: "messages", badge: stats.messages },
    { label: "Activity Log", path: "activity-log", badge: 0 },
    { label: "Settings", path: "settings", badge: 0 },
  ];

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    navigate("/admin/login");
  };

  const currentLabel = navItems.find((item) => item.path === currentPage)?.label || "Admin";

  const statusDot = (
    <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: status.includes("Saving") ? "#C0633A" : status.includes("Saved") ? "#22c55e" : "rgba(44,24,16,.2)", transition: "background .2s", flex: "none" }}></span>
  );

  return (
    <div style={{ height: "100vh", minHeight: isMobile ? "0" : "760px", display: "flex", flexDirection: "column", background: "#F7F2E8" }}>
      {/* Top Header */}
      <div style={{ flex: "none", background: "#FFFDF8", borderBottom: "1px solid rgba(44,24,16,.1)" }}>
      {isMobile ? (
        <>
          {/* Compact mobile bar: menu, current page, status */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "0 14px", height: "52px" }}>
            <button
              onClick={() => setMobileNavOpen((v) => !v)}
              aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
              style={{ flex: "none", width: "34px", height: "34px", display: "grid", placeItems: "center", background: "transparent", border: "1px solid rgba(44,24,16,.16)", borderRadius: "8px", cursor: "pointer", color: "#2C1810" }}
            >
              {mobileNavOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <span style={{ fontFamily: "var(--font-heading)", fontWeight: "800", fontSize: "15px", flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {currentLabel}
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: status.includes("Saving") ? "#C0633A" : status.includes("Saved") ? "#22c55e" : "#9d8371", flex: "none", minWidth: "0" }}>
              {statusDot}
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "90px" }}>{status}</span>
            </div>
          </div>

          {/* Nav drawer — everything that doesn't fit in the compact bar lives here */}
          {mobileNavOpen && (
            <div style={{ borderTop: "1px solid rgba(44,24,16,.08)", padding: "8px 0", maxHeight: "calc(100vh - 52px)", overflow: "auto" }}>
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(`/admin/${item.path}`)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 18px",
                    background: currentPage === item.path ? "#F7F2E8" : "transparent",
                    border: "none",
                    borderLeft: currentPage === item.path ? "3px solid #C0633A" : "3px solid transparent",
                    fontSize: "14px",
                    fontWeight: currentPage === item.path ? 700 : 400,
                    color: currentPage === item.path ? "#2C1810" : "#7a5c48",
                    cursor: "pointer",
                  }}
                >
                  <span>{item.label}</span>
                  {item.badge > 0 && (
                    <span style={{ fontSize: "11px", background: "#C0633A", color: "#fff", padding: "2px 7px", borderRadius: "6px", fontWeight: "700" }}>
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}

              <div style={{ borderTop: "1px solid rgba(44,24,16,.08)", marginTop: "8px", padding: "14px 18px 4px", display: "flex", flexDirection: "column", gap: "12px" }}>
                <a href="/" target="_blank" rel="noopener noreferrer" style={{ fontSize: "13px", color: "#7a5c48", textDecoration: "none" }}>
                  View live site ↗
                </a>
                <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                  <div style={{ width: "26px", height: "26px", borderRadius: "50%", background: "#EDE3D2", color: "#7a5c48", display: "grid", placeItems: "center", fontFamily: "var(--font-heading)", fontWeight: "800", fontSize: "11px", flex: "none" }}>
                    {user?.name ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase() : "A"}
                  </div>
                  <span style={{ fontSize: "13px" }}>{user?.name || "Admin"}</span>
                </div>
                <button
                  onClick={handleLogout}
                  style={{ height: "36px", padding: "0 14px", background: "transparent", border: "1px solid rgba(44,24,16,.16)", color: "#7a5c48", font: "inherit", fontSize: "13px", cursor: "pointer", borderRadius: "6px", textAlign: "left" }}
                >
                  Log out
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
        {/* Main header bar */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", padding: "0 24px", height: "54px", borderBottom: "1px solid rgba(44,24,16,.07)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "11px", flex: "none" }}>
            <div style={{ width: "30px", height: "30px", borderRadius: "9px", background: "#2C1810", color: "#F5EFE0", display: "grid", placeItems: "center", fontFamily: "var(--font-heading)", fontWeight: "800", fontSize: "13px" }}>M</div>
            <span style={{ fontFamily: "var(--font-heading)", fontWeight: "800", fontSize: "14px" }}>Mad Over Tiramisu</span>
            <span style={{ width: "1px", height: "16px", background: "rgba(44,24,16,.16)" }}></span>
            <span style={{ fontSize: "12px", color: "#9d8371" }}>Website manager</span>
          </div>
          <div style={{ flex: "1" }}></div>
          <a href="/" target="_blank" rel="noopener noreferrer" style={{ fontSize: "13px", color: "#7a5c48", textDecoration: "none", flex: "none", cursor: "pointer" }}>View live site ↗</a>
          <span style={{ width: "1px", height: "20px", background: "rgba(44,24,16,.14)", flex: "none" }}></span>
          <div style={{ display: "flex", alignItems: "center", gap: "9px", flex: "none" }}>
            <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#EDE3D2", color: "#7a5c48", display: "grid", placeItems: "center", fontFamily: "var(--font-heading)", fontWeight: "800", fontSize: "11px" }}>
              {user?.name ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase() : "A"}
            </div>
            <span style={{ fontSize: "13px" }}>{user?.name || "Admin"}</span>
          </div>
          <button
            onClick={handleLogout}
            style={{ flex: "none", whiteSpace: "nowrap", height: "30px", padding: "0 14px", background: "transparent", border: "1px solid rgba(44,24,16,.16)", color: "#7a5c48", font: "inherit", fontSize: "12px", cursor: "pointer", transition: "background .18s", borderRadius: "6px" }}
            onMouseOver={e => (e.currentTarget as HTMLElement).style.background = "#F2EADC"}
            onMouseOut={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
          >
            Log out
          </button>
        </div>

        {/* Navigation tabs */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", padding: "0 24px", height: "58px" }}>
          <div style={{ display: "flex", gap: "2px", background: "#F2EADC", padding: "4px", flex: "none", borderRadius: "14px" }}>
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(`/admin/${item.path}`)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "10px",
                  fontSize: "12px",
                  fontWeight: "600",
                  border: "none",
                  background: currentPage === item.path ? "#FFFDF8" : "transparent",
                  color: currentPage === item.path ? "#2C1810" : "#7a5c48",
                  cursor: "pointer",
                  transition: "all .2s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
                onMouseOver={e => {
                  if (currentPage !== item.path) {
                    (e.currentTarget as HTMLElement).style.color = "#2C1810";
                  }
                }}
                onMouseOut={e => {
                  if (currentPage !== item.path) {
                    (e.currentTarget as HTMLElement).style.color = "#7a5c48";
                  }
                }}
              >
                {item.label}
                {item.badge > 0 && (
                  <span style={{ fontSize: "10px", background: "#C0633A", color: "#fff", padding: "2px 6px", borderRadius: "6px", fontWeight: "700" }}>
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div style={{ flex: "1 1 12px", minWidth: "12px" }}></div>

          {/* Status indicator — shared by every page: content edits, product/
              testimonial/etc. saves, image uploads, live/hidden toggles all
              flash through this, since each page applies its own changes
              immediately instead of going through a global save button */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: status.includes("Saving") ? "#C0633A" : status.includes("Saved") ? "#22c55e" : "#9d8371" }}>
            {statusDot}
            <span>{status}</span>
          </div>
        </div>
        </>
      )}
      </div>

      {/* Main Content Area */}
      <div style={{ flex: "1", minHeight: "0", overflow: "auto", background: "#F7F2E8" }}>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Outlet context={{ setStatus, fetchStats }} />
        </motion.div>
      </div>
    </div>
  );
}
