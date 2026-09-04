import { Link } from "react-router-dom";
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
        {/* Section 1: Asymmetric Split Hero */}
        <section className="landing-top">
          <div className="landing-hero">
            <div className="landing-hero__art">
              <HeroArt width={767} height={633} />
            </div>
            <div className="landing-hero__content">
              <div className="hero-tagline-card">
                <span className="hero-tagline-card__eyebrow">Career Accelerator for Emerging Talent</span>
                <h1 className="hero-tagline-card__title">
                  Your Next Career Breakthrough, Matched with Precision.
                </h1>
                <p className="hero-tagline-card__desc">
                  Connect with curated entry-level and internship roles, track applications in real time, and land your breakthrough job.
                </p>
                <div className="hero-tagline-card__cta">
                  <CtaButton to="/jobs" variant="orange">
                    Explore Opportunities →
                  </CtaButton>
                  <CtaButton to={user ? dashboardLink : "/signup"} variant="dark">
                    {user ? "Go to Dashboard" : "Start Hiring"}
                  </CtaButton>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Trusted Ecosystem Logo Wall (Under Hero, Logos Only) */}
        <section className="trust-strip scroll-reveal" data-delay="40">
          <p className="trust-strip__label">Trusted by high-growth engineering and design teams</p>
          <div className="trust-strip__logos" aria-label="Partner ecosystems">
            {/* GoTo */}
            <svg className="trust-logo" viewBox="0 0 120 32" fill="currentColor" role="img" aria-label="GoTo">
              <text x="10" y="22" fontFamily="'Inter', sans-serif" fontWeight="800" fontSize="19" letterSpacing="-0.5">goto</text>
            </svg>
            {/* Traveloka */}
            <svg className="trust-logo" viewBox="0 0 140 32" fill="currentColor" role="img" aria-label="Traveloka">
              <circle cx="16" cy="16" r="10" fill="none" stroke="currentColor" strokeWidth="2.5" />
              <path d="M16 8l4 8h-8z" />
              <text x="34" y="22" fontFamily="'Inter', sans-serif" fontWeight="700" fontSize="17" letterSpacing="-0.3">traveloka</text>
            </svg>
            {/* Blibli */}
            <svg className="trust-logo" viewBox="0 0 110 32" fill="currentColor" role="img" aria-label="Blibli">
              <rect x="4" y="8" width="16" height="16" rx="4" fill="none" stroke="currentColor" strokeWidth="2.5" />
              <text x="28" y="22" fontFamily="'Inter', sans-serif" fontWeight="800" fontSize="18" letterSpacing="-0.5">blibli</text>
            </svg>
            {/* Bukalapak */}
            <svg className="trust-logo" viewBox="0 0 130 32" fill="currentColor" role="img" aria-label="Bukalapak">
              <text x="8" y="22" fontFamily="'Inter', sans-serif" fontWeight="800" fontSize="18" letterSpacing="-0.5">bukalapak</text>
            </svg>
            {/* Telkom */}
            <svg className="trust-logo" viewBox="0 0 120 32" fill="currentColor" role="img" aria-label="Telkom">
              <circle cx="14" cy="16" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
              <text x="30" y="22" fontFamily="'Inter', sans-serif" fontWeight="700" fontSize="17" letterSpacing="-0.3">Telkom</text>
            </svg>
          </div>
        </section>

        {/* Section 3: Find Your Opportunity Yourself (Bento Product Feature with Tangible UI) */}
        <section className="opportunity scroll-reveal" data-delay="80">
          <div className="opportunity__showcase">
            <div className="opportunity__head">
              <h2>Find Your Opportunity Yourself.</h2>
              <div className="opportunity__sub">Smart matching that puts your real potential first.</div>
            </div>

            <div className="entry-badge-wrap">
              <span className="entry-badge">
                <span className="entry-badge__ico">✓</span> Entry Level and Internship Focused
              </span>
            </div>

            {/* Real Product Micro-Components (No Wireframe Bars) */}
            <div className="preview-bento">
              {/* Tile 1: Candidate Match Snapshot */}
              <div className="preview-card preview-card--candidate">
                <div className="preview-card__header">
                  <div className="preview-card__avatar">AR</div>
                  <div className="preview-card__meta">
                    <strong>Arif Rahman</strong>
                    <span>Junior Frontend Developer</span>
                  </div>
                  <span className="preview-card__score">96% Match</span>
                </div>
                <div className="preview-card__skills">
                  <span className="skill-chip">React</span>
                  <span className="skill-chip">TypeScript</span>
                  <span className="skill-chip">Tailwind</span>
                  <span className="skill-chip skill-chip--alt">Available Now</span>
                </div>
              </div>

              {/* Tile 2: Live Application Tracker */}
              <div className="preview-card preview-card--tracker">
                <div className="preview-card__status-row">
                  <div className="preview-card__company">
                    <span className="preview-card__co-icon">✈</span>
                    <div>
                      <strong>Traveloka</strong>
                      <small>Product Design Intern</small>
                    </div>
                  </div>
                  <span className="status-pill status-pill--interview">Interview Scheduled</span>
                </div>
                <div className="tracker-steps">
                  <div className="tracker-step is-complete">
                    <span className="tracker-step__dot" />
                    <span>Applied</span>
                  </div>
                  <div className="tracker-step is-complete">
                    <span className="tracker-step__dot" />
                    <span>Reviewed</span>
                  </div>
                  <div className="tracker-step is-active">
                    <span className="tracker-step__dot" />
                    <span>Interview</span>
                  </div>
                  <div className="tracker-step">
                    <span className="tracker-step__dot" />
                    <span>Offer</span>
                  </div>
                </div>
              </div>

              {/* Tile 3: Direct 1-Click Role Discovery */}
              <div className="preview-card preview-card--job">
                <div className="preview-job-item">
                  <div className="preview-job-item__main">
                    <div className="preview-job-item__badge">GoTo Ecosystem</div>
                    <strong>Junior UI Engineer</strong>
                    <span>Jakarta (Hybrid) • IDR 8M - 12M</span>
                  </div>
                  <Link to="/jobs" className="preview-job-item__btn">
                    Quick Apply →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Feature Highlights on Right */}
          <div className="opportunity__aside">
            <div className="feature-pill">
              <div className="feature-pill__icon">★</div>
              <div className="feature-pill__body">
                <strong>Personalized Match Score</strong>
                <p>Compare your exact skills and experience compatibility with every listing before applying.</p>
              </div>
            </div>
            <div className="feature-pill">
              <div className="feature-pill__icon">◎</div>
              <div className="feature-pill__body">
                <strong>Real-Time Status Pulse</strong>
                <p>Never wonder about your application status with clear timeline updates from submission to offer.</p>
              </div>
            </div>
            <div className="feature-pill">
              <div className="feature-pill__icon">📄</div>
              <div className="feature-pill__body">
                <strong>Print-Ready CV Builder</strong>
                <p>Generate a clean, professional resume directly from your verified profile with a single click.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: For Employers Spotlight Banner */}
        <section className="employer-banner scroll-reveal" data-delay="120">
          <div className="employer-banner__body">
            <div className="employer-banner__info">
              <span className="employer-banner__tag">FOR EMPLOYERS</span>
              <h2>Find Great Talent, Faster.</h2>
              <p>Post vacancies, access pre-scored candidate profiles, and manage incoming applications in a unified, uncluttered dashboard.</p>
              <div className="employer-banner__perks">
                <div className="employer-perk">
                  <span className="employer-perk__check">✓</span>
                  <span>Instant skill match scores for all applicants</span>
                </div>
                <div className="employer-perk">
                  <span className="employer-perk__check">✓</span>
                  <span>Direct candidate pipeline management</span>
                </div>
              </div>
              <div className="employer-banner__actions">
                <CtaButton to={user ? (role === "employer" ? "/employer" : "/home") : "/signup"} variant="orange">
                  {user && role === "employer" ? "Go to Employer Hub →" : "Start Hiring Talent →"}
                </CtaButton>
              </div>
            </div>
            <div className="employer-banner__art">
              <div className="employer-banner__img-wrap">
                <img
                  src="/for-employer.png"
                  alt="Nexora for employers dashboard preview"
                  loading="lazy"
                  decoding="async"
                  width="400"
                  height="260"
                />
                <div className="employer-floating-badge">
                  <strong>15+ Matches</strong>
                  <span>Pre-screened candidates</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: How It Works Flow */}
        <section className="how-it-works scroll-reveal" data-delay="160">
          <div className="how-it-works__card">
            <div className="how-it-works__header">
              <h2>How Nexora Works</h2>
              <p>Three straightforward steps to accelerate your career journey.</p>
            </div>
            <div className="how-steps-grid">
              <div className="how-step-card">
                <div className="how-step-card__num">1</div>
                <h3>Build Your Profile</h3>
                <p>Add your technical skills, education, and role preferences to establish your verified profile.</p>
              </div>
              <div className="how-step-card">
                <div className="how-step-card__num">2</div>
                <h3>Discover Matched Roles</h3>
                <p>Browse curated positions ranked by compatibility, salary transparency, and work mode.</p>
              </div>
              <div className="how-step-card">
                <div className="how-step-card__num">3</div>
                <h3>Apply with Confidence</h3>
                <p>Submit with a single tap, track pipeline stages in real time, and connect with hiring teams.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 6: Candidate Spotlight / Social Proof */}
        <section className="testimonial-section scroll-reveal" data-delay="180">
          <div className="testimonial-card">
            <div className="testimonial-quote-mark">“</div>
            <blockquote className="testimonial-card__quote">
              Nexora made transitioning into my first tech role transparent and structured. The match score breakdown showed me exactly what skills to emphasize.
            </blockquote>
            <div className="testimonial-card__author">
              <div className="testimonial-avatar">RP</div>
              <div>
                <strong>Reyhan Putra</strong>
                <span>Junior Frontend Engineer at TechCorp</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 7: Focused Closing Call to Action */}
        <section className="final-cta scroll-reveal" data-delay="200">
          <div className="final-cta__card">
            <h2>Ready to Take Your Next Step?</h2>
            <p>Join thousands of early-career talents and forward-thinking companies connecting on Nexora.</p>
            <div className="final-cta__buttons">
              <CtaButton to="/jobs" variant="orange">
                Browse Open Roles →
              </CtaButton>
              <CtaButton to={user ? dashboardLink : "/signup"} variant="dark">
                {user ? "Open Dashboard" : "Join as Employer"}
              </CtaButton>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
