import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import NotificationPanel from "./NotificationPanel.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { fetchSavedJobIds } from "../services/savedJobsService.js";

const BellIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M5 18h14l-1.5-2a2 2 0 0 1-.5-1.5V10a6 6 0 0 0-12 0v4.5A2 2 0 0 1 3.5 16H5z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </svg>
);

const UNREAD_COUNT = 3;

export default function Navbar({ variant = "app", onEmployerView }) {
  const navigate = useNavigate();
  const { user, profile, role, signOut } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) closeMenu();
    };
    const onKey = (e) => {
      if (e.key === "Escape") closeMenu();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    let active = true;
    async function loadSavedCount() {
      const set = await fetchSavedJobIds(user?.id);
      if (active) setSavedCount(set.size);
    }
    loadSavedCount();
    return () => {
      active = false;
    };
  }, [user?.id]);

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const appLinks = (
    <>
      <NavLink to="/jobs" className="navbar__link">
        Jobs
      </NavLink>
      <NavLink to="/applications" className="navbar__link">
        Applications
      </NavLink>
      <NavLink to="/saved" className="navbar__link navbar__link--saved">
        Saved{savedCount > 0 && <span className="navbar__badge">{savedCount}</span>}
      </NavLink>
      {role === "employer" && (
        <NavLink to="/employer" className="navbar__link" style={{ color: "var(--accent-orange)" }}>
          Employer Hub
        </NavLink>
      )}
    </>
  );

  const landingLinks = (
    <>
      <NavLink to="/jobs" className="navbar__link">
        Find Jobs
      </NavLink>
      {user ? (
        <>
          <NavLink to="/applications" className="navbar__link">
            Applications
          </NavLink>
          <NavLink
            to={role === "employer" ? "/employer" : "/home"}
            className="navbar__link"
            style={{ color: "var(--accent-orange)", fontWeight: 600 }}
          >
            Dashboard
          </NavLink>
        </>
      ) : (
        <>
          <NavLink to="/login" className="navbar__link">
            Login
          </NavLink>
          <NavLink to="/signup" className="navbar__link">
            Sign Up
          </NavLink>
        </>
      )}
    </>
  );

  const employerLinks = (
    <>
      {["Dashboard", "My Jobs", "Candidates"].map((v) => (
        <button
          key={v}
          className="navbar__link navbar__link--btn"
          onClick={() => onEmployerView && onEmployerView(v)}
        >
          {v}
        </button>
      ))}
      <NavLink to="/jobs" className="navbar__link" style={{ marginLeft: 12 }}>
        Browse Jobs
      </NavLink>
    </>
  );

  const centerLinks =
    variant === "landing" ? landingLinks : variant === "employer" ? employerLinks : appLinks;

  const displayName = profile?.companyName || profile?.name || user?.email?.split("@")[0] || "User";
  const avatarChar = (displayName || "U").trim().charAt(0).toUpperCase();

  return (
    <header className={`navbar${variant === "landing" ? " navbar--landing" : ""}${scrolled ? " navbar--scrolled" : ""}`}>
      <Link to={user ? (role === "employer" ? "/employer" : "/home") : "/"} className="navbar__brand">
        <img className="navbar__logo" src="/logo-nexora.webp" alt="Nexora logo" width="38" height="38" fetchpriority="high" />
        Nexora
      </Link>

      <div className="navbar__links-wrap">
        <nav className="navbar__links">{centerLinks}</nav>
      </div>

      <button
        className={`navbar__burger${menuOpen ? " navbar__burger--open" : ""}`}
        aria-label="Menu"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((o) => !o)}
      >
        <span />
        <span />
        <span />
      </button>

      <div className={`navbar__drawer${menuOpen ? " navbar__drawer--open" : ""}`} ref={menuRef}>
        <button
          className="navbar__drawer-close"
          aria-label="Close menu"
          onClick={closeMenu}
        >
          ✕
        </button>
        {user && (
          <Link to="/profile" className="navbar__drawer-user" onClick={closeMenu}>
            <span className="navbar__avatar">
              {profile?.avatarUrl ? (
                <img src={profile.avatarUrl} alt={displayName} className="navbar__avatar-img" />
              ) : (
                avatarChar
              )}
            </span>
            <strong>{displayName}</strong>
          </Link>
        )}
        <nav className="navbar__drawer-links">
          {user ? (
            role === "employer" ? (
              <>
                <button
                  onClick={() => {
                    closeMenu();
                    navigate("/employer");
                  }}
                  className="navbar__drawer-link navbar__drawer-link--accent"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => {
                    closeMenu();
                    navigate("/employer");
                  }}
                  className="navbar__drawer-link"
                >
                  My Jobs
                </button>
                <button
                  onClick={() => {
                    closeMenu();
                    navigate("/employer");
                  }}
                  className="navbar__drawer-link"
                >
                  Candidates
                </button>
                <NavLink to="/jobs" className="navbar__drawer-link" onClick={closeMenu}>
                  Browse Jobs
                </NavLink>
                <button
                  onClick={() => {
                    closeMenu();
                    handleLogout();
                  }}
                  className="navbar__drawer-link navbar__drawer-link--exit"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <NavLink to="/jobs" className="navbar__drawer-link" onClick={closeMenu}>
                  Jobs
                </NavLink>
                <NavLink to="/applications" className="navbar__drawer-link" onClick={closeMenu}>
                  Applications
                </NavLink>
                <NavLink to="/saved" className="navbar__drawer-link" onClick={closeMenu}>
                  Saved ({savedCount})
                </NavLink>
                <NavLink
                  to="/home"
                  className="navbar__drawer-link navbar__drawer-link--accent"
                  onClick={closeMenu}
                >
                  Dashboard
                </NavLink>
                <button
                  onClick={() => {
                    closeMenu();
                    handleLogout();
                  }}
                  className="navbar__drawer-link navbar__drawer-link--exit"
                >
                  Log Out
                </button>
              </>
            )
          ) : (
            <>
              <NavLink to="/jobs" className="navbar__drawer-link" onClick={closeMenu}>
                Find Jobs
              </NavLink>
              <NavLink to="/signup" className="navbar__drawer-link" onClick={closeMenu}>
                For Employers
              </NavLink>
              <Link to="/login" className="cta-btn cta-btn--orange navbar__drawer-cta" onClick={closeMenu}>
                Login
              </Link>
              <Link to="/signup" className="cta-btn cta-btn--pink navbar__drawer-cta" onClick={closeMenu}>
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </div>

      {(variant !== "landing" || user) && (
        <div className="navbar__right">
          {variant !== "employer" && (
            <div className="navbar__bell-wrap">
              <button
                className="navbar__bell"
                aria-label="Notifications"
                aria-expanded={notifOpen}
                onClick={() => setNotifOpen((o) => !o)}
              >
                <BellIcon />
                <span className="navbar__bell-badge">{UNREAD_COUNT}</span>
              </button>
              <NotificationPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
            </div>
          )}

          <div className="navbar__step">
            {Array.from({ length: 4 }).map((_, i) => (
              <i key={i} />
            ))}
          </div>

          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Link to="/profile" className="navbar__user">
                <span className="navbar__avatar">
                  {profile?.avatarUrl ? (
                    <img src={profile.avatarUrl} alt={displayName} className="navbar__avatar-img" />
                  ) : (
                    avatarChar
                  )}
                </span>
                <span style={{ maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {displayName}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                className="navbar__link navbar__link--btn"
                title="Log Out"
                style={{ opacity: 0.8, fontSize: "0.85rem", padding: "4px 8px" }}
              >
                Exit
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Link to="/login" className="navbar__link">
                Login
              </Link>
              <Link to="/signup" className="cta-btn cta-btn--orange" style={{ padding: "6px 14px", fontSize: "0.85rem" }}>
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}