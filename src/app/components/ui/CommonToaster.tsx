import React from "react";
import { Toaster as Sonner, toast as sonnerToast, ExternalToast } from "sonner";
import { AlertCircle, CheckCircle2, Info, AlertTriangle, ShieldAlert, X } from "lucide-react";

export interface CommonToasterProps {
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "top-center" | "bottom-center";
  theme?: "light" | "dark" | "system";
}

/**
 * Common Toaster Component
 * Reusable toast notification container for the entire application.
 */
export function CommonToaster({
  position = "top-right",
  theme = "dark"
}: CommonToasterProps) {
  return (
    <Sonner
      position={position}
      theme={theme}
      closeButton
      richColors={false}
      expand={true}
      duration={4000}
      className="made-over-tiramisu-toaster"
      toastOptions={{
        style: {
          background: "#1A0D06",
          color: "#F5EFE0",
          border: "1px solid rgba(201, 168, 124, 0.25)",
          borderRadius: "12px",
          padding: "14px 16px",
          boxShadow: "0 20px 30px -10px rgba(0, 0, 0, 0.5), 0 0 15px rgba(192, 99, 58, 0.15)",
          fontFamily: "'Lato', sans-serif",
          fontSize: "14px",
        },
        className: "tiramisu-toast",
      }}
    />
  );
}

/**
 * Common Toast API
 * Wrapper around sonner toast with custom styling, authentication error handling,
 * and convenient helper methods accessible anywhere in the application.
 */
export const toast = {
  // Standard Sonner passthrough
  ...sonnerToast,

  /**
   * Display a success toast
   */
  success: (message: string, description?: string, options?: ExternalToast) => {
    return sonnerToast.success(message, {
      description,
      icon: <CheckCircle2 style={{ color: "#22c55e", width: "20px", height: "20px", flexShrink: 0 }} />,
      style: {
        background: "#121A13",
        border: "1px solid rgba(34, 197, 94, 0.3)",
        color: "#F5EFE0",
      },
      ...options,
    });
  },

  /**
   * Display a standard error toast
   */
  error: (message: string, description?: string | ExternalToast, options?: ExternalToast) => {
    const desc = typeof description === "string" ? description : undefined;
    const opts = typeof description === "object" ? description : options;

    return sonnerToast.error(message, {
      description: desc,
      icon: <AlertCircle style={{ color: "#EF4444", width: "20px", height: "20px", flexShrink: 0 }} />,
      style: {
        background: "#1F1011",
        border: "1px solid rgba(239, 68, 68, 0.35)",
        color: "#F5EFE0",
      },
      ...opts,
    });
  },

  /**
   * Display a specialized Authentication Error Toast
   * Designed specifically for login failures, permission errors, and unauthorized access attempts.
   */
  authError: (title: string = "Authentication Failed", description: string = "Unable to authenticate user. Please check your credentials.", options?: ExternalToast) => {
    return sonnerToast.custom(
      (id) => (
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "12px",
            background: "linear-gradient(135deg, #2A0F12 0%, #1A0D06 100%)",
            border: "1.5px solid #DC2626",
            borderRadius: "12px",
            padding: "14px 16px",
            color: "#F5EFE0",
            width: "100%",
            boxShadow: "0 10px 25px rgba(220, 38, 38, 0.25), 0 0 15px rgba(220, 38, 38, 0.15)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Accent indicator bar */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              bottom: 0,
              width: "4px",
              background: "#EF4444",
            }}
          />

          <div
            style={{
              background: "rgba(239, 68, 68, 0.15)",
              padding: "8px",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#F87171",
              flexShrink: 0,
            }}
          >
            <ShieldAlert size={22} />
          </div>

          <div style={{ flex: 1, minWidth: 0, paddingRight: "16px" }}>
            <div
              style={{
                fontSize: "14px",
                fontWeight: "700",
                color: "#FCA5A5",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "4px",
                letterSpacing: "0.01em",
              }}
            >
              <span>{title}</span>
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  background: "rgba(220, 38, 38, 0.25)",
                  color: "#FCA5A5",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                }}
              >
                Auth Error
              </span>
            </div>
            <div
              style={{
                fontSize: "13px",
                color: "rgba(245, 239, 224, 0.85)",
                lineHeight: "1.4",
                wordBreak: "break-word",
              }}
            >
              {description}
            </div>
          </div>

          <button
            onClick={() => sonnerToast.dismiss(id)}
            style={{
              background: "transparent",
              border: "none",
              color: "rgba(245, 239, 224, 0.5)",
              cursor: "pointer",
              padding: "4px",
              borderRadius: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "color 0.2s",
            }}
            onMouseOver={(e) => ((e.currentTarget as HTMLElement).style.color = "#F5EFE0")}
            onMouseOut={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(245, 239, 224, 0.5)")}
            aria-label="Close notification"
          >
            <X size={16} />
          </button>
        </div>
      ),
      {
        duration: 5000,
        ...options,
      }
    );
  },

  /**
   * Display a warning toast
   */
  warning: (message: string, description?: string, options?: ExternalToast) => {
    return sonnerToast.warning(message, {
      description,
      icon: <AlertTriangle style={{ color: "#F59E0B", width: "20px", height: "20px", flexShrink: 0 }} />,
      style: {
        background: "#1E1A11",
        border: "1px solid rgba(245, 158, 11, 0.35)",
        color: "#F5EFE0",
      },
      ...options,
    });
  },

  /**
   * Display an info toast
   */
  info: (message: string, description?: string, options?: ExternalToast) => {
    return sonnerToast.info(message, {
      description,
      icon: <Info style={{ color: "#3B82F6", width: "20px", height: "20px", flexShrink: 0 }} />,
      style: {
        background: "#111827",
        border: "1px solid rgba(59, 130, 246, 0.35)",
        color: "#F5EFE0",
      },
      ...options,
    });
  },
};

export default CommonToaster;
