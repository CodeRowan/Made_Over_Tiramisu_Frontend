import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "motion/react";
import { Instagram, Heart, MessageCircle } from "lucide-react";
import { publicAPI } from "../../services/api";
import { useContentOverride } from "../../hooks/useContentOverride";
import { useSiteLogo } from "../../hooks/useSiteLogo";

interface InstagramPost {
  _id: string;
  image: string;
  likes: number;
  comments: number;
  link?: string;
}

const DEFAULTS = {
  title: "mad_over_tiramisu",
  description:
    "Gold Coast's newest tiramisu obsession · Crafted by the team behind Mad over Italian · Made authentically fresh daily 🤎",
};

interface InstagramSectionProps {
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

export function InstagramSection({ previewOverride }: InstagramSectionProps = {}) {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [content, setContent] = useState(DEFAULTS);
  const logoImg = useSiteLogo();

  useEffect(() => {
    publicAPI
      .getInstagramPosts()
      .then((res) => setPosts(Array.isArray(res.data.posts) ? res.data.posts : []))
      .catch(() => setPosts([]));

    publicAPI
      .getContentSection("instagram")
      .then((res) => {
        const c = res.data.content;
        if (!c) return;
        setContent({
          title: c.title || DEFAULTS.title,
          description: c.description || DEFAULTS.description,
        });
      })
      .catch(() => {
        // Fall back to defaults if content isn't configured yet
      });
  }, []);

  useContentOverride(setContent, previewOverride);

  return (
    <section className="py-24 px-4" style={{ background: "#2C1810" }}>
      <div className="max-w-6xl mx-auto">
        {/* Profile header */}
        <FadeIn>
          <div className="flex items-center gap-6 mb-12 flex-wrap">
            <div className="relative">
              <div
                className="w-20 h-20 rounded-full overflow-hidden border-2"
                style={{ borderColor: "#C9A87C", padding: "2px" }}
              >
                <img src={logoImg} alt="@mad_over_tiramisu" className="w-full h-full rounded-full object-cover" />
              </div>
              <div
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
                style={{ background: "#C0633A" }}
              >
                <Instagram size={12} style={{ color: "#F5EFE0" }} />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.4rem", color: "#F5EFE0" }}>
                  {content.title}
                </h3>
                <a
                  href="https://www.instagram.com/mad_over_tiramisu/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-1 rounded-full text-xs tracking-widest uppercase border transition-all duration-200 hover:opacity-80"
                  style={{ fontFamily: "'Lato', sans-serif", borderColor: "#C9A87C", color: "#C9A87C" }}
                >
                  Follow
                </a>
              </div>
              <div className="flex gap-6 mt-2">
                {[[String(posts.length), "Posts"], ["41", "Followers"], ["1", "Following"]].map(([n, l]) => (
                  <div key={l} className="text-center">
                    <p style={{ fontFamily: "'Lato', sans-serif", color: "#F5EFE0", fontWeight: 700 }}>{n}</p>
                    <p className="text-xs" style={{ fontFamily: "'Lato', sans-serif", color: "#8B6B4A" }}>{l}</p>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-sm" style={{ fontFamily: "'Lato', sans-serif", color: "rgba(245,239,224,0.7)" }}>
                {content.description}
              </p>
            </div>
          </div>
        </FadeIn>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5">
          {posts.map((post, i) => (
            <FadeIn key={post._id} delay={i * 0.07}>
              <motion.a
                href={post.link || "https://www.instagram.com/mad_over_tiramisu/"}
                target="_blank"
                rel="noopener noreferrer"
                className="relative overflow-hidden group cursor-pointer block"
                style={{ aspectRatio: "1" }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <img
                  src={post.image}
                  alt={`Instagram post ${i + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-6"
                  style={{ background: "rgba(44,24,16,0.6)" }}
                >
                  <div className="flex items-center gap-1.5" style={{ color: "#F5EFE0" }}>
                    <Heart size={18} fill="#F5EFE0" />
                    <span className="text-sm" style={{ fontFamily: "'Lato', sans-serif" }}>{post.likes}</span>
                  </div>
                  <div className="flex items-center gap-1.5" style={{ color: "#F5EFE0" }}>
                    <MessageCircle size={18} fill="#F5EFE0" />
                    <span className="text-sm" style={{ fontFamily: "'Lato', sans-serif" }}>{post.comments}</span>
                  </div>
                </div>
              </motion.a>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.3}>
          <div className="text-center mt-8">
            <a
              href="https://www.instagram.com/mad_over_tiramisu/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm tracking-widest uppercase border transition-all duration-200 hover:opacity-80"
              style={{ fontFamily: "'Lato', sans-serif", borderColor: "#C9A87C", color: "#C9A87C" }}
            >
              <Instagram size={14} />
              @mad_over_tiramisu
            </a>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
