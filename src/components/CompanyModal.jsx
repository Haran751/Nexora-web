import { useEffect, useState } from "react";

const TABS = [
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
  { id: "privacy", label: "Privacy Policy" },
  { id: "terms", label: "Terms of Service" },
];

export default function CompanyModal({ initialTab = "about", onClose }) {
  const [tab, setTab] = useState(initialTab);

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [onClose]);

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="company-modal-heading"
      style={{ zIndex: 9999 }}
    >
      <div
        className="modal-card company-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: 680,
          width: "92%",
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          padding: 0,
          overflow: "hidden",
        }}
      >
        {/* Header with tabs and close button */}
        <div
          style={{
            padding: "24px 28px 16px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
            position: "relative",
          }}
        >
          <button
            onClick={onClose}
            aria-label="Close dialog"
            style={{
              position: "absolute",
              top: 20,
              right: 20,
              background: "rgba(255, 255, 255, 0.1)",
              border: "none",
              color: "#fff",
              width: 32,
              height: 32,
              borderRadius: "50%",
              cursor: "pointer",
              display: "grid",
              placeItems: "center",
              fontSize: "1rem",
              transition: "background 0.2s ease",
            }}
          >
            ✕
          </button>

          <h3
            id="company-modal-heading"
            style={{
              margin: "0 0 16px",
              fontSize: "1.35rem",
              fontFamily: "Playfair Display, serif",
              color: "#fff",
            }}
          >
            {tab === "about" && "About Nexora"}
            {tab === "contact" && "Contact & Support"}
            {tab === "privacy" && "Privacy Commitment"}
            {tab === "terms" && "Terms of Service"}
          </h3>

          <div
            role="tablist"
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            {TABS.map((t) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 999,
                  border: "1px solid",
                  borderColor: tab === t.id ? "var(--accent-orange)" : "rgba(255, 255, 255, 0.2)",
                  background: tab === t.id ? "var(--accent-orange)" : "rgba(255, 255, 255, 0.06)",
                  color: "#fff",
                  fontSize: "0.85rem",
                  fontWeight: tab === t.id ? 700 : 500,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Body with Scrollable Content */}
        <div
          style={{
            padding: "24px 28px",
            overflowY: "auto",
            fontSize: "0.92rem",
            lineHeight: 1.65,
            color: "rgba(255, 255, 255, 0.88)",
          }}
        >
          {tab === "about" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <p>
                <strong>Nexora</strong> was built to solve the modern career paradox: entry-level job postings that demand 3+ years of professional experience.
              </p>
              <p>
                Our mission is to help students, recent graduates, and early-career switchers discover opportunities where their genuine competencies, academic projects, and verified skills speak louder than tenure.
              </p>
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  padding: "16px 18px",
                  borderRadius: 12,
                }}
              >
                <strong style={{ color: "#fff" }}>Our Core Principles</strong>
                <ul style={{ margin: "8px 0 0", paddingLeft: 20 }}>
                  <li>Transparent requirements: only realistic, accessible criteria for entry talent.</li>
                  <li>Algorithm-powered skill matching: transparent match percentages so you know where you stand.</li>
                  <li>Respect for candidate effort: streamlined applications and status tracking with no ghosting.</li>
                </ul>
              </div>
            </div>
          )}

          {tab === "contact" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <p>
                We are based in Jakarta, Indonesia and actively support job seekers and hiring partners across Southeast Asia.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
                <div style={{ background: "rgba(255, 255, 255, 0.07)", padding: 14, borderRadius: 10 }}>
                  <strong style={{ display: "block", color: "var(--accent-orange)", marginBottom: 4 }}>Job Seeker Support</strong>
                  <span style={{ fontSize: "0.85rem", opacity: 0.8 }}>Questions about your account or applications:</span>
                  <p style={{ margin: "6px 0 0", fontWeight: 600 }}>support@nexora.id</p>
                </div>
                <div style={{ background: "rgba(255, 255, 255, 0.07)", padding: 14, borderRadius: 10 }}>
                  <strong style={{ display: "block", color: "var(--accent-pink)", marginBottom: 4 }}>Employer Partnerships</strong>
                  <span style={{ fontSize: "0.85rem", opacity: 0.8 }}>Looking to hire verified early talent:</span>
                  <p style={{ margin: "6px 0 0", fontWeight: 600 }}>partners@nexora.id</p>
                </div>
              </div>
              <p style={{ fontSize: "0.85rem", opacity: 0.75 }}>
                Office hours: Monday – Friday, 09:00 – 18:00 WIB. Inquiries are typically answered within 24 business hours.
              </p>
            </div>
          )}

          {tab === "privacy" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <p>
                At Nexora, data privacy for early-career job seekers is non-negotiable. Here is our straightforward promise:
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <strong style={{ color: "#fff" }}>1. Data Ownership & Use</strong>
                  <p style={{ margin: "4px 0 0" }}>
                    Your CV, contact details, and match responses are stored securely and only presented to employers when you deliberately submit an application.
                  </p>
                </div>
                <div>
                  <strong style={{ color: "#fff" }}>2. Zero Data Brokering</strong>
                  <p style={{ margin: "4px 0 0" }}>
                    We do not sell, rent, or trade student or candidate information to marketing aggregators or third-party background brokers.
                  </p>
                </div>
                <div>
                  <strong style={{ color: "#fff" }}>3. Total Control & Right to Erasure</strong>
                  <p style={{ margin: "4px 0 0" }}>
                    You can edit, export, or permanently delete your profile, CVs, and application history at any time. Once deleted, your records are purged from active datastores.
                  </p>
                </div>
              </div>
            </div>
          )}

          {tab === "terms" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <p>
                Nexora provides a trusted, fair recruitment ecosystem under the following commitments:
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <strong style={{ color: "#fff" }}>For Candidates:</strong>
                  <p style={{ margin: "4px 0 0" }}>
                    Nexora is and will always remain completely free for candidates and job seekers. Candidates agree to present truthful skills, education, and credentials.
                  </p>
                </div>
                <div>
                  <strong style={{ color: "#fff" }}>For Employers:</strong>
                  <p style={{ margin: "4px 0 0" }}>
                    Employers posting on Nexora agree to transparent compensation ranges, legitimate mentorship standards, and non-discriminatory hiring practices. Deceptive or unpaid disguised full-time postings are subject to immediate removal.
                  </p>
                </div>
                <div>
                  <strong style={{ color: "#fff" }}>Safe Environment:</strong>
                  <p style={{ margin: "4px 0 0" }}>
                    Harassment, identity misrepresentation, and fraudulent recruitment activities are strictly prohibited and result in permanent banishment.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "16px 28px",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            display: "flex",
            justifyContent: "flex-end",
            background: "rgba(0, 0, 0, 0.15)",
          }}
        >
          <button
            onClick={onClose}
            className="modal-card__cancel"
            style={{ margin: 0, padding: "8px 20px" }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
