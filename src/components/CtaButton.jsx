export function PlayIcon() {
  return <span className="cta-btn__play" aria-hidden="true" />;
}

export default function CtaButton({ children, variant = "pink", to, className, ...rest }) {
  const cls = `cta-btn cta-btn--${variant} ${className || ""}`;
  if (to) {
    const isDangerous = typeof to === "string" && /^(javascript|data|vbscript):/i.test(to.trim());
    const safeHref = isDangerous ? "#" : to;
    return (
      <a href={safeHref} className={cls} {...rest}>
        <PlayIcon />
        {children}
      </a>
    );
  }
  return (
    <button className={cls} {...rest}>
      <PlayIcon />
      {children}
    </button>
  );
}
