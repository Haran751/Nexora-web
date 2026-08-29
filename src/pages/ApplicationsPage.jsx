import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import useScrollReveal from "../hooks/useScrollReveal.js";

const STAGES = ["Applied", "Viewed", "In Review", "Shortlisted", "Interview"];

const dummyApps = [
  {
    id: 1,
    jobId: 1,
    title: "Frontend Developer Intern",
    company: "Nexora Studio",
    applied: "Aug 25, 2026",
    status: "In Review",
    timeline: [
      { label: "Application sent", date: "Aug 25, 2026" },
      { label: "Application viewed", date: "Aug 26, 2026" },
      { label: "In review by hiring team", date: "Aug 27, 2026" },
    ],
  },
  {
    id: 2,
    jobId: 2,
    title: "UI/UX Designer Grad",
    company: "Brightmind Agency",
    applied: "Aug 22, 2026",
    status: "Interview",
    timeline: [
      { label: "Application sent", date: "Aug 22, 2026" },
      { label: "Application viewed", date: "Aug 23, 2026" },
      { label: "In review", date: "Aug 24, 2026" },
      { label: "Interview scheduled", date: "Aug 28, 2026" },
    ],
  },
  {
    id: 3,
    jobId: 3,
    title: "Data Analyst (Entry)",
    company: "CloudNine Analytics",
    applied: "Aug 24, 2026",
    status: "Applied",
    timeline: [{ label: "Application sent", date: "Aug 24, 2026" }],
  },
  {
    id: 4,
    jobId: 4,
    title: "Marketing Assistant",
    company: "Vertex Retail",
    applied: "Aug 20, 2026",
    status: "Accepted",
    timeline: [
      { label: "Application sent", date: "Aug 20, 2026" },
      { label: "Application viewed", date: "Aug 21, 2026" },
      { label: "In review", date: "Aug 22, 2026" },
      { label: "Shortlisted", date: "Aug 25, 2026" },
      { label: "Offered & accepted 🎉", date: "Aug 28, 2026" },
    ],
  },
  {
    id: 5,
    jobId: 9,
    title: "HR Assistant (Part-Time)",
    company: "Makmur Group",
    applied: "Aug 18, 2026",
    status: "Rejected",
    timeline: [
      { label: "Application sent", date: "Aug 18, 2026" },
      { label: "Application viewed", date: "Aug 19, 2026" },
      { label: "Application closed", date: "Aug 26, 2026" },
    ],
  },
];

const TABS = ["All", "Applied", "In Review", "Interview", "Accepted", "Rejected"];

const statusClass = (status) => "app-badge--" + status.toLowerCase().replace(/\s+/g, "");

function stageIndex(status) {
  if (status === "Accepted" || status === "Rejected") return STAGES.length;
  const i = STAGES.indexOf(status);
  return i >= 0 ? i : 0;
}

function ApplicationsPage() {
  const [tab, setTab] = useState("All");
  const [expandedId, setExpandedId] = useState(null);
  const revealRef = useScrollReveal();

  const visible = tab === "All" ? dummyApps : dummyApps.filter((a) => a.status === tab);

  return (
    <div className="page">
      <Navbar />
      <main className="page__body applications" ref={revealRef}>
        <h1 className="applications__title">My Applications</h1>

        <div className="app-tabs" role="tablist">
          {TABS.map((t) => (
            <button
              key={t}
              role="tab"
              className={`app-tab${tab === t ? " app-tab--active" : ""}`}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </div>

        {visible.length > 0 ? (
          <div className="app-list">
            {visible.map((app) => {
              const reached = stageIndex(app.status);
              return (
                <article
                  key={app.id}
                  className="card app-card"
                  onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}
                >
                  <div className="app-card__head">
                    <span className="app-card__logo">{app.company.charAt(0)}</span>
                    <div className="app-card__info">
                      <h3>{app.title}</h3>
                      <span className="app-card__company">{app.company}</span>
                    </div>
                    <span className={`app-badge ${statusClass(app.status)}`}>{app.status}</span>
                  </div>

                  <div className="app-card__meta">
                    <span>Applied {app.applied}</span>
                    <span>{app.status === "Accepted" ? "Congratulations!" : "Application in progress"}</span>
                  </div>

                  <div className="app-stages">
                    {STAGES.map((stage, i) => (
                      <div className="app-stages__step" key={stage}>
                        <span
                          className={`app-stages__dot${i <= reached ? " app-stages__dot--done" : ""}${
                            app.status === "Rejected" && i === reached - 1 ? " app-stages__dot--reject" : ""
                          }`}
                        />
                        <span className="app-stages__label">{stage}</span>
                      </div>
                    ))}
                    <div className="app-stages__step">
                      <span className={`app-stages__dot${app.status === "Accepted" ? " app-stages__dot--end" : app.status === "Rejected" ? " app-stages__dot--reject" : ""}`} />
                      <span className="app-stages__label">{app.status === "Rejected" ? "Closed" : "Result"}</span>
                    </div>
                  </div>

                  {expandedId === app.id && (
                    <div className="app-timeline">
                      {app.timeline.map((item, i) => (
                        <div className="app-timeline__item" key={i}>
                          <span className="app-timeline__dot" />
                          <div>
                            <strong>{item.label}</strong>
                            <span>{item.date}</span>
                          </div>
                        </div>
                      ))}
                      {app.status === "Interview" && (
                        <div className="app-timeline__callout">
                          Interview is scheduled — prepare your portfolio.
                        </div>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        ) : (
          <div className="card card--alt applications__empty">
            <h3>No applications yet</h3>
            <p style={{ color: "rgba(255,255,255,.8)" }}>Start applying and tracked applications will appear here.</p>
            <Link to="/jobs" className="cta-btn cta-btn--orange">
              <span className="cta-btn__play" /> Find Jobs
            </Link>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default ApplicationsPage;