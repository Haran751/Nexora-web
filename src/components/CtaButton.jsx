import { Link } from "react-router-dom";

export function PlayIcon() {
  return null;
}

const isInternal = (to) => typeof to === "string" && to.startsWith("/");

export default function CtaButton({ children, variant = "pink", to, className, icon, ...rest }) {
  const cls = `cta-btn cta-btn--${variant} ${className || ""}`;
  const isDangerous = typeof to === "string" && /^(javascript|data|vbscript):/i.test(to.trim());

  if (to && !isDangerous && isInternal(to)) {
    return (
      <Link to={to} className={cls} {...rest}>
        {icon && <span className="cta-btn__icon">{icon}</span>}
        {children}
      </Link>
    );
  }

  if (to) {
    const safeHref = isDangerous ? "#" : to;
    return (
      <a href={safeHref} className={cls} {...rest}>
        {icon && <span className="cta-btn__icon">{icon}</span>}
        {children}
      </a>
    );
  }

  return (
    <button className={cls} {...rest}>
      {icon && <span className="cta-btn__icon">{icon}</span>}
      {children}
    </button>
  );
}
