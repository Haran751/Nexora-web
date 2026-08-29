import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import useScrollReveal from "../hooks/useScrollReveal.js";
import { getUserApplications } from "../services/applicationsService.js";
import { useAuth } from "../context/AuthContext.jsx";

const STAGES = ["Applied", "Viewed", "In Review", "Shortlisted", "Interview"];
const TABS = ["All", "Applied", "In Review", "Interview", "Accepted", "Rejected"];

const statusClass = (status) => "app-badge--" + (status || "").toLowerCase().replace(/\s+/g, "");

function stageIndex(status) {
  if (status === "Accepted" || status === "Rejected") return STAGES.length;
  const i = STAGES.indexOf(status);
  return i >= 0 ? i : 0;
}

export default function ApplicationsPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState("All");
  const [expandedId, setExpandedId] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function loadData() {
      setLoading(true);
      try {
        const data = await getUserApplications(user?.id);
        if (active) setApplications(data);
      } catch (err) {
        console.error("getUserApplications error:", err);
      } finally {
        if (active) setLoading(false);
      }
    }
    loadData();
    return () => {
      active = false;
    };
  }, [user?.id]);

  const visible = tab === "All" ? applications : applications.filter((a) => a.status === tab);
  const revealRef = useScrollReveal([visible]);

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

        {loading ? (
          <div className="card card--alt" style={{ textAlign: "center", padding: 32 }}>
            <p style={{ color: "rgba(255,255,255,.8)" }}>Loading applications...</p>
          </div>
        ) : visible.length > 0 ? (
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
                    <span className="app-card__logo">{(app.company || "C").charAt(0)}</span>
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
                      <span
                        className={`app-stages__dot${
                          app.status === "Accepted"
                            ? " app-stages__dot--end"
                            : app.status === "Rejected"
                            ? " app-stages__dot--reject"
                            : ""
                        }`}
                      />
                      <span className="app-stages__label">{app.status === "Rejected" ? "Closed" : "Result"}</span>
                    </div>
                  </div>

                  {expandedId === app.id && (
                    <div className="app-timeline">
                      {app.timeline?.map((item, i) => (
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