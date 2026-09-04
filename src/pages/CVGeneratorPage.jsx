import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import useScrollReveal from "../hooks/useScrollReveal.js";
import { loadProfile } from "../lib/profile.js";
import { sanitizeUrl } from "../lib/security.js";
import { useAuth } from "../context/AuthContext.jsx";

const TEMPLATES = ["Classic", "Modern", "Minimal"];

function SheetSection({ title, children }) {
  return (
    <section className="cv-sec">
      <h3 className="cv-sec__title">{title}</h3>
      {children}
    </section>
  );
}

function SkillsList({ skills }) {
  return (
    <div className="cv-skills">
      {(skills || []).map((s) => (
        <span className="cv-skill" key={s}>
          {s}
        </span>
      ))}
    </div>
  );
}

function ClassicSheet({ p }) {
  return (
    <div className="cv-sheet-inner cv-sheet-inner--classic">
      <header className="cv-head">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <div>
            <h1>{p.name || "User"}</h1>
            <p className="cv-head__meta">
              {[p.email, p.phone, p.location, p.birthday].filter(Boolean).join("  •  ")}
            </p>
          </div>
          {p.avatarUrl && (
            <img
              src={p.avatarUrl}
              alt={p.name || "Avatar"}
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                objectFit: "cover",
                border: "2px solid var(--accent-orange)",
                flexShrink: 0,
              }}
            />
          )}
        </div>
      </header>

      {p.about && (
        <SheetSection title="About">
          <p className="cv-text">{p.about}</p>
        </SheetSection>
      )}
      {(p.skills || []).length > 0 && (
        <SheetSection title="Skills">
          <SkillsList skills={p.skills} />
        </SheetSection>
      )}
      {(p.education || []).length > 0 && (
        <SheetSection title="Education">
          {(p.education || []).map((e, i) => (
            <div className="cv-entry" key={i}>
              <strong>{e.institution || "Institution"}</strong>
              <span>{[e.major, e.year].filter(Boolean).join(" · ")}</span>
            </div>
          ))}
        </SheetSection>
      )}
      {(p.experience || []).length > 0 && (
        <SheetSection title="Experience">
          {(p.experience || []).map((e, i) => (
            <div className="cv-entry" key={i}>
              <strong>{e.role || "Role"}</strong>
              <span>{[e.company, e.duration].filter(Boolean).join(" · ")}</span>
              {e.description && <p className="cv-text">{e.description}</p>}
            </div>
          ))}
        </SheetSection>
      )}
      {(p.projects || []).length > 0 && (
        <SheetSection title="Projects & Portfolio">
          {(p.projects || []).map((pr, i) => (
            <div className="cv-entry" key={i}>
              <strong>{pr.title || "Project"}</strong>
              {pr.description && <p className="cv-text">{pr.description}</p>}
              {pr.url && sanitizeUrl(pr.url) && (
                <a className="cv-link" href={sanitizeUrl(pr.url)} target="_blank" rel="noopener noreferrer">
                  {sanitizeUrl(pr.url)}
                </a>
              )}
            </div>
          ))}
        </SheetSection>
      )}
      {(p.certificates || []).length > 0 && (
        <SheetSection title="Certificates">
          {(p.certificates || []).map((c, i) => (
            <div className="cv-entry" key={i}>
              <strong>{c.title || "Certificate"}</strong>
              <span>{[c.issuer, c.year].filter(Boolean).join(" · ")}</span>
            </div>
          ))}
        </SheetSection>
      )}
    </div>
  );
}

