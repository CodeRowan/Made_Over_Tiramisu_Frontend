import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "motion/react";
import { Play } from "lucide-react";
import heroBg from "../../imports/tiraminsu_home_page_bg_image.png";
import { publicAPI } from "../../services/api";
import { useContentOverride } from "../../hooks/useContentOverride";

const DEFAULTS = {
  title: "The Art of the Perfect Spoon",
  description: "",
  videoId: "dQw4w9WgXcQ",
  image: heroBg,
};

interface VideoSectionProps {
  previewOverride?: Partial<typeof DEFAULTS> | null;
}

export function VideoSection({ previewOverride }: VideoSectionProps = {}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: false, margin: "-100px" });
  const [playing, setPlaying] = useState(false);
  const [content, setContent] = useState(DEFAULTS);

  useEffect(() => {
    publicAPI
      .getContentSection("video")
      .then((res) => {
        const c = res.data.content;
        if (!c) return;
        setContent({
          title: c.title || DEFAULTS.title,
          description: c.description || DEFAULTS.description,
          videoId: c.videoId || DEFAULTS.videoId,
          image: c.image || heroBg,
        });
      })
      .catch(() => {
        // Fall back to defaults if content isn't configured yet
      });
  }, []);

  useContentOverride(setContent, previewOverride);

  const VIDEO_ID = content.videoId;

  return (
    <section
      ref={ref}
      className="py-24 px-4 relative overflow-hidden"
      style={{ background: "#2C1810" }}
    >
      {/* Subtle texture overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{ backgroundImage: "radial-gradient(circle at 30% 60%, #C9A87C 0%, transparent 60%)" }}
      />

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-10"
        >
          <p className="text-xs tracking-[0.3em] uppercase mb-3" style={{ fontFamily: "'Lato', sans-serif", color: "#C0633A" }}>
            Watch
          </p>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2rem,5vw,3.5rem)", color: "#F5EFE0" }}>
            {content.title}
          </h2>
          {content.description && (
            <p className="mt-3 max-w-md mx-auto text-sm leading-relaxed" style={{ fontFamily: "'Lato', sans-serif", color: "rgba(245,239,224,0.7)" }}>
              {content.description}
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="relative rounded-2xl overflow-hidden"
          style={{ aspectRatio: "16/9", boxShadow: "0 30px 80px rgba(0,0,0,0.5)" }}
        >
          {!playing ? (
            <div className="relative w-full h-full">
              <img
                src={content.image}
                alt="Tiramisu video thumbnail"
                className="w-full h-full object-cover"
                style={{ filter: "brightness(0.5)" }}
              />
              <button
                onClick={() => setPlaying(true)}
                className="absolute inset-0 flex items-center justify-center group"
              >
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                  style={{ background: "rgba(192,99,58,0.9)", backdropFilter: "blur(4px)" }}
                >
                  <Play size={30} className="ml-1" style={{ color: "#F5EFE0" }} fill="#F5EFE0" />
                </div>
              </button>
              <div className="absolute bottom-6 left-6">
                <p className="text-sm" style={{ fontFamily: "'Lato', sans-serif", color: "rgba(245,239,224,0.7)" }}>
                  Click to play
                </p>
              </div>
            </div>
          ) : (
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${VIDEO_ID}?autoplay=1`}
              title="Mad Over Tiramisu"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
        </motion.div>
      </div>
    </section>
  );
}
