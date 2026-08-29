import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import CtaButton from "../components/CtaButton.jsx";
import HeroArt from "../components/HeroArt.jsx";
import useScrollReveal from "../hooks/useScrollReveal.js";

export default function LandingPage() {
  const revealRef = useScrollReveal();
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
                  <CtaButton to="/signup" variant="glow">
                    Get Started
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
                  <span className="bar bar--semi" />
                </div>
                <div className="mini-card orange-bars">
                  <h4>Discover Jobs!</h4>
                  <span className="bar bar--long" />
                  <span className="bar bar--long" />
                </div>
              </div>
            </div>
          </div>

          <div className="opportunity__art">
            <HeroArt width={767} height={633} />
          </div>
        </section>

        {/* Find Jobs That Fit You */}
        <section className="fit scroll-reveal" data-delay="100">
          <div className="fit__preview">
            <div className="fit__preview-bar">
              <img src="/logo-nexora.webp" alt="" style={{ width: 24, height: 24 }} />
              <span className="bar bar--long" style={{ background: "rgba(255,255,255,.4)" }} />
            </div>
            <div className="fit__preview-job">
              <strong>24 Jobs Found</strong>
              <span className="bar bar--long" style={{ background: "rgba(255,255,255,.4)", marginTop: 8 }} />
            </div>
            <div className="fit__preview-job">
              <strong>Internship</strong>
              <span className="bar bar--semi" style={{ background: "rgba(255,255,255,.4)", marginTop: 8 }} />
            </div>
            <div className="fit__preview-job">
              <strong>Entry Level</strong>
              <span className="bar bar--long" style={{ background: "rgba(255,255,255,.4)", marginTop: 8 }} />
            </div>
          </div>

          <div>
            <div className="card how-card" style={{ background: "transparent", boxShadow: "none", color: "var(--text-body)", padding: 0 }}>
              <h2>Find Jobs That Fit You</h2>
              <ol className="how-card__steps">
                <li className="how-step">
                  <span className="how-step__num">1</span>
                  <div>
                    <strong>Create Profile</strong>
                    <span>Build your profile and tell us what you are looking for.</span>
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
              <CtaButton to="/signup" variant="pink">
                Join Now
              </CtaButton>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
