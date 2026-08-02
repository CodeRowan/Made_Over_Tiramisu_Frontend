import { useEffect, useState } from "react";
import { motion } from "motion/react";
import heroBg from "../../imports/tiraminsu_home_page_bg_image.png";
import { publicAPI } from "../../services/api";
import { useContentOverride } from "../../hooks/useContentOverride";

interface HeroSectionProps {
  onNavigate: (page: string) => void;
  previewOverride?: Partial<typeof DEFAULTS> | null;
}

const DEFAULTS = {
  subtitle: "We Didn't Make 20 Desserts. We Perfected One.",
  title: "Mad Over Tiramisu",
  description:
    "A classic Italian dessert with coffee soaked layers,\nrich mascarpone cream and a dusting of cocoa.",
  image: heroBg,
};

export function HeroSection({ onNavigate, previewOverride }: HeroSectionProps) {
  const [mounted, setMounted] = useState(false);
  const [content, setContent] = useState(DEFAULTS);

  useEffect(() => {
    setMounted(true);
    publicAPI
      .getContentSection("hero")
      .then((res) => {
        const c = res.data.content;
        if (!c) return;
        setContent({
          subtitle: c.subtitle || DEFAULTS.subtitle,
          title: c.title || DEFAULTS.title,
          description: c.description || DEFAULTS.description,
          image: c.image || heroBg,
        });
      })
      .catch(() => {
        // Fall back to defaults if content isn't configured yet
      });
  }, []);

  useContentOverride(setContent, previewOverride);

  return (
    <section className="relative w-full min-h-screen overflow-hidden flex items-center justify-center">
      {/* Animated background image reveal */}
      <motion.div
        className="absolute inset-0 z-0"
        initial={{ clipPath: "inset(100% 0 0 0)" }}
        animate={mounted ? { clipPath: "inset(0% 0 0 0)" } : {}}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
      >
        <img
          src={content.image}
          alt="Mad Over Tiramisu Classic Cake"
          className="w-full h-full object-cover"
          style={{ filter: "brightness(0.55)" }}
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom, rgba(44,24,16,0.3) 0%, rgba(44,24,16,0.6) 100%)" }}
        />
      </motion.div>

      {/* Text content */}
      <div className="relative z-10 text-center px-6 max-w-2xl mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={mounted ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="text-xs tracking-[0.3em] uppercase mb-6"
          style={{ fontFamily: "'Lato', sans-serif", color: "#C9A87C" }}
        >
          {content.subtitle}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={mounted ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 1.45 }}
          className="mb-8"
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(3rem, 12vw, 7rem)",
            fontWeight: 700,
            color: "#F5EFE0",
            lineHeight: 1.05,
          }}
        >
          {content.title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={mounted ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 1.9 }}
          className="mb-10 leading-relaxed"
          style={{ fontFamily: "'Lato', sans-serif", color: "rgba(245,239,224,0.85)", fontSize: "1rem" }}
        >
          {content.description.split('\n').map((line, i) => (
            <span key={i}>
              {line}
              {i < content.description.split('\n').length - 1 && <br />}
            </span>
          ))}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={mounted ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 2.1 }}
          className="flex items-center justify-center gap-4 flex-wrap"
        >
          <button
            onClick={() => onNavigate("findus")}
            className="px-8 py-3 rounded-full text-sm tracking-widest uppercase transition-all duration-300 hover:scale-105 active:scale-95"
            style={{
              fontFamily: "'Lato', sans-serif",
              background: "#C0633A",
              color: "#F5EFE0",
              letterSpacing: "0.12em",
              border: "none",
            }}
          >
            Order Now
          </button>
          <button
            onClick={() => {
              document.getElementById("our-story")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="px-8 py-3 rounded-full text-sm tracking-widest uppercase transition-all duration-300 hover:opacity-80"
            style={{
              fontFamily: "'Lato', sans-serif",
              background: "transparent",
              color: "#F5EFE0",
              letterSpacing: "0.12em",
              border: "1px solid rgba(245,239,224,0.5)",
            }}
          >
            Our Story
          </button>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={mounted ? { opacity: 1 } : {}}
        transition={{ delay: 2.4, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-xs tracking-widest uppercase" style={{ fontFamily: "'Lato', sans-serif", color: "rgba(245,239,224,0.5)" }}>Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          className="w-px h-8"
          style={{ background: "linear-gradient(to bottom, rgba(201,168,124,0.6), transparent)" }}
        />
      </motion.div>
    </section>
  );
}
