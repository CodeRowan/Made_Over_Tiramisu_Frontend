import { useState, useEffect } from "react";

/**
 * Tracks whether the viewport is at or below a phone-sized breakpoint.
 * Used to switch admin pages between their side-by-side desktop layout and
 * a stacked mobile one — the admin panel is otherwise built entirely with
 * inline styles, so there's no CSS media query to hook into.
 */
export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth <= breakpoint
  );

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const handler = () => setIsMobile(mq.matches);
    handler();
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [breakpoint]);

  return isMobile;
}
