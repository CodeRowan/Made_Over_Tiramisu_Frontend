import { useRef, useState } from "react";
import { toast } from "sonner";
import { uploadAPI } from "../../../services/api";
import { MAX_IMAGE_SIZE_MB, ALLOWED_IMAGE_TYPES } from "../../../constants/fieldLimits";

interface ImageUploadFieldProps {
  value: string;
  onChange: (url: string) => void;
  previewHeight?: number;
}

/**
 * Image field for admin forms: paste a URL directly, or upload a file from
 * the device — which uploads to Cloudinary via the backend and stores the
 * returned URL. Validates type/size client-side before ever hitting the
 * network, matching the backend's actual multer limits.
 */
export function ImageUploadField({ value, onChange, previewHeight = 160 }: ImageUploadFieldProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Please choose a JPEG, PNG, WEBP or GIF image");
      e.target.value = "";
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      toast.error(`Image must be ${MAX_IMAGE_SIZE_MB}MB or smaller`);
      e.target.value = "";
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      const response = await uploadAPI.uploadImage(formData);
      onChange(response.data.imageUrl);
      toast.success("Image uploaded");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div>
      {value && (
        <div style={{ marginBottom: "8px", borderRadius: "8px", overflow: "hidden", background: "#EDE3D2", height: previewHeight }}>
          <img src={value} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      )}

      <div style={{ display: "flex", gap: "8px" }}>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste an image URL…"
          style={{
            flex: 1,
            height: "40px",
            padding: "0 12px",
            fontSize: "13px",
            background: "rgba(245,239,224,.07)",
            border: "1px solid rgba(44,24,16,.16)",
            borderRadius: "8px",
            color: "#2C1810",
            boxSizing: "border-box",
          }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          style={{
            height: "40px",
            padding: "0 14px",
            background: "#2C1810",
            border: "none",
            borderRadius: "8px",
            color: "#F5EFE0",
            fontSize: "12px",
            fontWeight: 600,
            cursor: uploading ? "not-allowed" : "pointer",
            opacity: uploading ? 0.7 : 1,
            whiteSpace: "nowrap",
          }}
        >
          {uploading ? "Uploading…" : "Upload from device"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_IMAGE_TYPES.join(",")}
          onChange={handleFileSelect}
          style={{ display: "none" }}
        />
      </div>
      <div style={{ fontSize: "11px", color: "#9d8371", marginTop: "5px" }}>
        JPEG, PNG, WEBP or GIF · up to {MAX_IMAGE_SIZE_MB}MB
      </div>
    </div>
  );
}
