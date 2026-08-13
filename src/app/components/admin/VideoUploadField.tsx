import { useRef, useState } from "react";
import axios from "axios";
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
 * from the device.
 *
 * Videos are uploaded DIRECTLY from the browser to Cloudinary using an unsigned
 * upload preset (created by the backend). Routing the video through the backend
 * would fail on Vercel, whose serverless functions reject request bodies over
 * ~4.5MB with "payload too large" — long before the file ever reaches Cloudinary.
 * Direct upload keeps the original quality and supports files up to 100MB.
 */
export function VideoUploadField({ value, onChange, error }: VideoUploadFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
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
      setProgress(0);

      // Get the unsigned preset config the backend created for direct uploads
      const { data: config } = await uploadAPI.getVideoUploadConfig();

      // Upload straight to Cloudinary — the backend never sees the file bytes,
      // so Vercel's serverless request-body limit doesn't apply.
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", config.presetName);

      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${config.cloudName}/video/upload`,
        formData,
        {
          onUploadProgress: (event) => {
            if (event.total) {
              setProgress(Math.round((event.loaded / event.total) * 100));
            }
          },
        }
      );

      const result = response.data;
      const videoUrl = result.secure_url;
      // Cloudinary auto-extracts a JPG thumbnail from the video's first frame
      const thumbnailUrl = `https://res.cloudinary.com/${config.cloudName}/video/upload/${result.public_id}.jpg`;

      onChange(videoUrl, thumbnailUrl);
      toast.success("Video uploaded to Cloudinary successfully!");

      // Keep the admin audit trail in sync (the upload itself happens outside
      // the backend, so log it explicitly). Never fail the UX on a log error.
      uploadAPI
        .logVideoUpload({
          videoUrl,
          publicId: result.public_id,
          fileName: file.name,
          size: file.size,
        })
        .catch(() => {});
    } catch (err: any) {
      const message =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        "Video upload failed";
      toast.error(message);
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
          {uploading ? `Uploading video… ${progress}%` : "Upload video from device"}
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
        {error ? error : `MP4, WebM, MOV, OGG · up to ${MAX_VIDEO_SIZE_MB}MB`}
      </div>
    </div>
  );
}
