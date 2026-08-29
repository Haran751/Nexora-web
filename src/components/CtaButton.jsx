import { Link } from "react-router-dom";

export function PlayIcon() {
  return <span className="cta-btn__play" aria-hidden="true" />;
}

const isInternal = (to) => typeof to === "string" && to.startsWith("/");

export default function CtaButton({ children, variant = "pink", to, className, ...rest }) {
  const cls = `cta-btn cta-btn--${variant} ${className || ""}`;
  const isDangerous = typeof to === "string" && /^(javascript|data|vbscript):/i.test(to.trim());

  if (to && !isDangerous && isInternal(to)) {
    return (
      <Link to={to} className={cls} {...rest}>
        <PlayIcon />
        {children}
      </Link>
    );
  }

  if (to) {
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
