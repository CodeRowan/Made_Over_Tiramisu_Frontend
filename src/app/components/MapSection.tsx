import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "motion/react";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { publicAPI } from "../../services/api";
import { useContentOverride } from "../../hooks/useContentOverride";

interface StoreLocation {
  _id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  hours: string;
  mapEmbedUrl: string;
  orderLink: string;
}

const DEFAULTS = { title: "Come Find Your Spoon", description: "" };

interface MapSectionProps {
  previewOverride?: Partial<typeof DEFAULTS> | null;
}

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: false, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function MapSection({ previewOverride }: MapSectionProps = {}) {
  const [locations, setLocations] = useState<StoreLocation[]>([]);
  const [content, setContent] = useState(DEFAULTS);

  useEffect(() => {
    publicAPI
      .getLocations()
      .then((res) => setLocations(Array.isArray(res.data.locations) ? res.data.locations : []))
      .catch(() => setLocations([]));

    publicAPI
      .getContentSection("map")
      .then((res) => {
        const c = res.data.content;
        if (!c) return;
        setContent({
          title: c.title || DEFAULTS.title,
          description: c.description || DEFAULTS.description,
        });
      })
      .catch(() => {
        // Fall back to default heading if content isn't configured yet
      });
  }, []);

  useContentOverride(setContent, previewOverride);

  if (locations.length === 0) return null;

  return (
    <section id="find-us" className="py-24 px-4" style={{ background: "#F5EFE0" }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <FadeIn>
            <p className="text-xs tracking-[0.3em] uppercase mb-3" style={{ fontFamily: "'Lato', sans-serif", color: "#C0633A" }}>
              Find Us
            </p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2.2rem,5vw,3.5rem)", color: "#2C1810" }}>
              {content.title}
            </h2>
          </FadeIn>
          {content.description && (
            <FadeIn delay={0.15}>
              <p className="mt-3 max-w-md mx-auto text-sm leading-relaxed" style={{ fontFamily: "'Lato', sans-serif", color: "#8B6B4A" }}>
                {content.description}
              </p>
            </FadeIn>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {locations.map((loc, i) => (
            <FadeIn key={loc._id} delay={i * 0.15}>
              <div
                className="rounded-2xl overflow-hidden"
                style={{ boxShadow: "0 4px 24px rgba(59,30,10,0.1)" }}
              >
                {/* Map embed */}
                {loc.mapEmbedUrl && (
                <div style={{ height: "240px" }}>
                  <iframe
                    src={loc.mapEmbedUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={loc.name}
                  />
                </div>
                )}

                {/* Info */}
                <div className="p-6" style={{ background: "#EDE3CC" }}>
                  <h3
                    className="mb-4"
                    style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.3rem", color: "#2C1810" }}
                  >
                    {loc.name}
                  </h3>
                  <div className="space-y-2.5">
                    <div className="flex items-start gap-3">
                      <MapPin size={15} style={{ color: "#C0633A", marginTop: "2px", flexShrink: 0 }} />
                      <p className="text-sm" style={{ fontFamily: "'Lato', sans-serif", color: "#4A2E1A" }}>{loc.address}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone size={15} style={{ color: "#C0633A", flexShrink: 0 }} />
                      <p className="text-sm" style={{ fontFamily: "'Lato', sans-serif", color: "#4A2E1A" }}>{loc.phone}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock size={15} style={{ color: "#C0633A", flexShrink: 0 }} />
                      <p className="text-sm" style={{ fontFamily: "'Lato', sans-serif", color: "#4A2E1A" }}>{loc.hours}</p>
                    </div>
                    {loc.email && (
                    <div className="flex items-center gap-3">
                      <Mail size={15} style={{ color: "#C0633A", flexShrink: 0 }} />
                      <p className="text-sm" style={{ fontFamily: "'Lato', sans-serif", color: "#4A2E1A" }}>{loc.email}</p>
                    </div>
                    )}
                  </div>

                  {loc.orderLink ? (
                    <a
                      href={loc.orderLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-5 inline-flex items-center justify-center w-full px-5 py-3 rounded-lg text-xs tracking-widest uppercase font-semibold transition-all duration-200"
                      style={{ fontFamily: "'Lato', sans-serif", background: "#C0633A", color: "#F5EFE0" }}
                      onMouseOver={(e) => ((e.currentTarget as HTMLElement).style.background = "#a4522e")}
                      onMouseOut={(e) => ((e.currentTarget as HTMLElement).style.background = "#C0633A")}
                    >
                      Order Now
                    </a>
                  ) : (
                    <button
                      disabled
                      className="mt-5 inline-flex items-center justify-center w-full px-5 py-3 rounded-lg text-xs tracking-widest uppercase font-semibold cursor-not-allowed"
                      style={{ fontFamily: "'Lato', sans-serif", background: "rgba(44,24,16,0.12)", color: "#8B6B4A" }}
                    >
                      Coming Soon
                    </button>
                  )}
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