function ModernSheet({ p }) {
  return (
    <div className="cv-sheet-inner cv-sheet-inner--modern">
      <header className="cv-head cv-head--bar">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <div>
            <h1>{p.name || "User"}</h1>
            <p className="cv-head__meta">
              {[p.email, p.phone, p.location].filter(Boolean).join("  •  ")}
            </p>
          </div>
          {p.avatarUrl && (
            <img
              src={p.avatarUrl}
              alt={p.name || "Avatar"}
              style={{
                width: 68,
                height: 68,
                borderRadius: "50%",
                objectFit: "cover",
                border: "2px solid rgba(255, 255, 255, 0.8)",
                flexShrink: 0,
              }}
            />
          )}
        </div>
      </header>

      <div className="cv-modern-grid">
        <div className="cv-modern-side">
          {(p.skills || []).length > 0 && (
            <SheetSection title="Core Skills">
              <SkillsList skills={p.skills} />
            </SheetSection>
          )}
          {(p.certificates || []).length > 0 && (
            <SheetSection title="Certificates">
              {(p.certificates || []).map((c, i) => (
                <div className="cv-entry" key={i}>
                  <strong>{c.title || "Certificate"}</strong>
                  <span>{[c.issuer, c.year].filter(Boolean).join(" · ")}</span>
                </div>
              ))}
            </SheetSection>
          )}
        </div>

        <div className="cv-modern-main">
          {p.about && (
            <SheetSection title="About">
              <p className="cv-text">{p.about}</p>
            </SheetSection>
          )}
          {(p.experience || []).length > 0 && (
            <SheetSection title="Experience">
              {(p.experience || []).map((e, i) => (
                <div className="cv-entry" key={i}>
                  <strong>{e.role || "Role"}</strong>
                  <span>{[e.company, e.duration].filter(Boolean).join(" · ")}</span>
                  {e.description && <p className="cv-text">{e.description}</p>}
                </div>
              ))}
            </SheetSection>
          )}
          {(p.education || []).length > 0 && (
            <SheetSection title="Education">
              {(p.education || []).map((e, i) => (
                <div className="cv-entry" key={i}>
                  <strong>{e.institution || "Institution"}</strong>
                  <span>{[e.major, e.year].filter(Boolean).join(" · ")}</span>
                </div>
              ))}
            </SheetSection>
          )}
          {(p.projects || []).length > 0 && (
            <SheetSection title="Projects & Portfolio">
              {(p.projects || []).map((pr, i) => (
                <div className="cv-entry" key={i}>
                  <strong>{pr.title || "Project"}</strong>
                  {pr.description && <p className="cv-text">{pr.description}</p>}
                  {pr.url && sanitizeUrl(pr.url) && (
                    <a className="cv-link" href={sanitizeUrl(pr.url)} target="_blank" rel="noopener noreferrer">
                      {sanitizeUrl(pr.url)}
                    </a>
                  )}
                </div>
              ))}
            </SheetSection>
          )}
        </div>
      </div>
    </div>
  );
}

function MinimalSheet({ p }) {
  return (
    <div className="cv-sheet-inner cv-sheet-inner--minimal">
      <header className="cv-head">
        <h1>{p.name || "User"}</h1>
        <div className="cv-head__rule" />
        <p className="cv-head__meta">
          {[p.email, p.phone, p.location].filter(Boolean).join("   ·   ")}
        </p>
      </header>

      {p.about && <p className="cv-text cv-text--lead">{p.about}</p>}

      {(p.skills || []).length > 0 && (
        <SheetSection title="Skills">
          <SkillsList skills={p.skills} />
        </SheetSection>
      )}
      {(p.experience || []).length > 0 && (
        <SheetSection title="Experience">
          {(p.experience || []).map((e, i) => (
            <div className="cv-entry" key={i}>
              <strong>{e.role || "Role"}</strong>
              <span>{[e.company, e.duration].filter(Boolean).join(" · ")}</span>
              {e.description && <p className="cv-text">{e.description}</p>}
            </div>
          ))}
        </SheetSection>
      )}
      {(p.education || []).length > 0 && (
        <SheetSection title="Education">
          {(p.education || []).map((e, i) => (
            <div className="cv-entry" key={i}>
              <strong>{e.institution || "Institution"}</strong>
              <span>{[e.major, e.year].filter(Boolean).join(" · ")}</span>
            </div>
          ))}
        </SheetSection>
      )}
      {(p.projects || []).length > 0 && (
        <SheetSection title="Projects">
          {(p.projects || []).map((pr, i) => (
            <div className="cv-entry" key={i}>
              {pr.title && <strong>{pr.title}</strong>}
              {pr.url && sanitizeUrl(pr.url) && (
                <a className="cv-link" href={sanitizeUrl(pr.url)} target="_blank" rel="noopener noreferrer">
                  {sanitizeUrl(pr.url)}
                </a>
              )}
            </div>
          ))}
        </SheetSection>
      )}
      {(p.certificates || []).length > 0 && (
        <SheetSection title="Certificates">
          {(p.certificates || []).map((c, i) => (
            <div className="cv-entry" key={i}>
              <strong>{c.title || "Certificate"}</strong>
              <span>{[c.issuer, c.year].filter(Boolean).join(" · ")}</span>
            </div>
          ))}
        </SheetSection>
      )}
    </div>
  );
}

