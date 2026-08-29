// Hero art — the Nexora logo (webp) as the single decorative element.
// All other elements (mountains, clouds, stars) removed per design direction.
export default function HeroArt({ className = "", width = 460, height }) {
  return (
    <svg
      viewBox="0 0 767 633"
      width={width}
      height={height}
      className={`hero-art ${className}`}
      aria-hidden="true"
    >
      <image
        href="/logo-nexora.webp"
        x="0"
        y="0"
        width="767"
        height="633"
        preserveAspectRatio="xMidYMid meet"
        style={{ display: "block" }}
      />
    </svg>
  );
}
