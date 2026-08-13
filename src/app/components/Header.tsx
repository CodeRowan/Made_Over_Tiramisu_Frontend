import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { useSiteLogo } from "../../hooks/useSiteLogo";

interface HeaderProps {
  onNavigate: (page: string) => void;
  currentPage: string;
  previewOverride?: { image?: string } | null;
}

export function Header({ onNavigate, currentPage, previewOverride }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const logoImg = useSiteLogo(previewOverride);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const isHome = currentPage === "home";
  const dark = scrolled || !isHome;

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{
        background: dark ? "rgba(44,24,16,0.97)" : "transparent",
        backdropFilter: dark ? "blur(12px)" : "none",
        borderBottom: dark ? "1px solid rgba(201,168,124,0.2)" : "none",
      }}
    >
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => { onNavigate("home"); setMenuOpen(false); }}
          className="flex items-center gap-2 group"
        >
          <img src={logoImg} alt="Mad Over Tiramisu" className="h-10 w-10 rounded-full object-cover" />
          <span
            className="hidden sm:block text-sm tracking-widest uppercase"
            style={{ fontFamily: "'Lato', sans-serif", color: dark ? "#F5EFE0" : "#F5EFE0", letterSpacing: "0.15em" }}
          >
            Mad Over Tiramisu
          </span>
        </button>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {["home", "about", "contact"].map((p) => (
            <button
              key={p}
              onClick={() => onNavigate(p)}
              className="text-sm tracking-widest uppercase transition-colors duration-200 hover:opacity-70"
              style={{
                fontFamily: "'Lato', sans-serif",
                color: "#F5EFE0",
                letterSpacing: "0.12em",
                fontWeight: currentPage === p ? 700 : 400,
              }}
            >
              {p === "home" ? "Home" : p === "about" ? "About Us" : "Contact Us"}
            </button>
          ))}
        </nav>

        {/* Order Now button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => { onNavigate("findus"); setMenuOpen(false); }}
            className="px-4 py-2 rounded-lg font-semibold text-sm tracking-widest uppercase transition-all duration-200"
            style={{
              background: "#C0633A",
              color: "#F5EFE0",
              fontFamily: "'Lato', sans-serif",
              letterSpacing: "0.1em",
              border: "none",
              cursor: "pointer",
            }}
            onMouseOver={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#a4522e";
            }}
            onMouseOut={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#C0633A";
            }}
          >
            Order Now
          </button>

          {/* Mobile menu */}
          <button
            className="md:hidden p-1"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ color: "#F5EFE0" }}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {menuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="md:hidden px-6 pb-4 flex flex-col gap-4"
          style={{ background: "rgba(44,24,16,0.98)" }}
        >
          {["home", "about", "contact"].map((p) => (
            <button
              key={p}
              onClick={() => { onNavigate(p); setMenuOpen(false); }}
              className="text-left text-sm tracking-widest uppercase py-1"
              style={{ fontFamily: "'Lato', sans-serif", color: "#F5EFE0" }}
            >
              {p === "home" ? "Home" : p === "about" ? "About Us" : "Contact Us"}
            </button>
          ))}
        </motion.div>
      )}
    </motion.header>
  );
}
