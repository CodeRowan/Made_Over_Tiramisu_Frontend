import { ImageUploadField } from "./ImageUploadField";

interface MultiImageUploadFieldProps {
  value: string[];
  onChange: (images: string[]) => void;
  count: number;
  slotLabels: string[];
}

/**
 * Fixed number of image slots (not an arbitrary-length gallery) — matches
 * sections with a set visual layout where each photo has a specific job,
 * e.g. Story's main photo + inset circle + 4-tile gallery, or About's two
 * stacked photos. Each slot reuses ImageUploadField (paste URL or upload).
 */
export function MultiImageUploadField({ value, onChange, count, slotLabels }: MultiImageUploadFieldProps) {
  const slots = Array.from({ length: count }, (_, i) => value[i] || "");

  const handleSlotChange = (index: number, url: string) => {
    const next = [...slots];
    next[index] = url;
    onChange(next);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {slots.map((url, i) => (
        <div key={i}>
          <div style={{ fontSize: "11px", color: "#9d8371", marginBottom: "6px" }}>
            {slotLabels[i] || `Photo ${i + 1}`}
          </div>
          <ImageUploadField value={url} onChange={(newUrl) => handleSlotChange(i, newUrl)} previewHeight={110} />
        </div>
      ))}
    </div>
  );
}
