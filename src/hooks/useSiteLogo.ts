import { useState, useEffect } from "react";
import { publicAPI } from "../services/api";
import logoImg from "../imports/logo.png";
import { useContentOverride } from "./useContentOverride";

const DEFAULTS = { image: logoImg };

/**
 * Site-wide logo, backed by the "general" content section. Falls back to the
 * bundled default until (or unless) an admin uploads a custom one. Pass the
 * preview iframe's draft override only from the one component the Branding
 * section actually previews (Header) — other components render the logo but
 * aren't what that section's live preview shows.
 */
export function useSiteLogo(previewOverride?: Partial<typeof DEFAULTS> | null) {
  const [logo, setLogo] = useState(DEFAULTS);

  useEffect(() => {
    publicAPI
      .getContentSection("general")
      .then((res) => {
        const c = res.data.content;
        if (c?.image) setLogo({ image: c.image });
      })
      .catch(() => {
        // Fall back to the bundled default if content isn't configured yet
      });
  }, []);

  useContentOverride(setLogo, previewOverride);

  return logo.image;
}
