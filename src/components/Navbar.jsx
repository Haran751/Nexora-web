import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import NotificationPanel from "./NotificationPanel.jsx";
import { jdJobs } from "../lib/jobsData.js";
import { loadSavedJobs } from "../lib/savedJobs.js";

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
  const [scrolled, setScrolled] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const savedCount = jdJobs.filter((j) => loadSavedJobs().has(String(j.id))).length;

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
    </>
  );

  const landingLinks = (
    <>
      <NavLink to="/jobs" className="navbar__link">
        Find Jobs
      </NavLink>
      <Link to="/welcome" className="navbar__link">
        How it Works
      </Link>
      <NavLink to="/signup" className="navbar__link">
        For Employers
      </NavLink>
      <NavLink to="/login" className="navbar__link">
        Login
      </NavLink>
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
    </>
  );

  const centerLinks =
    variant === "landing" ? landingLinks : variant === "employer" ? employerLinks : appLinks;

  return (
    <header className={`navbar${variant === "landing" ? " navbar--landing" : ""}${scrolled ? " navbar--scrolled" : ""}`}>
      <Link to="/" className="navbar__brand">
        <img className="navbar__logo" src="/logo-nexora.webp" alt="Nexora logo" />
        Nexora
      </Link>

      <div className="navbar__links-wrap">
        <nav className="navbar__links">{centerLinks}</nav>
      </div>

      {variant !== "landing" && (
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
          <Link to="/profile" className="navbar__user">
            <span className="navbar__avatar">A</span>
            User
          </Link>
        </div>
      )}
    </header>
  );
}