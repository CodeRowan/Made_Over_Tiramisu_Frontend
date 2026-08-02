import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Header } from "../components/Header";
import { HeroSection } from "../components/HeroSection";
import { StorySection } from "../components/StorySection";
import { AboutPage } from "../components/AboutPage";
import { VideoSection } from "../components/VideoSection";
import { TestimonialsSection } from "../components/TestimonialsSection";
import { InstagramSection } from "../components/InstagramSection";
import { MapSection } from "../components/MapSection";
import { ContactPage } from "../components/ContactPage";
import { Footer } from "../components/Footer";

const noop = () => {};

/**
 * Standalone route rendered inside the admin Content preview iframe.
 * Renders the ACTUAL public component for the section being edited — so the
 * preview is guaranteed pixel-identical to the live site and never drifts
 * out of sync with it. Draft edits arrive via postMessage from the parent
 * admin window and are merged on top of the saved content.
 */
export function PreviewFrame() {
  const [params] = useSearchParams();
  const section = params.get("section") || "hero";
  const [override, setOverride] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data?.type !== "MOT_PREVIEW_CONTENT") return;
      if (event.data.section !== section) return;
      setOverride(event.data.content || null);
    };
    window.addEventListener("message", handler);
    // Tell the parent this frame is ready to receive the current draft
    window.parent.postMessage({ type: "MOT_PREVIEW_READY", section }, window.location.origin);
    return () => window.removeEventListener("message", handler);
  }, [section]);

  return (
    <div style={{ minHeight: "100vh", background: "#F5EFE0" }}>
      {section === "general" && (
        // currentPage="about" (any non-"home" page) so Header renders its
        // opaque dark background immediately, instead of the transparent
        // hero-only variant that would blend into this plain preview page.
        <Header onNavigate={noop} currentPage="about" previewOverride={override} />
      )}
      {section === "hero" && <HeroSection onNavigate={noop} previewOverride={override} />}
      {section === "story" && <StorySection previewOverride={override} />}
      {section === "about" && <AboutPage onNavigate={noop} previewOverride={override} />}
      {section === "video" && <VideoSection previewOverride={override} />}
      {section === "testimonials" && <TestimonialsSection previewOverride={override} />}
      {section === "instagram" && <InstagramSection previewOverride={override} />}
      {section === "map" && <MapSection previewOverride={override} />}
      {section === "contact" && <ContactPage onNavigate={noop} previewOverride={override} />}
      {section === "footer" && <Footer onNavigate={noop} previewOverride={override} />}
    </div>
  );
}
