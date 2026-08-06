import { useState, useEffect } from "react";
import { Instagram, Mail, Phone, MapPin } from "lucide-react";
import { publicAPI } from "../../services/api";
import { useContentOverride } from "../../hooks/useContentOverride";
import { useSiteLogo } from "../../hooks/useSiteLogo";

interface FooterProps {
  onNavigate: (page: string) => void;
  previewOverride?: Partial<typeof DEFAULTS> | null;
}

const DEFAULTS = {
  title: "Mad Over Tiramisu",
  subtitle: "AUSTRALIA",
  description: "One recipe. Pure obsession. Hand-crafted tiramisu made fresh daily across Gold Coast, Australia.",
  address: "Hope Island & Emerald Lakes, QLD",
  email: "hello@madovertiramisu.com.au",
  phone: "+61 400 000 001",
};

export function Footer({ onNavigate, previewOverride }: FooterProps) {
  const [content, setContent] = useState(DEFAULTS);
  const logoImg = useSiteLogo();

  useEffect(() => {
    publicAPI
      .getContentSection("footer")
      .then((res) => {
        const c = res.data.content;
        if (!c) return;
        setContent({
          title: c.title || DEFAULTS.title,
          subtitle: c.subtitle || DEFAULTS.subtitle,
          description: c.description || DEFAULTS.description,
          address: c.address || DEFAULTS.address,
          email: c.email || DEFAULTS.email,
          phone: c.phone || DEFAULTS.phone,
        });
      })
      .catch(() => {
        // Fall back to defaults if content isn't configured yet
      });
  }, []);

  useContentOverride(setContent, previewOverride);

  return (
    <footer style={{ background: "#1A0D06" }}>
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img src={logoImg} alt="Mad Over Tiramisu" className="h-12 w-12 rounded-full object-cover" />
              <div>
                <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.1rem", color: "#F5EFE0" }}>{content.title}</p>
                <p className="text-xs tracking-widest" style={{ fontFamily: "'Lato', sans-serif", color: "#8B6B4A" }}>{content.subtitle}</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed mb-5" style={{ fontFamily: "'Lato', sans-serif", color: "rgba(245,239,224,0.6)", maxWidth: "280px" }}>
              {content.description}
            </p>
            <a
              href="https://www.instagram.com/mad_over_tiramisu/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 transition-opacity hover:opacity-70"
              style={{ color: "#C9A87C" }}
            >
              <Instagram size={18} />
              <span className="text-sm" style={{ fontFamily: "'Lato', sans-serif" }}>@mad_over_tiramisu</span>
            </a>
          </div>

          {/* Quick links */}
          <div>
            <p className="text-xs tracking-[0.2em] uppercase mb-4" style={{ fontFamily: "'Lato', sans-serif", color: "#C0633A" }}>
              Quick Links
            </p>
            <div className="space-y-2.5">
              {[
                { label: "Home", page: "home" },
                { label: "Our Story", page: "about" },
                { label: "Order Now", page: "products" },
                { label: "Contact Us", page: "contact" },
              ].map((item) => (
                <button
                  key={item.page}
                  onClick={() => onNavigate(item.page)}
                  className="block text-sm transition-opacity hover:opacity-70"
                  style={{ fontFamily: "'Lato', sans-serif", color: "rgba(245,239,224,0.65)" }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <p className="text-xs tracking-[0.2em] uppercase mb-4" style={{ fontFamily: "'Lato', sans-serif", color: "#C0633A" }}>
              Contact
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <MapPin size={14} style={{ color: "#8B6B4A", marginTop: "2px", flexShrink: 0 }} />
                <p className="text-sm" style={{ fontFamily: "'Lato', sans-serif", color: "rgba(245,239,224,0.6)" }}>
                  {content.address}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={14} style={{ color: "#8B6B4A" }} />
                <p className="text-sm" style={{ fontFamily: "'Lato', sans-serif", color: "rgba(245,239,224,0.6)" }}>
                  {content.email}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={14} style={{ color: "#8B6B4A" }} />
                <p className="text-sm" style={{ fontFamily: "'Lato', sans-serif", color: "rgba(245,239,224,0.6)" }}>
                  {content.phone}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-8"
          style={{ borderTop: "1px solid rgba(201,168,124,0.15)" }}
        >
          <p className="text-xs" style={{ fontFamily: "'Lato', sans-serif", color: "rgba(245,239,224,0.35)" }}>
            © 2026 Mad Over Tiramisu. All rights reserved. Crafted with love in Australia.
          </p>
          <p className="text-xs" style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", color: "#8B6B4A" }}>
            One recipe. Pure obsession.
          </p>
        </div>
      </div>
    </footer>
  );
}
