import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";
import img1 from "../../imports/BlankStudios_MOT-116.jpg";
import img2 from "../../imports/BlankStudios_MOT-146.jpg";
import { publicAPI } from "../../services/api";
import { useContentOverride } from "../../hooks/useContentOverride";

interface AboutPageProps {
  onNavigate: (page: string) => void;
  previewOverride?: Partial<typeof DEFAULTS> | null;
}

const DEFAULT_IMAGES = [img2, img1];

const DEFAULTS = {
  title: "One Recipe.",
  subtitle: "Pure Obsession.",
  description:
    "Mad Over Tiramisu was born from a simple obsession — the original Italian tiramisu, untouched, uncompromised. No fusions. No twists.\n\nEvery container we make starts with the same question: does this taste exactly as it should? No shortcuts. No substitutes. Just honest, beautiful ingredients — quality espresso, proper savoiardi, premium mascarpone, and a cloud of fine cocoa.\n\nHand-built in small batches across Gold Coast, Australia — ready to make you fall mad in love with every spoon.",
  images: DEFAULT_IMAGES,
};

export function AboutPage({ onNavigate, previewOverride }: AboutPageProps) {
  const [content, setContent] = useState(DEFAULTS);

  useEffect(() => {
    publicAPI
      .getContentSection("about")
      .then((res) => {
        const c = res.data.content;
        if (!c) return;
        setContent({
          title: c.title || DEFAULTS.title,
          subtitle: c.subtitle || DEFAULTS.subtitle,
          description: c.description || DEFAULTS.description,
          images: DEFAULT_IMAGES.map((def, i) => c.images?.[i] || (i === 0 ? c.image : null) || def),
        });
      })
      .catch(() => {
        // Fall back to defaults if content isn't configured yet
      });
  }, []);

  useContentOverride(setContent, previewOverride);

  const paragraphs = content.description.split('\n\n');

  return (
    <div className="min-h-screen pt-20 px-4 pb-16" style={{ background: "#F5EFE0" }}>
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <button
            onClick={() => onNavigate("home")}
            className="flex items-center gap-2 mb-8 text-sm transition-opacity hover:opacity-70"
            style={{ fontFamily: "'Lato', sans-serif", color: "#8B6B4A" }}
          >
            <ArrowLeft size={15} />
            Back to Home
          </button>

          <p className="text-xs tracking-[0.3em] uppercase mb-2" style={{ fontFamily: "'Lato', sans-serif", color: "#C0633A" }}>
            Our Story
          </p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2rem,6vw,3.5rem)", color: "#2C1810", marginBottom: "1rem" }}>
            {content.title}<br />
            <span style={{ fontStyle: "italic", color: "#8B6B4A" }}>{content.subtitle}</span>
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-10">
            <div className="space-y-5">
              {paragraphs.map((p, i) => (
                <p key={i} className="leading-relaxed" style={{ fontFamily: "'Lato', sans-serif", color: "#4A2E1A", lineHeight: 1.85 }}>
                  {p}
                </p>
              ))}
              <div className="pt-2">
                <span className="text-xs tracking-[0.2em] uppercase" style={{ fontFamily: "'Lato', sans-serif", color: "#C0633A" }}>
                  Crafted in Australia · Authentically Italian
                </span>
              </div>
            </div>
            <div className="space-y-4">
              <img src={content.images[0]} alt="Classic tiramisu" className="w-full rounded-2xl object-cover" style={{ height: "250px" }} />
              <img src={content.images[1]} alt="Pistachio cups" className="w-full rounded-2xl object-cover" style={{ height: "160px" }} />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
