import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "motion/react";
import img1 from "../../imports/BlankStudios_MOT-146.jpg";
import img2 from "../../imports/BlankStudios_MOT-137.jpg";
import img3 from "../../imports/BlankStudios_MOT-147.jpg";
import img4 from "../../imports/BlankStudios_MOT-144.jpg";
import { publicAPI } from "../../services/api";
import { useContentOverride } from "../../hooks/useContentOverride";

const DEFAULT_IMAGES = [img1, img2, img3, img4];

const DEFAULTS = {
  title: "Our Story",
  subtitle: "One recipe. Pure obsession.",
  description:
    "Mad Over Tiramisu was born from a simple obsession — the original Italian tiramisu, untouched, uncompromised. No fusions. No twists.\n\nHand-built in small batches across Australia — ready to make you fall mad in love with every spoon.\n\nEvery jar, every cup, every cake is crafted with the finest mascarpone, espresso-soaked savoiardi, and a generous dusting of premium cocoa.",
  images: DEFAULT_IMAGES,
};

interface StorySectionProps {
  previewOverride?: Partial<typeof DEFAULTS> | null;
}

function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: false, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StorySection({ previewOverride }: StorySectionProps = {}) {
  const [content, setContent] = useState(DEFAULTS);

  useEffect(() => {
    publicAPI
      .getContentSection("story")
      .then((res) => {
        const c = res.data.content;
        if (!c) return;
        setContent({
          title: c.title || DEFAULTS.title,
          subtitle: c.subtitle || DEFAULTS.subtitle,
          description: c.description || DEFAULTS.description,
          // Per-slot fallback: an unset slot falls back to the default photo
          // for that slot, not to a blank image. Slot 0 also honors the old
          // single-image field so nothing set before this existed is lost.
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
    <section id="our-story" className="py-24 px-4" style={{ background: "#F5EFE0" }}>
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-16">
          <FadeIn>
            <p className="text-xs tracking-[0.3em] uppercase mb-3" style={{ fontFamily: "'Lato', sans-serif", color: "#C0633A" }}>
              Who We Are
            </p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2.5rem,6vw,4rem)", color: "#2C1810", lineHeight: 1.15 }}>
              {content.title}
            </h2>
          </FadeIn>
          <FadeIn delay={0.2}>
            <h3
              style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.5rem,4vw,2.5rem)", fontStyle: "italic", color: "#8B6B4A", marginTop: "0.5rem" }}
            >
              {content.subtitle}
            </h3>
          </FadeIn>
        </div>

        {/* Story text + image layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
          <FadeIn>
            <div className="space-y-5">
              {paragraphs.map((p, i) => (
                <p
                  key={i}
                  className="leading-relaxed"
                  style={{ fontFamily: "'Lato', sans-serif", fontSize: "1.05rem", color: "#4A2E1A", lineHeight: 1.85 }}
                >
                  {p}
                </p>
              ))}
              <div className="pt-2">
                <span
                  className="text-xs tracking-[0.25em] uppercase"
                  style={{ fontFamily: "'Lato', sans-serif", color: "#C0633A" }}
                >
                  Crafted in Australia · Authentically Italian
                </span>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div className="relative">
              <img
                src={content.images[0]}
                alt="Classic tiramisu"
                className="w-full rounded-2xl object-cover"
                style={{ height: "420px", boxShadow: "0 20px 60px rgba(59,30,10,0.2)" }}
              />
              <div
                className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full border-2 overflow-hidden hidden md:block"
                style={{ borderColor: "#C9A87C", background: "#F5EFE0" }}
              >
                <img src={content.images[2]} alt="Tiramisu cup" className="w-full h-full object-cover" />
              </div>
            </div>
          </FadeIn>
        </div>

        {/* Gallery row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {content.images.map((src, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <div className="overflow-hidden rounded-xl" style={{ aspectRatio: "1" }}>
                <motion.img
                  src={src}
                  alt={`Mad Over Tiramisu ${i + 1}`}
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.06 }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
