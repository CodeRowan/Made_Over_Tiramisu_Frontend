import { useRef, useState } from "react";
import { toast } from "../ui/CommonToaster";
import { uploadAPI } from "../../../services/api";
import { MAX_VIDEO_SIZE_MB, ALLOWED_VIDEO_TYPES } from "../../../constants/fieldLimits";

interface VideoUploadFieldProps {
  value: string;
  onChange: (videoUrl: string, thumbnailUrl?: string) => void;
  error?: string;
}

/**
 * Video field for admin forms: paste a video URL directly, or upload a video file
 * from the device — which uploads to Cloudinary via the backend and returns
 * the Cloudinary video URL along with an auto-generated thumbnail URL.
 */
export function VideoUploadField({ value, onChange, error }: VideoUploadFieldProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
      toast.error("Please choose a supported video format (MP4, WebM, MOV, OGG)");
      e.target.value = "";
      return;
    }
    if (file.size > MAX_VIDEO_SIZE_MB * 1024 * 1024) {
      toast.error(`Video must be ${MAX_VIDEO_SIZE_MB}MB or smaller`);
      e.target.value = "";
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      const response = await uploadAPI.uploadImage(formData);
      const videoUrl = response.data.videoUrl || response.data.imageUrl;
      const thumbnailUrl = response.data.thumbnailUrl;
      onChange(videoUrl, thumbnailUrl);
      toast.success("Video uploaded to Cloudinary successfully!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Video upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div>
      {value && (
        <div style={{ marginBottom: "8px", borderRadius: "8px", overflow: "hidden", background: "#000", maxHeight: "200px" }}>
          <video src={value} controls style={{ width: "100%", maxHeight: "200px", objectFit: "contain" }} />
        </div>
      )}

      <div style={{ display: "flex", gap: "8px" }}>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste a video URL or upload from device..."
          style={{
            flex: 1,
            height: "40px",
            padding: "0 12px",
            fontSize: "13px",
            background: error ? "rgba(239,68,68,.05)" : "rgba(245,239,224,.07)",
            border: error ? "1.5px solid #EF4444" : "1.8px solid rgba(44,24,16,.2)",
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
          {uploading ? "Uploading video..." : "Upload video from device"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_VIDEO_TYPES.join(",")}
          onChange={handleFileSelect}
          style={{ display: "none" }}
        />
      </div>
      <div style={{ fontSize: "11px", color: error ? "#EF4444" : "#9d8371", marginTop: "5px", fontWeight: error ? 600 : 400 }}>
        {error ? error : `MP4, WebM, MOV, OGG · up to ${MAX_VIDEO_SIZE_MB}MB (Saved to Cloudinary)`}
      </div>
    </div>
  );
}