export default function CVGeneratorPage() {
  const [template, setTemplate] = useState("Classic");
  const { profile: authProfile } = useAuth();
  const profile = authProfile?.name ? authProfile : loadProfile();
  const revealRef = useScrollReveal();

  const isProfileEmpty =
    (!profile.skills || profile.skills.length === 0) &&
    (!profile.education || profile.education.length === 0) &&
    (!profile.experience || profile.experience.length === 0) &&
    (!profile.about || !profile.about.trim());

  const handleDownloadPdf = () => {
    const originalTitle = document.title;
    const cleanName = (profile?.name || "User").trim().replace(/[^a-zA-Z0-9_-]/g, "_");
    document.title = `CV_${cleanName}_Nexora`;
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };

  return (
    <div className="page">
      <Navbar />
      <main className="page__body cv" ref={revealRef}>
        <div className="jd-header">
          <h2 className="saved__title">CV Generator</h2>
          <span>Rendered live from your profile</span>
        </div>

        <div className="cv-layout">
          <aside className="cv-side">
            <h4>Templates</h4>
            {TEMPLATES.map((t) => (
              <button
                key={t}
                className={`cv-template${template === t ? " cv-template--active" : ""}`}
                onClick={() => setTemplate(t)}
              >
                <span className="cv-template__thumb" aria-hidden="true" />
                {t}
              </button>
            ))}
            <Link to="/profile" className="cta-btn cta-btn--orange cv-side__edit">
              <span className="cta-btn__play" /> Edit Profile
            </Link>
          </aside>

          <div className="cv-main">
            {isProfileEmpty && (
              <div
                className="cv-notice-banner"
                style={{
                  background: "rgba(232, 136, 60, 0.12)",
                  border: "1px solid rgba(232, 136, 60, 0.35)",
                  borderRadius: 10,
                  padding: "12px 18px",
                  marginBottom: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  color: "rgba(255, 255, 255, 0.9)",
                  fontSize: "0.88rem",
                }}
              >
                <span>
                  💡 <strong>Profil Anda masih kosong.</strong> Tambahkan pendidikan, pengalaman kerja, dan keahlian di halaman profil agar CV lebih memukau!
                </span>
                <Link
                  to="/profile"
                  className="cta-btn cta-btn--orange"
                  style={{ padding: "6px 14px", fontSize: "0.82rem", whiteSpace: "nowrap" }}
                >
                  Lengkapi Profil →
                </Link>
              </div>
            )}

            <button className="cta-btn cta-btn--dark cv-print-btn" onClick={handleDownloadPdf}>
              <span className="cta-btn__play" /> Download PDF
            </button>

            <div className="cv-sheet" id="cv-sheet">
              {template === "Classic" && <ClassicSheet p={profile} />}
              {template === "Modern" && <ModernSheet p={profile} />}
              {template === "Minimal" && <MinimalSheet p={profile} />}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}