import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import CtaButton from "../components/CtaButton.jsx";
import HeroArt from "../components/HeroArt.jsx";
import useScrollReveal from "../hooks/useScrollReveal.js";
import { useAuth } from "../context/AuthContext.jsx";

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
                  Your friend in getting into your next job, <span className="hero-tagline-card__brand">Nexora</span>
                </h1>
                <p className="hero-tagline-card__ready">Ready?</p>
                <div className="hero-tagline-card__cta">
                  <CtaButton to={user ? dashboardLink : "/signup"} variant="glow">
                    {user ? "Go to Dashboard →" : "Get Started"}
                  </CtaButton>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Find Your Opportunity Yourself */}
        <section className="opportunity scroll-reveal" data-delay="80">
          <div>
            <div className="opportunity__head">
              <h2>Find Your Opportunity Yourself.</h2>
              <div className="opportunity__sub">we&apos;ll help</div>
            </div>

            <span className="entry-badge">
              <span className="entry-badge__ico">✓</span> Entry Level Friendly
            </span>

            <h3 className="opportunity__subhead">Easy Navigation</h3>

            <div className="mini-cards">
              <div className="mini-card mini-card--profil">
                <h4>Profil</h4>
                <div className="mini-card__avatar">A</div>
                <span className="bar bar--long" />
                <span className="bar bar--semi" />
                <span className="bar bar--long" />
              </div>
              <div className="mini-cards__stack">
                <div className="mini-card">
                  <h4>Pending Application</h4>
                  <div className="progress-track">
                    <div className="progress-track__fill" />
                  </div>
                  <span className="bar bar--short" />
                </div>
                <div className="mini-card">
                  <h4>Discover Jobs!</h4>
                  <div className="mini-card__disco-btn">Browse Internships →</div>
                </div>
              </div>
            </div>
          </div>

          {/* Logo Nexora di kanan */}
          <div className="opportunity__aside">
            <div className="opportunity__art">
              <HeroArt width={767} height={633} />
            </div>
          </div>
        </section>

        {/* Find Jobs That Fit You */}
        <section className="fit scroll-reveal" data-delay="120">
          {/* Mini preview Job Discovery (lebih kecil dari ukuran normal) di atas */}
          <div className="fit__preview">
            <div className="fit__preview-bar">
              <span className="fit__preview-search">
                <SearchIcon />
              </span>
              <span className="fit__preview-hint">Search jobs, companies, keywords…</span>
            </div>

            <div className="fit__preview-list">
              {previewJobs.map((job, i) => (
                <div className="fit__preview-job" key={i}>
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
                </div>
              ))}
            </div>
          </div>

          {/* How It Works di bawah + Join Now */}
          <div className="how-card">
            <span className="employer-banner__tag">FOR EMPLOYERS</span>
            <h2>Find Jobs That Fit You</h2>
            <p className="fit__sub">How it works</p>

            <ol className="how-card__steps">
              <li className="how-step">
                <span className="how-step__num">1</span>
                <div>
                  <strong>Create Your Profile</strong>
                  <span>Add your skills, education, and preferences to build your match profile.</span>
                </div>
              </li>
              <li className="how-step">
                <span className="how-step__num">2</span>
                <div>
                  <strong>Get Matched</strong>
                  <span>We match you with opportunities that truly fit.</span>
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
              {user ? "Open Dashboard →" : "Join Now"}
            </CtaButton>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
