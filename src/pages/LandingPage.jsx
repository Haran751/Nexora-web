import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import CtaButton from "../components/CtaButton.jsx";
import HeroArt from "../components/HeroArt.jsx";
import useScrollReveal from "../hooks/useScrollReveal.js";
import { useAuth } from "../context/AuthContext.jsx";

const MatchSimulator = lazy(() => import("../components/MatchSimulator.jsx"));

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" strokeLinecap="round" />
  </svg>
);

const previewJobs = [
  { match: "96%", title: "Frontend Developer Intern", company: "Nexora Studio", tags: ["Jakarta", "Hybrid"] },
  { match: "88%", title: "UI/UX Designer Grad", company: "Brightmind Agency", tags: ["Bandung", "On-site"] },
  { match: "74%", title: "Data Analyst (Entry)", company: "CloudNine Analytics", tags: ["Remote"] },
];

export default function LandingPage() {
  const { user, role } = useAuth();
  const revealRef = useScrollReveal();
  const dashboardLink = role === "employer" ? "/employer" : "/home";

  return (
    <div className="page">
      <Navbar variant="landing" />
      <main className="page__body" ref={revealRef}>
        {/* Hero (topmost gradient band) */}
        <section className="landing-top">
          <div className="landing-hero">
            <div className="landing-hero__art">
              <HeroArt width={767} height={633} />
            </div>
            <div>
              <div className="hero-tagline-card">
                <h1 className="hero-tagline-card__title">
                  Launch your career with clarity and confidence, <span className="hero-tagline-card__brand">Nexora</span>
                </h1>
                <p className="hero-tagline-card__sub">
                  Find internships and entry-level roles matched to your actual skills and potential.
                </p>
                <div className="hero-tagline-card__cta">
                  <CtaButton to={user ? dashboardLink : "/signup"} variant="glow">
                    {user ? "Go to Dashboard →" : "Get Started — It's Free"}
                  </CtaButton>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Find Opportunities Matched to You */}
        <section className="opportunity scroll-reveal" data-delay="80">
          <div>
            <div className="opportunity__head">
              <h2>Find Opportunities Matched to You.</h2>
              <div className="opportunity__sub">we&apos;ll help you get there</div>
            </div>

            <span className="entry-badge">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ marginRight: 6 }}>
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Entry Level Friendly
            </span>

            <h3 className="opportunity__subhead">Intuitive Career Dashboard</h3>

            <div className="mini-cards">
              <div className="mini-card mini-card--profil">
                <h4>Profile</h4>
                <div className="mini-card__avatar">A</div>
                <span className="bar bar--long" />
                <span className="bar bar--semi" />
                <span className="bar bar--long" />
              </div>
              <div className="mini-cards__stack">
                <div className="mini-card">
                  <h4>Application Status</h4>
                  <div className="progress-track">
                    <div className="progress-track__fill" />
                  </div>
                  <span className="bar bar--short" />
                </div>
                <div className="mini-card">
                  <h4>Explore Open Roles</h4>
                  <Link to="/jobs" className="mini-card__disco-btn">Browse Internships →</Link>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Match Simulator */}
          <div className="opportunity__aside">
            <Suspense fallback={<div style={{ minHeight: 280 }} />}>
              <MatchSimulator />
            </Suspense>
          </div>
        </section>

        {/* Find Jobs That Fit You */}
        <section className="fit scroll-reveal" data-delay="120">
          {/* Mini preview Job Discovery */}
          <div className="fit__preview">
            <Link to="/jobs" className="fit__preview-bar" style={{ textDecoration: "none", color: "inherit", display: "flex" }}>
              <span className="fit__preview-search">
                <SearchIcon />
              </span>
              <span className="fit__preview-hint">Search jobs, companies, keywords…</span>
            </Link>

            {/* Quick-filter tags */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", margin: "10px 0 14px" }}>
              {[
                { label: "Remote", to: "/jobs" },
                { label: "Paid Internship", to: "/jobs" },
                { label: "Entry Level", to: "/jobs" },
                { label: "Design", to: "/jobs" },
              ].map((pill) => (
                <Link
                  key={pill.label}
                  to={pill.to}
                  style={{
                    fontSize: "0.75rem",
                    padding: "4px 10px",
                    borderRadius: 999,
                    background: "rgba(255, 255, 255, 0.12)",
                    color: "rgba(255, 255, 255, 0.9)",
                    textDecoration: "none",
                    border: "1px solid rgba(255, 255, 255, 0.18)",
                    transition: "all 0.15s ease",
                  }}
                  className="quick-filter-pill"
                >
                  {pill.label}
                </Link>
              ))}
            </div>

            <div className="fit__preview-list">
              {previewJobs.map((job, i) => (
                <Link to="/jobs" className="fit__preview-job" key={i} style={{ textDecoration: "none", color: "inherit" }}>
                  <div className="fit__preview-job__top">
                    <span className="fit__preview-match">{job.match}</span>
                    <div>
                      <strong className="fit__preview-title">{job.title}</strong>
                      <span className="fit__preview-company">{job.company}</span>
                    </div>
                  </div>
                  <div className="fit__preview-tags">
                    {job.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* How It Works for candidates + Join Now */}
          <div className="how-card">
            <h2>Find Jobs That Fit You</h2>
            <p className="fit__sub">How it works for job seekers</p>

            <ol className="how-card__steps">
              <li className="how-step">
                <span className="how-step__num">1</span>
                <div>
                  <strong>Create Your Profile</strong>
                  <span>Add your skills, education, and interests to build your match profile.</span>
                </div>
              </li>
              <li className="how-step">
                <span className="how-step__num">2</span>
                <div>
                  <strong>Get Matched</strong>
                  <span>We match you with entry-level opportunities that genuinely fit.</span>
                </div>
              </li>
              <li className="how-step">
                <span className="how-step__num">3</span>
                <div>
                  <strong>Easy Apply</strong>
                  <span>Apply in just a few clicks, right from your dashboard.</span>
                </div>
              </li>
            </ol>

            <CtaButton to={user ? dashboardLink : "/signup"} variant="pink">
              {user ? "Open Dashboard →" : "Join Now — It's Free"}
            </CtaButton>

            <p className="how-card__employer-link">
              Looking to hire?{" "}
              <Link to="/signup">Post entry-level roles as an employer →</Link>
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
