import { Link } from "react-router-dom";

export function PlayIcon() {
  return <span className="cta-btn__play" aria-hidden="true" />;
}

export default function CtaButton({
  children,
  variant = "orange",
  to,
  className,
  showPlayIcon = false,
  ...rest
}) {
  const cls = `cta-btn cta-btn--${variant} ${className || ""}`;

  if (to) {
    const isInternal = to.startsWith("/") || to.startsWith("#");
    if (isInternal) {
      return (
        <Link to={to} className={cls} {...rest}>
          {showPlayIcon && <PlayIcon />}
          {children}
        </Link>
      );
    }
    return (
      <a href={to} className={cls} {...rest}>
        {showPlayIcon && <PlayIcon />}
        {children}
      </a>
    );
  }

  return (
    <button className={cls} {...rest}>
      {showPlayIcon && <PlayIcon />}
      {children}
    </button>
  );
}
