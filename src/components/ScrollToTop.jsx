import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTop component
 * Listens to route changes across the entire app and smoothly scrolls the viewport to top.
 * Respects user's prefers-reduced-motion OS accessibility settings.
 */
export default function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: prefersReduced ? "auto" : "smooth",
    });
  }, [pathname, search]);

  return null;
}
