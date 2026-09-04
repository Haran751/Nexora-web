import { Link } from "react-router-dom";

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
      { label: "Find Candidates", to: "/employer" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", to: "/" },
      { label: "Explore Roles", to: "/jobs" },
      { label: "Employer Hub", to: "/employer" },
      { label: "Create Profile", to: "/signup" },
    ],
  },
];

export default function Footer() {
  return (
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
                  <Link to={link.to}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="app-footer__divider" />
      <div className="app-footer__bottom">
        © {new Date().getFullYear()} Nexora. All rights reserved.
      </div>
    </footer>
  );
}