import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "motion/react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { publicAPI } from "../../services/api";
import { useContentOverride } from "../../hooks/useContentOverride";

interface Testimonial {
  _id: string;
  name: string;
  location: string;
  text: string;
  rating: number;
}

const DEFAULTS = { title: "Mad in Love with Every Spoon", description: "" };

interface TestimonialsSectionProps {
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

export function TestimonialsSection({ previewOverride }: TestimonialsSectionProps = {}) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [content, setContent] = useState(DEFAULTS);
  const [page, setPage] = useState(0);
  const perPage = 3;

  useEffect(() => {
    publicAPI
      .getTestimonials()
      .then((res) => {
        setTestimonials(Array.isArray(res.data.testimonials) ? res.data.testimonials : []);
      })
      .catch(() => setTestimonials([]));

    publicAPI
      .getContentSection("testimonials")
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

  const totalPages = Math.ceil(testimonials.length / perPage);
  const visible = testimonials.slice(page * perPage, page * perPage + perPage);

  if (testimonials.length === 0) return null;

  return (
    <section className="py-24 px-4" style={{ background: "#EDE3CC" }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <FadeIn>
            <p className="text-xs tracking-[0.3em] uppercase mb-3" style={{ fontFamily: "'Lato', sans-serif", color: "#C0633A" }}>
              Reviews
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {visible.map((t, i) => (
            <FadeIn key={t._id} delay={i * 0.1}>
              <div
                className="p-6 rounded-2xl flex flex-col gap-4 h-full"
                style={{ background: "#F5EFE0", boxShadow: "0 2px 16px rgba(59,30,10,0.07)" }}
              >
                <div className="flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} size={14} fill="#C0633A" style={{ color: "#C0633A" }} />
                  ))}
                </div>
                <p
                  className="leading-relaxed flex-1"
                  style={{ fontFamily: "'Lato', sans-serif", fontSize: "0.95rem", color: "#4A2E1A", lineHeight: 1.75, fontStyle: "italic" }}
                >
                  "{t.text}"
                </p>
                <div>
                  <p className="text-sm" style={{ fontFamily: "'Lato', sans-serif", color: "#2C1810", fontWeight: 700 }}>
                    {t.name}
                  </p>
                  <p className="text-xs" style={{ fontFamily: "'Lato', sans-serif", color: "#8B6B4A" }}>
                    {t.location}
                  </p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-2 rounded-full border transition-all duration-200 hover:opacity-80 disabled:opacity-30"
              style={{ borderColor: "rgba(59,30,10,0.2)", color: "#2C1810" }}
            >
              <ChevronLeft size={18} />
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className="w-2 h-2 rounded-full transition-all duration-200"
                style={{ background: i === page ? "#C0633A" : "rgba(59,30,10,0.2)" }}
              />
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="p-2 rounded-full border transition-all duration-200 hover:opacity-80 disabled:opacity-30"
              style={{ borderColor: "rgba(59,30,10,0.2)", color: "#2C1810" }}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
