// 4-point star star path fragment used inside SVG decorations.
export const STAR_PATH =
  "M12 2c.9 4.6 2.4 6.5 10 10-7.6 3.5-9.1 5.4-10 10-.9-4.6-2.4-6.5-10-10 7.6-3.5 9.1-5.4 10-10z";

// Standalone star icon component.
export default function Star({ size = 18, color = "#E8A060", className = "", style }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={`hero-art__star ${className}`}
      style={style}
      aria-hidden="true"
    >
      <path d={STAR_PATH} fill={color} />
    </svg>
  );
}
