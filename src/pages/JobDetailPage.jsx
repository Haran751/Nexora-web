import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { fetchJobById } from "../services/jobsService.js";
import { submitApplication } from "../services/applicationsService.js";
import { useAuth } from "../context/AuthContext.jsx";

const breakdownKeys = [
  { key: "skills", label: "Skill Match" },
  { key: "location", label: "Location" },
  { key: "experience", label: "Experience" },
  { key: "workMode", label: "Work Mode" },
];

export default function JobDetailPage() {
  const { id } = useParams();
  const { user, profile } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    let active = true;
    async function loadJob() {
      setLoading(true);
      try {
        const data = await fetchJobById(id);
        if (active) setJob(data);
      } catch (err) {
        console.error("fetchJobById error:", err);
      } finally {
        if (active) setLoading(false);
      }
    }
    loadJob();
    return () => {
      active = false;
    };
  }, [id]);

  const handleConfirmApply = async () => {
    if (!job) return;
    setSubmitting(true);
    try {
      await submitApplication({
        jobId: job.id,
        jobTitle: job.title,
        company: job.company,
        applicantId: user?.id,
        applicantName: profile?.name || user?.email?.split("@")[0] || "Applicant",
        coverNote: profile?.about || "",
      });
      setSent(true);
    } catch (err) {
      alert("Failed to submit application: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <Navbar />
        <main className="page__body" style={{ maxWidth: 640, textAlign: "center", padding: 60 }}>
          <p style={{ color: "rgba(255,255,255,0.8)" }}>Loading job details...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="page">
        <Navbar />
        <main className="page__body" style={{ maxWidth: 640 }}>
          <div className="card card--alt" style={{ textAlign: "center", padding: 48 }}>
            <h3>Job not found</h3>
            <p style={{ color: "rgba(255,255,255,.8)" }}>This job may have been removed or does not exist.</p>
            <Link to="/jobs" className="cta-btn cta-btn--orange" style={{ marginTop: 14 }}>
              <span className="cta-btn__play" /> Browse Jobs
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const tags = job.tags || [job.location, job.workMode, job.salary, job.posted];
  const maxSkills = profile?.skills?.length ? profile.skills.slice(0, 5) : ["-"];
  const breakdown = job.matchBreakdown || { skills: 90, location: 95, experience: 85, workMode: 90 };

  return (
    <div className="page">
      <Navbar />
      <main className="page__body job-detail">
        <div className="jd-header">
          <strong>{job.title}</strong>
          <Link to="/jobs" className="view-job">
            ← Back to jobs
          </Link>
        </div>

        <div className="job-detail__layout">
          {/* Left — job info */}
          <section className="card job-info">
            <div className="job-info__top">
              <div>
                <h3 className="job-info__title">{job.title}</h3>
                <p className="job-info__company">{job.company}</p>
              </div>
              <span className="job-detail__match-badge">{job.match || 92}% Match</span>
            </div>

            <div className="job-tags">
              {tags.map((tag) => (
                <span className="job-tag" key={tag}>
                  {tag}
                </span>
              ))}
            </div>

            <h4 className="job-info__subhead">Description</h4>
            <p className="job-info__text">{job.description}</p>

            <h4 className="job-info__subhead">Requirements</h4>
            <ul className="job-info__list">
              {job.requirements?.map((req) => (
                <li key={req}>{req}</li>
              ))}
            </ul>

            <div className="job-info__meta">
              <span><b>Salary</b> {job.salary}</span>
              <span><b>Location</b> {job.location}</span>
              <span><b>Work Mode</b> {job.workMode}</span>
              <span><b>Deadline</b> {job.deadline || "Flexible"}</span>
            </div>

            <button
              className="cta-btn cta-btn--pink job-info__apply"
              onClick={() => {
                setSent(false);
                setShowModal(true);
              }}
            >
              <span className="cta-btn__play" /> Easy Apply
            </button>
          </section>

          {/* Right — match breakdown */}
          <aside className="card match-card">
            <h3>Match Breakdown</h3>
            <div className="match-card__score">
              <b className="job-card__match-big">{job.match || 92}%</b>
              <span>Overall Match</span>
            </div>
            {breakdownKeys.map(({ key, label }) => (
              <div className="match-bar" key={key}>
                <div className="match-bar__meta">
                  <span>{label}</span>
                  <strong>{breakdown[key] || 90}%</strong>
                </div>
                <div className="progress-track match-bar__track">
                  <div
                    className="progress-track__fill progress-track__fill--fixed"
                    style={{ width: `${breakdown[key] || 90}%` }}
                  />
                </div>
              </div>
            ))}
            <p className="match-card__note">
              Based on your profile skills, experience, and preferences.
            </p>
          </aside>
        </div>

        {showModal && (
          <div className="modal-overlay" onClick={() => { setShowModal(false); setSent(false); }}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              {!sent ? (
                <>
                  <h3>Confirm Application</h3>
                  <p className="modal-card__sub">
                    Applying to <b>{job.title}</b> at <b>{job.company}</b>
                  </p>
                  <div className="modal-card__preview">
                    <div className="modal-card__row">
                      <span>Name</span>
                      <strong>{profile.name || user?.email || "User"}</strong>
                    </div>
                    <div className="modal-card__row">
                      <span>Skills</span>
                      <strong>{maxSkills.join(", ")}</strong>
                    </div>
                    <div className="modal-card__row">
                      <span>Profile Summary</span>
                      <strong>{profile.about?.trim() ? profile.about.slice(0, 120) + "…" : "Standard profile"}</strong>
                    </div>
                  </div>
                  <div className="modal-card__actions">
                    <button
                      className="cta-btn cta-btn--pink"
                      onClick={handleConfirmApply}
                      disabled={submitting}
                    >
                      <span className="cta-btn__play" /> {submitting ? "Submitting…" : "Confirm"}
                    </button>
                    <button
                      className="modal-card__cancel"
                      onClick={() => { setShowModal(false); setSent(false); }}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <div className="modal-card__success">
                  <span className="checkmark">✓</span>
                  <h3>Application Sent!</h3>
                  <p>Your application is now in review. Track its progress anytime.</p>
                  <Link to="/applications" className="cta-btn cta-btn--orange">
                    <span className="cta-btn__play" /> View Application Tracker
                  </Link>
                  <button
                    className="modal-card__cancel"
                    onClick={() => { setShowModal(false); setSent(false); }}
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}