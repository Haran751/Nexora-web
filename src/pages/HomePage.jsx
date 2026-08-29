import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import useScrollReveal from "../hooks/useScrollReveal.js";
import { useAuth } from "../context/AuthContext.jsx";
import { getUserApplications, getEmployerCandidates } from "../services/applicationsService.js";

const ClockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" strokeLinecap="round" />
  </svg>
);

const getProgressPercent = (status) => {
  switch ((status || "").toLowerCase()) {
    case "applied":
      return 25;
    case "viewed":
      return 45;
    case "in review":
      return 65;
    case "shortlisted":
      return 80;
    case "interview":
      return 90;
    case "accepted":
      return 100;
    case "rejected":
      return 100;
    default:
      return 25;
  }
};

export default function HomePage() {
  const { user, profile, role } = useAuth();
  const [apps, setApps] = useState([]);
  const revealRef = useScrollReveal();

  useEffect(() => {
    let active = true;
    async function load() {
      if (role === "employer") {
        const candidates = await getEmployerCandidates(user?.id);
        if (active) setApps(candidates || []);
      } else {
        const data = await getUserApplications(user?.id);
        if (active) setApps(data || []);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [user?.id, role]);

  const displayName = profile?.name || user?.email?.split("@")[0] || "User";
  const avatarChar = (displayName || "U").charAt(0).toUpperCase();
  const latestApp = apps[0];

  const progressWidth =
    apps.length === 0
      ? "0%"
      : role === "employer"
      ? `${Math.min(100, Math.max(15, Math.round((apps.filter((c) => c.status !== "Applied").length / (apps.length || 1)) * 100)))}%`
      : `${getProgressPercent(latestApp?.status)}%`;

  return (
    <div className="page">
      <Navbar />
      <main className="page__body" ref={revealRef}>
        <p className="dash__sub">
          Welcome back, {displayName}. {role === "employer" ? "Manage your hiring pipeline effortlessly." : "Find your next opportunity yourself."}
        </p>

        <div className="dash">
          {/* Left — Profil */}
          <div className="card profil-card scroll-reveal" data-delay="60">
            <h3>{role === "employer" ? "Company Profile" : "Profile"}</h3>
            <div className="profil-card__head">
              <div className="profil-card__avatar">
                {profile?.avatarUrl ? (
                  <img src={profile.avatarUrl} alt={displayName} className="profil-card__avatar-img" />
                ) : (
                  avatarChar
                )}
              </div>
              <div className="profil-card__lines">
                <strong style={{ fontSize: "1.1rem", display: "block" }}>{displayName}</strong>
                <span style={{ fontSize: "0.85rem", opacity: 0.8 }}>{user?.email || "No email"}</span>
              </div>
            </div>
            <div className="profil-card__rows">
              <div className="info-row">
                <span className="info-row__label">Role</span>
                <strong style={{ fontSize: "0.9rem", textTransform: "capitalize" }}>{role}</strong>
              </div>
              <div className="info-row">
                <span className="info-row__label">Location</span>
                <span style={{ fontSize: "0.9rem" }}>{profile?.location || "Jakarta"}</span>
              </div>
              <div className="info-row">
                <span className="info-row__label">Skills</span>
                <span style={{ fontSize: "0.9rem" }}>{profile?.skills?.length ? `${profile.skills.length} skills added` : "No skills yet"}</span>
              </div>
              <div className="info-row">
                <span className="info-row__label">Bio</span>
                <span style={{ fontSize: "0.9rem", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {profile?.about || "No summary provided"}
                </span>
              </div>
            </div>
            <Link
              to={role === "employer" ? "/employer" : "/profile"}
              className="view-job"
              style={{ color: "var(--accent-orange)", display: "inline-block", marginTop: 18 }}
            >
              {role === "employer" ? "Go to Employer Hub →" : "View full profile →"}
            </Link>
          </div>

          {/* Right — two cards */}
          <div className="dash__stack scroll-reveal" data-delay="140">
            <div className="card">
              <div className="pending-head">
                <span className="clock">
                  <ClockIcon />
                </span>
                <h3>{role === "employer" ? "Hiring Overview" : "Applications Status"}</h3>
              </div>
              <div className="progress-track">
                <div
                  className="progress-track__fill"
                  style={{ width: progressWidth, transition: "width 0.4s ease" }}
                />
              </div>
              <div className="pending-meta">
                <span>
                  {role === "employer"
                    ? apps.length > 0
                      ? `${apps.length} candidate application${apps.length > 1 ? "s" : ""} active.`
                      : "Manage your active job postings and candidate review."
                    : latestApp
                    ? `Latest: ${latestApp.title} (${latestApp.status})`
                    : "No applications submitted yet."}
                </span>
                <Link to={role === "employer" ? "/employer" : "/applications"} style={{ color: "var(--accent-orange)", fontWeight: 600 }}>
                  {role === "employer" ? `View Candidates (${apps.length})` : `View All (${apps.length})`}
                </Link>
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
              {role === "employer" && (
                <Link to="/employer" className="disco-bar" style={{ background: "#42154C", marginTop: 8 }}>
                  Post a New Job Vacancy →
                </Link>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
