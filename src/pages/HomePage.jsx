import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import useScrollReveal from "../hooks/useScrollReveal.js";

const ClockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" strokeLinecap="round" />
  </svg>
);

export default function HomePage() {
  const revealRef = useScrollReveal();
  return (
    <div className="page">
      <Navbar />
      <main className="page__body" ref={revealRef}>
        <p className="dash__sub">Welcome back, User. Find your next opportunity yourself.</p>
        <div className="dash">
          {/* Left — Profil */}
          <div className="card profil-card scroll-reveal" data-delay="60">
            <h3>Profil</h3>
            <div className="profil-card__head">
              <div className="profil-card__avatar">A</div>
              <div className="profil-card__lines">
                <span className="bar bar--semi" />
                <span className="bar bar--short" />
              </div>
            </div>
            <div className="profil-card__rows">
              <div className="info-row">
                <span className="info-row__label">Bio</span>
                <span className="bar" />
              </div>
              <div className="info-row">
                <span className="info-row__label">Skills</span>
                <span className="bar" />
              </div>
              <div className="info-row">
                <span className="info-row__label">Location</span>
                <span className="bar" />
              </div>
              <div className="info-row">
                <span className="info-row__label">Experience</span>
                <span className="bar" />
              </div>
            </div>
            <Link to="/profile" className="view-job" style={{ color: "var(--accent-orange)", display: "inline-block", marginTop: 18 }}>
              View full profile
            </Link>
          </div>

          {/* Right — two cards */}
          <div className="dash__stack scroll-reveal" data-delay="140">
            <div className="card">
              <div className="pending-head">
                <span className="clock">
                  <ClockIcon />
                </span>
                <h3>Pending Application</h3>
              </div>
              <div className="progress-track">
                <div className="progress-track__fill" />
              </div>
              <div className="pending-meta">
                <span>Processing your application…</span>
                <span>62%</span>
              </div>
            </div>

            <div className="card card--alt">
              <h3>Discover Jobs!</h3>
              <Link to="/jobs" className="disco-bar">
                Browse Internships →
              </Link>
              <Link to="/jobs" className="disco-bar" style={{ background: "var(--accent-orange-dark)" }}>
                Browse Entry Level →
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
