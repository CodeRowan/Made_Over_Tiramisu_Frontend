import { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { toast } from 'sonner';
import { contentAPI } from '../../services/api';
import { CONTENT_FIELD_LIMITS } from '../../constants/fieldLimits';
import { LimitedField } from '../components/admin/LimitedField';
import { ImageUploadField } from '../components/admin/ImageUploadField';
import { MultiImageUploadField } from '../components/admin/MultiImageUploadField';
import { SkeletonBlock } from '../components/admin/Skeleton';
import { useRealtimeUpdates } from '../../hooks/useAdminSocket';
import { useIsMobile } from '../../hooks/useIsMobile';

const SECTIONS = [
  { id: 'general', label: 'Branding' },
  { id: 'hero', label: 'Hero banner' },
  { id: 'about', label: 'About' },
  { id: 'story', label: 'Our Story' },
  { id: 'video', label: 'Video' },
  { id: 'testimonials', label: 'Reviews' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'map', label: 'Find Us' },
  { id: 'contact', label: 'Contact' },
  { id: 'footer', label: 'Footer' },
];

// Only the fields each section's real page actually renders — keeps the
// editor honest: every field shown here visibly changes the live preview.
const SECTION_FIELDS: Record<string, { key: string; label: string }[]> = {
  general: [
    { key: 'image', label: 'Site logo (shown in the header, footer, and Instagram section)' },
  ],
  hero: [
    { key: 'title', label: 'Title' },
    { key: 'subtitle', label: 'Eyebrow tagline' },
    { key: 'description', label: 'Description' },
    { key: 'image', label: 'Background image URL' },
  ],
  about: [
    { key: 'title', label: 'Title' },
    { key: 'subtitle', label: 'Subtitle' },
    { key: 'description', label: 'Description' },
    { key: 'images', label: 'Photos' },
  ],
  story: [
    { key: 'title', label: 'Title' },
    { key: 'subtitle', label: 'Subtitle' },
    { key: 'description', label: 'Description' },
    { key: 'images', label: 'Photos' },
  ],
  video: [
    { key: 'title', label: 'Title' },
    { key: 'description', label: 'Description' },
    { key: 'videoId', label: 'YouTube video ID' },
    { key: 'image', label: 'Thumbnail image URL' },
  ],
  testimonials: [
    { key: 'title', label: 'Heading' },
    { key: 'description', label: 'Supporting text' },
  ],
  instagram: [
    { key: 'title', label: 'Handle' },
    { key: 'description', label: 'Bio' },
  ],
  map: [
    { key: 'title', label: 'Heading' },
    { key: 'description', label: 'Supporting text' },
  ],
  contact: [
    { key: 'title', label: 'Heading' },
    { key: 'description', label: 'Intro text' },
  ],
  footer: [
    { key: 'title', label: 'Business name' },
    { key: 'subtitle', label: 'Tagline label' },
    { key: 'description', label: 'Description' },
    { key: 'address', label: 'Address' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
  ],
};

// How many photo slots each multi-image section has, and what each one
// actually renders as on the real page — so the admin knows exactly which
// visual spot each upload fills.
const IMAGE_SLOT_LABELS: Record<string, string[]> = {
  about: ['Large top photo', 'Small bottom photo'],
  story: [
    'Main photo (also the 1st gallery tile)',
    '2nd gallery tile',
    'Inset circle photo (also the 3rd gallery tile)',
    '4th gallery tile',
  ],
};

// A cheap deep-enough equality check — handles both plain values and the
// image arrays without treating two freshly-fetched-but-identical arrays as
// "changed" just because they're different array instances.
const isEqualValue = (a: any, b: any) => JSON.stringify(a ?? '') === JSON.stringify(b ?? '');

interface ContentData {
  [key: string]: any;
}

// Real device viewport sizes so the iframe's own vw/vh-based responsive
// CSS (clamp(), etc.) computes exactly as it would on that device.
const DEVICE_SIZES = {
  phone: { width: 390, height: 844 },
  desktop: { width: 1440, height: 900 },
};

export function ContentAdmin() {
  const isMobile = useIsMobile();
  const [selectedSection, setSelectedSection] = useState('hero');
  const [content, setContent] = useState<ContentData>({});
  const [originalContent, setOriginalContent] = useState<ContentData>({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [previewMode, setPreviewMode] = useState<'phone' | 'desktop'>('desktop');
  const [previewReady, setPreviewReady] = useState(false);
  const [scale, setScale] = useState(1);
  // On mobile there's no room to show the form and the live preview side by
  // side — the preview is opt-in behind a toggle instead of always-on.
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const { setStatus }: any = useOutletContext();

  const paneRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    loadContent(selectedSection);
    setPreviewReady(false);
  }, [selectedSection]);

  // Fit the fixed-size device frame into whatever width the preview pane has
  useEffect(() => {
    const recalc = () => {
      if (!paneRef.current) return;
      const available = paneRef.current.clientWidth - 32; // padding
      const deviceWidth = DEVICE_SIZES[previewMode].width;
      setScale(Math.min(1, available / deviceWidth));
    };
    recalc();
    const observer = new ResizeObserver(recalc);
    if (paneRef.current) observer.observe(paneRef.current);
    return () => observer.disconnect();
  }, [previewMode]);

  // Push the current draft into the preview iframe whenever it changes
  useEffect(() => {
    if (!previewReady || !iframeRef.current?.contentWindow) return;
    iframeRef.current.contentWindow.postMessage(
      { type: 'MOT_PREVIEW_CONTENT', section: selectedSection, content },
      window.location.origin
    );
  }, [content, previewReady, selectedSection]);

  // Listen for the preview frame announcing it has mounted and is ready
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === 'MOT_PREVIEW_READY' && event.data.section === selectedSection) {
        setPreviewReady(true);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [selectedSection]);

  // Live-refresh when content changes elsewhere (another admin, another
  // tab) — but never while there's an unsaved local edit in progress, so we
  // don't silently overwrite what the admin is in the middle of typing.
  useRealtimeUpdates(['content:changed'], () => {
    const fields = SECTION_FIELDS[selectedSection] || [];
    const hasLocalEdits = fields.some(({ key }) => !isEqualValue(content[key], originalContent[key]));
    if (hasLocalEdits) return;
    loadContent(selectedSection);
  });

  const loadContent = async (section: string) => {
    try {
      setPageLoading(true);
      const response = await contentAPI.getSection(section);
      const data = response.data.content || {};
      setContent(data);
      setOriginalContent(data);
    } catch (error) {
      toast.error('Failed to load content');
    } finally {
      setPageLoading(false);
    }
  };

  const handleFieldChange = (key: string, value: any) => {
    setContent({ ...content, [key]: value });
    setStatus('Editing content');
  };

  // The actual network save — only ever called after the admin confirms
  // exactly what's about to change, in confirmAndSave() below.
  const persistSave = async () => {
    try {
      setLoading(true);
      setStatus('Saving...');

      const fields = SECTION_FIELDS[selectedSection] || [];
      const payload: ContentData = {};
      // Title is required by the backend on every section, even ones (like
      // Branding) that don't expose it as an editable field here — resend
      // the already-fetched value untouched so the save doesn't fail.
      if (content.title !== undefined) payload.title = content.title;
      fields.forEach(({ key }) => {
        if (content[key] !== undefined) payload[key] = content[key];
      });

      const response = await contentAPI.updateSection(selectedSection, payload);
      const saved = response.data.content || payload;
      setContent(saved);
      setOriginalContent(saved);
      toast.success('Content published');
      setStatus('Saved!');
      setTimeout(() => setStatus('No changes'), 2000);
    } catch (error) {
      toast.error('Failed to save content');
      setStatus('Error saving');
    } finally {
      setLoading(false);
    }
  };

  // Fields that actually differ from the last-saved version — this drives
  // both the "is there anything to confirm" check and the confirm dialog's list.
  const fields = SECTION_FIELDS[selectedSection] || [];
  const changedFields = fields.filter(
    ({ key }) => !isEqualValue(content[key], originalContent[key])
  );

  // Opens the confirmation dialog instead of saving immediately — this is
  // what this page's own Save button triggers.
  const requestSave = async () => {
    if (changedFields.length === 0) {
      // Draft was typed then manually reverted back to the saved value —
      // nothing to publish, so just clear the status instead of silently
      // doing nothing.
      setStatus('No changes');
      return;
    }
    setShowConfirm(true);
  };

  const confirmAndSave = async () => {
    setShowConfirm(false);
    await persistSave();
  };

  const handleUndo = () => {
    // Discard local edits by re-fetching the last-saved version from the server
    loadContent(selectedSection);
    setStatus('No changes');
  };

  const sectionInfo = SECTIONS.find((s) => s.id === selectedSection);
  const device = DEVICE_SIZES[previewMode];

  const formatValue = (value: any) => {
    if (Array.isArray(value)) {
      const set = value.filter(Boolean).length;
      return set === 0 ? '(no photos set)' : `${set} of ${value.length} photo slot${value.length === 1 ? '' : 's'} set`;
    }
    if (!value) return '(empty)';
    return value.length > 140 ? `${value.slice(0, 140)}…` : value;
  };

  return (
    <>
    <div style={{ flex: "1", minHeight: "0", display: "flex", flexDirection: isMobile ? "column" : "row", minWidth: "0" }}>
      {/* Section Selector — vertical list on desktop, horizontal scroll strip on mobile */}
      {isMobile ? (
        <div style={{ display: "flex", gap: "8px", overflowX: "auto", flex: "none", background: "#FFFDF8", borderBottom: "1px solid rgba(44,24,16,.1)", padding: "12px 14px" }}>
          {SECTIONS.map((section) => (
            <button
              key={section.id}
              onClick={() => setSelectedSection(section.id)}
              style={{
                flex: "none",
                whiteSpace: "nowrap",
                padding: "8px 14px",
                borderRadius: "20px",
                border: "none",
                background: selectedSection === section.id ? "#2C1810" : "#F2EADC",
                color: selectedSection === section.id ? "#F5EFE0" : "#7a5c48",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {section.label}
            </button>
          ))}
        </div>
      ) : (
        <div style={{ flex: "0 1 250px", minWidth: "168px", background: "#FFFDF8", borderRight: "1px solid rgba(44,24,16,.1)", overflow: "auto", padding: "20px 0" }}>
          {SECTIONS.map((section) => (
            <button
              key={section.id}
              onClick={() => setSelectedSection(section.id)}
              style={{
                width: "100%",
                padding: "12px 20px",
                textAlign: "left",
                background: selectedSection === section.id ? "#F7F2E8" : "transparent",
                border: "none",
                borderLeft: selectedSection === section.id ? "3px solid #C0633A" : "3px solid transparent",
                fontSize: "13px",
                color: selectedSection === section.id ? "#2C1810" : "#7a5c48",
                cursor: "pointer",
                transition: "all .2s ease",
              }}
              onMouseOver={e => (e.currentTarget as HTMLElement).style.background = selectedSection === section.id ? "#F7F2E8" : "#FFFDF8"}
              onMouseOut={e => (e.currentTarget as HTMLElement).style.background = selectedSection === section.id ? "#F7F2E8" : "transparent"}
            >
              {section.label}
            </button>
          ))}
        </div>
      )}

      {/* Middle - Edit Form */}
      <div style={{ flex: isMobile ? "none" : "0 1 430px", minWidth: isMobile ? "0" : "300px", overflow: isMobile ? "visible" : "auto", padding: "26px 22px 60px" }}>
        <div style={{ fontSize: "11px", letterSpacing: ".16em", textTransform: "uppercase", color: "#C0633A" }}>
          Now editing
        </div>
        <div style={{ fontFamily: "var(--font-heading)", fontWeight: "800", fontSize: "26px", margin: "4px 0 2px" }}>
          {sectionInfo?.label || "Content"}
        </div>
        <p style={{ fontSize: "13px", color: "#7a5c48", marginBottom: "20px" }}>
          Edit this section to update it on the website.
        </p>

        {/* Fields — restricted to what this section actually displays */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {pageLoading ? (
            <>
              {[1, 2, 3].map((i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                  <SkeletonBlock width="30%" height={13} />
                  <SkeletonBlock height={44} borderRadius={8} />
                </div>
              ))}
            </>
          ) : (
            fields.map(({ key, label }) => {
              const maxLength = CONTENT_FIELD_LIMITS[selectedSection]?.[key];
              return (
                <div key={key}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "7px" }}>
                    <span style={{ fontSize: "13px", fontFamily: "var(--font-heading)", fontWeight: "800" }}>
                      {label}
                    </span>
                  </div>
                  {key === 'image' ? (
                    <ImageUploadField
                      value={content[key] || ''}
                      onChange={(url) => handleFieldChange(key, url)}
                    />
                  ) : key === 'images' ? (
                    <MultiImageUploadField
                      value={content[key] || []}
                      onChange={(images) => handleFieldChange(key, images)}
                      count={(IMAGE_SLOT_LABELS[selectedSection] || []).length}
                      slotLabels={IMAGE_SLOT_LABELS[selectedSection] || []}
                    />
                  ) : (
                    <LimitedField
                      value={content[key] || ''}
                      onChange={(value) => handleFieldChange(key, value)}
                      maxLength={maxLength || 100}
                      multiline={key === 'description'}
                    />
                  )}
                </div>
              );
            })
          )}

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
              onClick={requestSave}
              disabled={pageLoading || loading || changedFields.length === 0}
              style={{
                height: "42px",
                padding: "0 22px",
                background: "#C0633A",
                border: "none",
                color: "#fff",
                fontFamily: "var(--font-heading)",
                fontWeight: "800",
                fontSize: "14px",
                cursor: pageLoading || loading || changedFields.length === 0 ? "not-allowed" : "pointer",
                transition: "background .2s ease",
                opacity: pageLoading || loading || changedFields.length === 0 ? 0.5 : 1,
                borderRadius: "6px",
              }}
              onMouseOver={e => !pageLoading && !loading && changedFields.length > 0 && ((e.currentTarget as HTMLElement).style.background = "#a4522e")}
              onMouseOut={e => !pageLoading && !loading && changedFields.length > 0 && ((e.currentTarget as HTMLElement).style.background = "#C0633A")}
            >
              {loading ? "Saving..." : "Save changes"}
            </button>

            <button
              onClick={handleUndo}
              disabled={pageLoading || loading || changedFields.length === 0}
              style={{
                height: "42px",
                padding: "0 18px",
                background: changedFields.length > 0 ? "#F2EADC" : "transparent",
                border: changedFields.length > 0 ? "1px solid rgba(44,24,16,.1)" : "none",
                color: "#7a5c48",
                font: "inherit",
                fontSize: "14px",
                cursor: pageLoading || loading || changedFields.length === 0 ? "not-allowed" : "pointer",
                opacity: pageLoading || loading || changedFields.length === 0 ? 0.5 : 1,
                transition: "background .2s",
                borderRadius: "6px",
              }}
              onMouseOver={e => changedFields.length > 0 && ((e.currentTarget as HTMLElement).style.background = "rgba(44,24,16,.06)")}
              onMouseOut={e => changedFields.length > 0 && ((e.currentTarget as HTMLElement).style.background = "#F2EADC")}
            >
              Undo
            </button>
          </div>

          {isMobile && (
            <button
              onClick={() => setShowMobilePreview((v) => !v)}
              style={{ height: "40px", padding: "0 20px", background: "transparent", border: "1px solid rgba(44,24,16,.18)", color: "#7a5c48", font: "inherit", fontSize: "13px", cursor: "pointer", borderRadius: "6px" }}
            >
              {showMobilePreview ? "Hide live preview" : "Show live preview"}
            </button>
          )}
        </div>
      </div>

      {/* Right - Live Preview (the actual site, rendered in an iframe) — on
          mobile this sits below the form, shown only when toggled on, since
          there's no room to keep the form and a device-sized preview side by side */}
      {(!isMobile || showMobilePreview) && (
      <div style={{ flex: isMobile ? "none" : "1 1 480px", minWidth: isMobile ? "0" : "438px", height: isMobile ? "70vh" : undefined, display: "flex", flexDirection: "column", background: "#EDE5D8", borderLeft: isMobile ? "none" : "1px solid rgba(44,24,16,.1)", borderTop: isMobile ? "1px solid rgba(44,24,16,.1)" : "none" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px 20px", flex: "none" }}>
          <div style={{ display: "flex", background: "#FFFDF8", padding: "3px", borderRadius: "12px", flex: "none" }}>
            <button
              onClick={() => setPreviewMode('phone')}
              style={{ padding: "4px 12px", fontSize: "12px", background: previewMode === 'phone' ? "#F2EADC" : "transparent", color: previewMode === 'phone' ? "#2C1810" : "#7a5c48", border: "none", borderRadius: "8px", cursor: "pointer" }}
            >
              Phone
            </button>
            <button
              onClick={() => setPreviewMode('desktop')}
              style={{ padding: "4px 12px", fontSize: "12px", background: previewMode === 'desktop' ? "#F2EADC" : "transparent", color: previewMode === 'desktop' ? "#2C1810" : "#7a5c48", border: "none", borderRadius: "8px", cursor: "pointer" }}
            >
              Desktop
            </button>
          </div>
          <span style={{ fontSize: "12px", color: "#7a5c48", flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            Live preview · renders the real site, not a mockup
          </span>
        </div>

        <div ref={paneRef} style={{ flex: "1", minHeight: "0", overflow: "auto", padding: "16px", display: "flex", justifyContent: "center" }}>
          <div
            style={{
              width: device.width * scale,
              height: device.height * scale,
              flexShrink: 0,
              borderRadius: previewMode === 'phone' ? "28px" : "8px",
              border: "1px solid rgba(44,24,16,.16)",
              boxShadow: "0 8px 24px rgba(44,24,16,.1)",
              overflow: "hidden",
              background: "#FFFDF8",
              position: "relative",
            }}
          >
            <iframe
              ref={iframeRef}
              key={selectedSection}
              src={`/preview?section=${selectedSection}`}
              title="Live section preview"
              style={{
                width: device.width,
                height: device.height,
                border: "none",
                transform: `scale(${scale})`,
                transformOrigin: "top left",
              }}
              onLoad={() => setPreviewReady(false)}
            />
          </div>
        </div>
      </div>
      )}
    </div>

    {/* Confirm-before-publish dialog — shows exactly what's about to change */}
    {showConfirm && (
      <div
        onClick={() => setShowConfirm(false)}
        style={{ position: "fixed", inset: 0, background: "rgba(44,24,16,.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{ background: "#FFFDF8", borderRadius: "14px", padding: "28px", width: "min(520px, 92vw)", maxHeight: "82vh", overflow: "auto", display: "flex", flexDirection: "column", gap: "16px" }}
        >
          <div style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "20px" }}>
            Publish these changes to {sectionInfo?.label}?
          </div>
          <p style={{ fontSize: "13px", color: "#7a5c48", margin: 0 }}>
            This will go live on the website immediately. Review what's changing:
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {changedFields.map(({ key, label }) => (
              <div key={key} style={{ background: "#F7F2E8", borderRadius: "8px", padding: "12px 14px" }}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "#2C1810", marginBottom: "6px" }}>{label}</div>
                <div style={{ fontSize: "12px", color: "#a4522e", textDecoration: "line-through", marginBottom: "3px", whiteSpace: "pre-wrap", overflowWrap: "break-word", wordBreak: "break-word" }}>
                  {formatValue(originalContent[key])}
                </div>
                <div style={{ fontSize: "12px", color: "#22863a", whiteSpace: "pre-wrap", overflowWrap: "break-word", wordBreak: "break-word" }}>
                  {formatValue(content[key])}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
            <button
              onClick={() => setShowConfirm(false)}
              style={{ flex: 1, height: "44px", background: "transparent", border: "1px solid rgba(44,24,16,.2)", borderRadius: "8px", color: "#7a5c48", cursor: "pointer", font: "inherit", fontSize: "14px" }}
            >
              Cancel
            </button>
            <button
              onClick={confirmAndSave}
              disabled={loading}
              style={{ flex: 1, height: "44px", background: "#C0633A", border: "none", borderRadius: "8px", color: "#fff", fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "14px", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.8 : 1 }}
            >
              {loading ? "Publishing..." : "Confirm & publish"}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
