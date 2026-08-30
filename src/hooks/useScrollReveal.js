import { useEffect, useRef } from "react";

export default function useScrollReveal(deps = []) {
  const ref = useRef(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const targets = root.querySelectorAll(".scroll-reveal");
    if (!targets.length) return;

    if (typeof IntersectionObserver === "undefined") {
      targets.forEach((t) => t.classList.add("revealed"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const delay = entry.target.getAttribute("data-delay");
            if (delay) entry.target.style.transitionDelay = `${delay}ms`;
            entry.target.classList.add("revealed");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "80px 0px" }
    );

    targets.forEach((t) => {
      if (!t.classList.contains("revealed")) io.observe(t);
    });
    return () => io.disconnect();
  }, deps);

  return ref;
}