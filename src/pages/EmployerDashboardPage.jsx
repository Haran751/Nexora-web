import { useEffect, useState } from "react";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import useScrollReveal from "../hooks/useScrollReveal.js";
import { useAuth } from "../context/AuthContext.jsx";
import { fetchJobs, createJob as createJobService, updateJob as updateJobService } from "../services/jobsService.js";
import { getEmployerCandidates, updateCandidateStatus } from "../services/applicationsService.js";

const VIEWS = ["Dashboard", "My Jobs", "Candidates"];

function StatCard({ label, value }) {
  return (
    <div className="card emp-stat">
      <span className="emp-stat__label">{label}</span>
      <b className="emp-stat__value">{value}</b>
    </div>
  );
}

export default function EmployerDashboardPage() {
  const { user, profile } = useAuth();
  const [view, setView] = useState("Dashboard");
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    requirements: "",
    type: "Internship",
    workMode: "Hybrid",
    location: "Jakarta",
    salary: "$900/mo",
    deadline: "2026-09-30",
  });
  const revealRef = useScrollReveal();

  useEffect(() => {
    let active = true;
    async function loadData() {
      setLoading(true);
      try {
        const [jobsList, candList] = await Promise.all([
          fetchJobs({ employerId: user?.id }),
          getEmployerCandidates(user?.id),
        ]);
        if (active) {
          setJobs(jobsList);
          setCandidates(candList);
        }
      } catch (err) {
        console.error("EmployerDashboard load error:", err);
      } finally {
        if (active) setLoading(false);
      }
    }
    loadData();
    return () => {
      active = false;
    };
  }, [user?.id]);

  const activeCount = jobs.filter((j) => j.status === "Active").length;
  const totalApplicants = candidates.length || jobs.reduce((sum, j) => sum + (j.applicants || 0), 0);

  const handleCreateJob = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      alert("Job title is required");
      return;
    }
    setSubmitting(true);
    try {
      const companyName = profile?.companyName || profile?.name || "Your Company";
      const created = await createJobService(
        {
          ...form,
          company: companyName,
        },
        user?.id
      );
      setJobs((prev) => [created, ...prev]);
      setShowForm(false);
      setForm({
        title: "",
        description: "",
        requirements: "",
        type: "Internship",
        workMode: "Hybrid",
        location: "Jakarta",
        salary: "$900/mo",
        deadline: "2026-09-30",
      });
    } catch (err) {
      alert("Failed to create job: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetStatus = async (id, status) => {
    try {
      await updateJobService(id, { status });
      setJobs((prev) => prev.map((j) => (String(j.id) === String(id) ? { ...j, status } : j)));
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleCandidateStatusChange = async (candidateId, newStatus) => {
    try {
      await updateCandidateStatus(candidateId, newStatus);
      setCandidates((prev) =>
        prev.map((c) => (String(c.id) === String(candidateId) ? { ...c, status: newStatus } : c))
      );
    } catch (err) {
      console.error("Failed to update candidate status:", err);
    }
  };

  return (
    <div className="page">
      <Navbar variant="employer" onEmployerView={setView} />
      <main className="page__body emp" ref={revealRef}>
        <div className="emp-layout">
          <aside className="emp-sidebar">
            <h3 className="emp-sidebar__brand">{profile?.companyName || "Employer Hub"}</h3>
            {VIEWS.map((v) => (
              <button
                key={v}
                className={`emp-sidebar__link${view === v ? " emp-sidebar__link--active" : ""}`}
                onClick={() => setView(v)}
              >
                {v}
              </button>
            ))}
          </aside>

          <section className="emp-main">
            {loading ? (
              <div className="card card--alt" style={{ textAlign: "center", padding: 40 }}>
                <p style={{ color: "rgba(255,255,255,0.8)" }}>Loading employer dashboard...</p>
              </div>
            ) : (
              <>
                {view === "Dashboard" && (
                  <>
                    <div className="emp-head">
                      <h2>Dashboard</h2>
                      <p>An overview of hiring activity for {profile?.companyName || "your company"}.</p>
                    </div>
                    <div className="emp-stats">
                      <StatCard label="Total Jobs" value={jobs.length} />
                      <StatCard label="Active" value={activeCount} />
                      <StatCard label="Applicants" value={totalApplicants} />
                      <StatCard label="Interviews" value={candidates.filter((c) => c.status === "Interview").length} />
                    </div>
                  </>
                )}

                {view === "My Jobs" && (
                  <>
                    <div className="emp-head emp-head--row">
                      <div>
                        <h2>My Jobs</h2>
                        <p>Manage your posted opportunities.</p>
                      </div>
                      <button className="cta-btn cta-btn--orange emp-add-btn" onClick={() => setShowForm((s) => !s)}>
                        <span className="cta-btn__play" /> {showForm ? "Cancel" : "Create Job"}
                      </button>
                    </div>

                    {showForm && (
                      <form className="card emp-form" onSubmit={handleCreateJob} noValidate>
                        <h3>Create Job</h3>
                        <div className="emp-form__grid">
                          <div className="profile-input">
                            <label>Job Title</label>
                            <input
                              value={form.title}
                              onChange={(e) => setForm({ ...form, title: e.target.value })}
                              placeholder="e.g. Frontend Developer Intern"
                              required
                            />
                          </div>
                          <div className="profile-input">
                            <label>Location</label>
                            <input
                              value={form.location}
                              onChange={(e) => setForm({ ...form, location: e.target.value })}
                              placeholder="Jakarta"
                            />
                          </div>
                          <div className="profile-input">
                            <label>Salary</label>
                            <input
                              value={form.salary}
                              onChange={(e) => setForm({ ...form, salary: e.target.value })}
                              placeholder="$800/mo"
                            />
                          </div>
                          <div className="profile-input">
                            <label>Work Mode</label>
                            <select
                              value={form.workMode}
                              onChange={(e) => setForm({ ...form, workMode: e.target.value })}
                            >
                              <option>Hybrid</option>
                              <option>Remote</option>
                              <option>On-site</option>
                            </select>
                          </div>
                          <div className="profile-input">
                            <label>Type</label>
                            <select
                              value={form.type}
                              onChange={(e) => setForm({ ...form, type: e.target.value })}
                            >
                              <option>Internship</option>
                              <option>Entry Level</option>
                              <option>Part-Time</option>
                              <option>Full-time</option>
                            </select>
                          </div>
                          <div className="profile-input">
                            <label>Application Deadline</label>
                            <input
                              type="date"
                              value={form.deadline}
                              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="profile-input" style={{ marginTop: 12 }}>
                          <label>Job Description</label>
                          <textarea
                            rows={3}
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            placeholder="Describe the responsibilities and scope of this role..."
                          />
                        </div>

                        <div className="profile-input" style={{ marginTop: 12 }}>
                          <label>Requirements (one per line)</label>
                          <textarea
                            rows={3}
                            value={form.requirements}
                            onChange={(e) => setForm({ ...form, requirements: e.target.value })}
                            placeholder="React fundamentals&#10;Good design sense&#10;Portfolio demonstrating work"
                          />
                        </div>

                        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                          <button type="submit" className="cta-btn cta-btn--pink" disabled={submitting}>
                            <span className="cta-btn__play" /> {submitting ? "Publishing…" : "Publish Vacancy"}
                          </button>
                          <button type="button" className="modal-card__cancel" onClick={() => setShowForm(false)}>
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}

                    <div className="emp-job-list">
                      {jobs.map((job) => (
                        <div className="card emp-job" key={job.id}>
                          <div className="emp-job__top">
                            <div>
                              <h3>{job.title}</h3>
                              <span className="emp-job__meta">
                                {job.type} · {job.workMode} · {job.location} · {job.salary}
                              </span>
                            </div>
                            <span className={`emp-status emp-status--${(job.status || "active").toLowerCase()}`}>
                              {job.status}
                            </span>
                          </div>
                          <div className="emp-job__bottom">
                            <span>{job.applicants || 0} applicants</span>
                            <span>Deadline: {job.deadline || "Open"}</span>
                            <div className="emp-job__actions">
                              <button className="emp-job__btn" onClick={() => handleSetStatus(job.id, "Active")}>
                                Activate
                              </button>
                              <button
                                className="emp-job__btn emp-job__btn--danger"
                                onClick={() => handleSetStatus(job.id, "Closed")}
                              >
                                Close
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                      {jobs.length === 0 && (
                        <div className="card card--alt" style={{ textAlign: "center", padding: 32 }}>
                          <p style={{ color: "rgba(255,255,255,0.8)" }}>No jobs posted yet. Click "Create Job" above to post your first vacancy.</p>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {view === "Candidates" && (
                  <>
                    <div className="emp-head">
                      <h2>Candidates</h2>
                      <p>Review applicants across your posted jobs.</p>
                    </div>
                    <div className="emp-cand-list">
                      {candidates.map((c, i) => (
                        <div className="card emp-cand" key={c.id || i}>
                          <span className="emp-cand__avatar">{(c.name || "C").charAt(0)}</span>
                          <div className="emp-cand__info">
                            <strong>{c.name}</strong>
                            <span>{c.job}</span>
                            <span className="emp-cand__match">{c.match || 90}% match</span>
                          </div>
                          <select
                            className="emp-cand__status"
                            value={c.status}
                            onChange={(e) => handleCandidateStatusChange(c.id, e.target.value)}
                          >
                            <option>Applied</option>
                            <option>In Review</option>
                            <option>Shortlisted</option>
                            <option>Interview</option>
                            <option>Accepted</option>
                            <option>Rejected</option>
                          </select>
                        </div>
                      ))}
                      {candidates.length === 0 && (
                        <div className="card card--alt" style={{ textAlign: "center", padding: 32 }}>
                          <p style={{ color: "rgba(255,255,255,0.8)" }}>No candidate applications received yet.</p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}