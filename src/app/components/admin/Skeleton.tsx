interface SkeletonBlockProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  style?: React.CSSProperties;
}

/**
 * Loading placeholder used across the admin panel while a list/page's
 * initial API call is in flight — keeps "still loading" visually distinct
 * from "loaded and empty".
 */
export function SkeletonBlock({ width = "100%", height = 16, borderRadius = 6, style }: SkeletonBlockProps) {
  return (
    <div
      className="animate-pulse"
      style={{
        width,
        height,
        borderRadius,
        background: "#EDE3D2",
        ...style,
      }}
    />
  );
}

export function SkeletonCard({ imageHeight = 170 }: { imageHeight?: number }) {
  return (
    <div style={{ background: "#FFFDF8", borderRadius: "12px", overflow: "hidden", boxShadow: "0 1px 3px rgba(44,24,16,.1)" }}>
      <SkeletonBlock height={imageHeight} borderRadius={0} />
      <div style={{ padding: "18px", display: "flex", flexDirection: "column", gap: "10px" }}>
        <SkeletonBlock width="40%" height={11} />
        <SkeletonBlock width="70%" height={18} />
        <SkeletonBlock width="100%" height={13} />
        <SkeletonBlock width="90%" height={13} />
      </div>
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div style={{ background: "#FFFDF8", borderRadius: "10px", padding: "16px 18px", display: "flex", alignItems: "center", gap: "16px" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
        <SkeletonBlock width="30%" height={13} />
        <SkeletonBlock width="80%" height={12} />
      </div>
      <SkeletonBlock width={70} height={28} borderRadius={6} />
    </div>
  );
}
