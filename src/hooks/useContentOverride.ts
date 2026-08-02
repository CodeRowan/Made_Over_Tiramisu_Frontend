import { useEffect } from "react";

/**
 * Merges a live draft-content override (sent by the admin panel's preview
 * iframe via postMessage) on top of already-fetched content. No-op when no
 * override is provided, so components behave identically on the real site.
 */
export function useContentOverride<T extends Record<string, any>>(
  setContent: (updater: (prev: T) => T) => void,
  override?: Partial<T> | null
) {
  useEffect(() => {
    if (!override) return;
    // Skip empty-string fields — an untouched draft field means "hasn't been
    // typed yet", not "clear this on the site", so keep the fetched/default value.
    const patch = Object.fromEntries(
      Object.entries(override).filter(([, v]) => v !== "" && v !== undefined)
    );
    if (Object.keys(patch).length > 0) {
      setContent((prev) => ({ ...prev, ...patch }));
    }
  }, [override]);
}
