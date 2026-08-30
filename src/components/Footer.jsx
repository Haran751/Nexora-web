import { useState, lazy, Suspense } from "react";
import { Link } from "react-router-dom";

const CompanyModal = lazy(() => import("./CompanyModal.jsx"));

const columns = [
  {
    title: "For Job Seekers",
    links: [
      { label: "Browse Jobs", to: "/jobs" },
      { label: "Applications", to: "/applications" },
      { label: "CV Generator", to: "/cv" },
      { label: "Saved Jobs", to: "/saved" },
    ],
  },
  {
    title: "For Employers",
    links: [
      { label: "Post a Job", to: "/employer" },
      { label: "Candidate Search", to: "/employer" },
      { label: "Employer Registration", to: "/signup" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", modal: "about" },
      { label: "Contact", modal: "contact" },
      { label: "Privacy Policy", modal: "privacy" },
      { label: "Terms of Service", modal: "terms" },
    ],
  },
];

export default function Footer() {
  const [activeModal, setActiveModal] = useState(null);

  return (
    <>
      <footer className="app-footer">
        <div className="app-footer__grid">
          <div className="app-footer__brand">
            <div className="app-footer__logo">
              <img className="navbar__logo" src="/logo-nexora.webp" alt="Nexora logo" width="38" height="38" loading="lazy" decoding="async" />
              <span>Nexora</span>
            </div>
            <p>Find Your Opportunity Yourself. We&apos;ll help.</p>
          </div>

          {columns.map((col) => (
            <div className="app-footer__col" key={col.title}>
              <h4>{col.title}</h4>
              <ul>
                {col.links.map((link) => (
                  <li key={link.label}>
                    {link.to ? (
                      <Link to={link.to}>{link.label}</Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setActiveModal(link.modal)}
                        style={{
                          background: "none",
                          border: "none",
                          padding: 0,
                          color: "inherit",
                          font: "inherit",
                          fontSize: "inherit",
                          cursor: "pointer",
                          textAlign: "left",
                        }}
                      >
                        {link.label}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="app-footer__divider" />
        <div className="app-footer__bottom">
          © {new Date().getFullYear()} Nexora — All rights reserved.
        </div>
      </footer>

      {activeModal && (
        <Suspense fallback={null}>
          <CompanyModal
            initialTab={activeModal}
            onClose={() => setActiveModal(null)}
          />
        </Suspense>
      )}
    </>
  );
}