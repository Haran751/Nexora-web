import { useState } from "react";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import useScrollReveal from "../hooks/useScrollReveal.js";
import { jdJobs } from "../lib/jobsData.js";

const VIEWS = ["Dashboard", "My Jobs", "Candidates"];

const initialJobs = jdJobs.slice(0, 5).map((j) => ({
  id: String(j.id),
  title: j.title,
  company: "Your Company",
  status: "Active",
  applicants: 8 + (j.id * 3) % 12,
  type: j.type,
  workMode: j.workMode,
  location: j.location,
  salary: j.salary,
  deadline: j.deadline,
}));

const candidatePool = [
  { name: "Aisyah Putri", job: "Frontend Developer Intern", match: 96, status: "In Review" },
  { name: "Rizky Pratama", job: "Frontend Developer Intern", match: 88, status: "Shortlisted" },
  { name: "Dinda Ayu", job: "UI/UX Designer Grad", match: 91, status: "Interview" },
  { name: "Bayu Nugroho", job: "Data Analyst (Entry)", match: 74, status: "Applied" },
  { name: "Salsabila Zahra", job: "Marketing Assistant", match: 81, status: "Shortlisted" },
  { name: "Fajar Ramadhan", job: "Backend Developer Intern", match: 69, status: "Rejected" },
];

function StatCard({ label, value }) {
  return (
    <div className="card emp-stat">
      <span className="emp-stat__label">{label}</span>
      <b className="emp-stat__value">{value}</b>
    </div>
  );
}

export default function EmployerDashboardPage() {
  const [view, setView] = useState("Dashboard");
  const [jobs, setJobs] = useState(initialJobs);
  const [candidates, setCandidates] = useState(candidatePool);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", requirements: "", type: "Internship", workMode: "Hybrid", location: "", salary: "", deadline: "" });
  const revealRef = useScrollReveal();

  const activeCount = jobs.filter((j) => j.status === "Active").length;
  const applicants = jobs.reduce((sum, j) => sum + j.applicants, 0);

  const createJob = (e) => {
    e.preventDefault();
    const job = {
      id: `new-${Date.now()}`,
      title: form.title || "Untitled Job",
      company: "Your Company",
      status: "Draft",
      applicants: 0,
      type: form.type,
      workMode: form.workMode,
      location: form.location || "Remote",
      salary: form.salary || "Negotiable",
      deadline: form.deadline || "TBD",
    };
    setJobs((prev) => [job, ...prev]);
    setShowForm(false);
    setForm({ title: "", description: "", requirements: "", type: "Internship", workMode: "Hybrid", location: "", salary: "", deadline: "" });
  };

  const setStatus = (id, status) => {
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, status } : j)));
  };

  return (
    <div className="page">
      <Navbar variant="employer" onEmployerView={setView} />
      <main className="page__body emp" ref={revealRef}>
        <div className="emp-layout">
          <aside className="emp-sidebar">
            <h3 className="emp-sidebar__brand">Employer</h3>
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
            {view === "Dashboard" && (
              <>
                <div className="emp-head">
                  <h2>Dashboard</h2>
                  <p>An overview of your hiring activity.</p>
                </div>
                <div className="emp-stats">
<StatCard label="Total Jobs" value={jobs.length} />
              <StatCard label="Active" value={activeCount} />
              <StatCard label="Applicants" value={applicants} />
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
                  <form className="card emp-form" onSubmit={createJob} noValidate>
                    <h3>Create Job</h3>
                    <div className="emp-form__grid">
                      <div className="profile-input">
                        <label>Title</label>
                        <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Frontend Developer Intern" />
                      </div>
                      <div className="profile-input">
                        <label>Location</label>
                        <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Jakarta" />
                      </div>
                      <div className="profile-input">
                        <label>Salary</label>
                        <input value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} placeholder="$800/mo" />
                      </div>
                      <div className="profile-input">
                        <label>Deadline</label>
                        <input value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} placeholder="Sep 30, 2026" />
                      </div>
                      <div className="profile-input">
                        <label>Job Type</label>
                        <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                          <option>Internship</option>
                          <option>Entry Level</option>
                          <option>Part-Time</option>
                          <option>Freelance</option>
                        </select>
                      </div>
                      <div className="profile-input">
                        <label>Work Mode</label>
                        <select value={form.workMode} onChange={(e) => setForm({ ...form, workMode: e.target.value })}>
                          <option>Remote</option>
                          <option>Hybrid</option>
                          <option>On-site</option>
                        </select>
                      </div>
                    </div>
                    <div className="profile-input">
                      <label>Description</label>
                      <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the role…" />
                    </div>
                    <div className="profile-input">
                      <label>Requirements</label>
                      <textarea rows={3} value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} placeholder="One requirement per line…" />
                    </div>
                    <button type="submit" className="cta-btn cta-btn--orange" style={{ marginTop: 8 }}>
                      <span className="cta-btn__play" /> Publish Job
                    </button>
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
                        <span className={`emp-status emp-status--${job.status.toLowerCase()}`}>{job.status}</span>
                      </div>
                      <div className="emp-job__bottom">
                        <span>{job.applicants} applicants</span>
                        <span>Deadline: {job.deadline}</span>
                        <div className="emp-job__actions">
                          <button className="emp-job__btn" onClick={() => setStatus(job.id, "Active")}>Activate</button>
                          <button className="emp-job__btn emp-job__btn--danger" onClick={() => setStatus(job.id, "Closed")}>Close</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {view === "Candidates" && (
              <>
                <div className="emp-head">
                  <h2>Candidates</h2>
                  <p>Review applicants across your jobs.</p>
                </div>
                <div className="emp-cand-list">
                  {candidates.map((c, i) => (
                    <div className="card emp-cand" key={i}>
                      <span className="emp-cand__avatar">{c.name.charAt(0)}</span>
                      <div className="emp-cand__info">
                        <strong>{c.name}</strong>
                        <span>{c.job}</span>
                        <span className="emp-cand__match">{c.match}% match</span>
                      </div>
                      <select
                        className="emp-cand__status"
                        value={c.status}
                        onChange={(e) =>
                          setCandidates((prev) =>
                            prev.map((cand, idx) => (idx === i ? { ...cand, status: e.target.value } : cand))
                          )
                        }
                      >
                        <option>Applied</option>
                        <option>In Review</option>
                        <option>Shortlisted</option>
                        <option>Interview</option>
                        <option>Accepted</option>
                        <option>Rejected</option>
                      </select>
                      <button className="view-job">View Profile</button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}