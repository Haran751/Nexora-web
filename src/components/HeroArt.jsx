// Hero art — the Nexora logo (webp) optimized for instant LCP rendering
export default function HeroArt({ className = "", width = 460, height }) {
  return (
    <img
      src="/logo-nexora.webp"
      alt="Nexora Platform Hero Illustration"
      width={width || 767}
      height={height || 633}
      className={`hero-art ${className}`}
      fetchPriority="high"
      decoding="async"
      style={{
        display: "block",
        width: "100%",
        height: "auto",
        aspectRatio: "767 / 633",
      }}
    />
  );
}
