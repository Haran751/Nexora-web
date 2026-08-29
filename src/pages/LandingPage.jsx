import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import CtaButton from "../components/CtaButton.jsx";
import HeroArt from "../components/HeroArt.jsx";
import useScrollReveal from "../hooks/useScrollReveal.js";
import { useAuth } from "../context/AuthContext.jsx";

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

          <div className="opportunity__aside">
            <div className="feature-pill">
              <strong>Personalized Match Score</strong>
              <p>See how closely your skills match every role before applying.</p>
            </div>
            <div className="feature-pill">
              <strong>Application Status Tracker</strong>
              <p>Track every step from submission to interview in one place.</p>
            </div>
            <div className="feature-pill">
              <strong>Built-In CV Builder</strong>
              <p>Generate a clean, print-ready resume from your profile in seconds.</p>
            </div>
          </div>
        </section>

        {/* For Employers */}
        <section className="employer-banner scroll-reveal" data-delay="120">
          <div className="employer-banner__body">
            <div>
              <span className="employer-banner__tag">FOR EMPLOYERS</span>
              <h2>Find Great Talent, Faster.</h2>
              <p>Post vacancies, filter candidate matches, and manage applications in a streamlined dashboard.</p>
              <CtaButton to={user ? (role === "employer" ? "/employer" : "/home") : "/signup"} variant="dark">
                {user && role === "employer" ? "Go to Employer Hub →" : "Start Hiring →"}
              </CtaButton>
            </div>
            <div className="employer-banner__art">
              <img src="/for-employer.png" alt="For Employers preview" width="251" height="175" loading="lazy" decoding="async" />
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="how-it-works scroll-reveal" data-delay="160">
          <div className="how-it-works__card">
            <h2>How It Works</h2>
            <div className="how-it-works__content">
              <ol className="how-steps">
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
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
