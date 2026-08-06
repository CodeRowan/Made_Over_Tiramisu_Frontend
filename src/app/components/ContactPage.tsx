import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { toast } from "./ui/CommonToaster";
import { publicAPI } from "../../services/api";
import { useContentOverride } from "../../hooks/useContentOverride";

interface ContactPageProps {
  onNavigate: (page: string) => void;
  previewOverride?: Partial<typeof DEFAULTS> | null;
}

const DEFAULTS = {
  title: "Contact Us",
  description: "",
};

export function ContactPage({ onNavigate, previewOverride }: ContactPageProps) {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [content, setContent] = useState(DEFAULTS);

  useEffect(() => {
    publicAPI
      .getContentSection("contact")
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.message.trim().length < 10) {
      toast.error("Please write a message of at least 10 characters");
      return;
    }

    try {
      setSubmitting(true);
      await publicAPI.submitContact(form);
      setSent(true);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to send message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 px-4 pb-16" style={{ background: "#F5EFE0" }}>
      <div className="max-w-xl mx-auto">
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
            Get in Touch
          </p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.5rem", color: "#2C1810", marginBottom: content.description ? "0.75rem" : "2rem" }}>
            {content.title}
          </h1>
          {content.description && (
            <p className="text-sm leading-relaxed mb-8" style={{ fontFamily: "'Lato', sans-serif", color: "#8B6B4A" }}>
              {content.description}
            </p>
          )}

          {sent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16"
            >
              <CheckCircle size={48} style={{ color: "#C0633A", margin: "0 auto 1rem" }} />
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", color: "#2C1810" }}>
                Message Sent!
              </h2>
              <p className="mt-2 text-sm" style={{ fontFamily: "'Lato', sans-serif", color: "#8B6B4A" }}>
                We'll be in touch shortly.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { key: "name", label: "Your Name", type: "text", placeholder: "Jane Smith" },
                { key: "email", label: "Email Address", type: "email", placeholder: "jane@example.com" },
              ].map((f) => (
                <div key={f.key}>
                  <label className="block text-xs tracking-wider uppercase mb-1.5" style={{ fontFamily: "'Lato', sans-serif", color: "#8B6B4A" }}>
                    {f.label}
                  </label>
                  <input
                    type={f.type}
                    placeholder={f.placeholder}
                    value={(form as any)[f.key]}
                    onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                    required
                    className="w-full px-4 py-3 rounded-xl outline-none"
                    style={{ background: "#EDE3CC", border: "1px solid rgba(59,30,10,0.15)", fontFamily: "'Lato', sans-serif", color: "#2C1810" }}
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs tracking-wider uppercase mb-1.5" style={{ fontFamily: "'Lato', sans-serif", color: "#8B6B4A" }}>
                  Message
                </label>
                <textarea
                  rows={5}
                  placeholder="How can we help?"
                  value={form.message}
                  onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                  required
                  className="w-full px-4 py-3 rounded-xl outline-none resize-none"
                  style={{ background: "#EDE3CC", border: "1px solid rgba(59,30,10,0.15)", fontFamily: "'Lato', sans-serif", color: "#2C1810" }}
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-full text-sm tracking-widest uppercase transition-all hover:opacity-90"
                style={{ background: "#C0633A", color: "#F5EFE0", fontFamily: "'Lato', sans-serif", opacity: submitting ? 0.7 : 1, cursor: submitting ? "not-allowed" : "pointer" }}
              >
                {submitting ? "Sending..." : "Send Message"}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
