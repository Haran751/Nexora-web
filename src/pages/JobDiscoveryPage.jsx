import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import HeroArt from "../components/HeroArt.jsx";
import useScrollReveal from "../hooks/useScrollReveal.js";
import { jdJobs, daysLeft } from "../lib/jobsData.js";
import { loadSavedJobs, saveSavedJobs, toggleSavedJob } from "../lib/savedJobs.js";

const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" strokeLinecap="round" />
  </svg>
);

const BookmarkIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" strokeLinejoin="round" />
  </svg>
);

const MapPin = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11z" strokeLinejoin="round" />
    <circle cx="12" cy="10" r="2.6" />
  </svg>
);

const parseSalary = (s) => {
  const match = String(s).match(/[\d.]+/);
  if (!match) return 0;
  const n = parseFloat(match[0]);
  return /k/i.test(s) ? n * 1000 : n;
};

const typeOptions = [
  { label: "Internship", defaultValue: true },
  { label: "Entry Level", defaultValue: false },
  { label: "Part-Time", defaultValue: false },
  { label: "Freelance", defaultValue: false },
];

const modeOptions = ["Remote", "Hybrid", "On-site"];
const industryOptions = ["Technology", "Design", "Data & Analytics", "Marketing", "Fintech", "Corporate"];
const durationOptions = ["Any", "3 months", "4 months", "6 months", "Full-time", "1 year"];
const deadlineOptions = ["Any", "Soon (≤ 7 days)", "Within a month", "Flexible"];

export default function JobDiscoveryPage() {
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [bookmarked, setBookmarked] = useState(loadSavedJobs);
  const [checkedTypes, setCheckedTypes] = useState(() =>
    new Set(typeOptions.filter((o) => o.defaultValue).map((o) => o.label))
  );
  const [checkedModes, setCheckedModes] = useState(() => new Set());
  const [checkedIndustries, setCheckedIndustries] = useState(() => new Set());
  const [salaryMax, setSalaryMax] = useState(1500);
  const [duration, setDuration] = useState("Any");
  const [deadline, setDeadline] = useState("Any");
  const revealRef = useScrollReveal();

  const toggleBookmark = (id) => {
    setBookmarked((prev) => {
      const next = toggleSavedJob(prev, id);
      saveSavedJobs(next);
      return next;
    });
  };

  const toggleSet = (setter, value) => {
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  };

  const visible = useMemo(() => {
    return jdJobs.filter((job) => {
      if (query && !(job.title + job.company).toLowerCase().includes(query.toLowerCase())) return false;
      if (checkedTypes.size > 0 && !checkedTypes.has(job.type)) return false;
      if (checkedModes.size > 0 && !checkedModes.has(job.workMode)) return false;
      if (checkedIndustries.size > 0 && !checkedIndustries.has(job.industry)) return false;
      if (parseSalary(job.salary) > salaryMax) return false;
      if (duration !== "Any" && job.duration !== duration) return false;
      const left = daysLeft(job.deadline);
      if (deadline === "Soon (≤ 7 days)" && left > 7) return false;
      if (deadline === "Within a month" && (left > 30 || left < 0)) return false;
      if (deadline === "Flexible" && left < 30) return false;
      return true;
    });
  }, [query, checkedTypes, checkedModes, checkedIndustries, salaryMax, duration, deadline]);

  return (
    <div className="page">
      <Navbar />
      <main className="page__body" ref={revealRef}>
        <div className="jd-hero">
          <div>
            <h2>Find Your Next Opportunity</h2>
            <p>Explore jobs matched just for you.</p>
            <div className="searchbar">
              <SearchIcon />
              <input
                placeholder="Search jobs, companies, keywords…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") setQuery(search.trim());
                }}
              />
            </div>
          </div>
          <div className="jd-hero__art">
            <HeroArt width={767} height={633} />
          </div>
        </div>

        <div className="jd-layout">
          {/* Filters */}
          <aside className="jd-filters">
            <div className="filter-group">
              <h4>Job Type</h4>
              {typeOptions.map((opt) => (
                <label className="check" key={opt.label}>
                  <input
                    type="checkbox"
                    checked={checkedTypes.has(opt.label)}
                    onChange={() => toggleSet(setCheckedTypes, opt.label)}
                  />
                  {opt.label}
                </label>
              ))}
            </div>

            <div className="filter-group">
              <h4>Work Mode</h4>
              {modeOptions.map((opt) => (
                <label className="check" key={opt}>
                  <input
                    type="checkbox"
                    checked={checkedModes.has(opt)}
                    onChange={() => toggleSet(setCheckedModes, opt)}
                  />
                  {opt}
                </label>
              ))}
            </div>

            <div className="filter-group">
              <h4>Salary Range</h4>
              <div className="salary-filter">
                <input
                  type="range"
                  min="300"
                  max="2000"
                  step="50"
                  value={salaryMax}
                  onChange={(e) => setSalaryMax(Number(e.target.value))}
                />
                <span className="salary-filter__value">
                  up to ${salaryMax >= 1000 ? (salaryMax / 1000) + "k" : salaryMax}/mo
                </span>
              </div>
            </div>

            <div className="filter-group">
              <h4>Industry</h4>
              {industryOptions.map((opt) => (
                <label className="check" key={opt}>
                  <input
                    type="checkbox"
                    checked={checkedIndustries.has(opt)}
                    onChange={() => toggleSet(setCheckedIndustries, opt)}
                  />
                  {opt}
                </label>
              ))}
            </div>

            <div className="filter-group">
              <h4>Duration</h4>
              {durationOptions.map((opt) => (
                <label className="check" key={opt}>
                  <input
                    type="radio"
                    name="duration-filter"
                    checked={duration === opt}
                    onChange={() => setDuration(opt)}
                  />
                  {opt}
                </label>
              ))}
            </div>

            <div className="filter-group">
              <h4>Deadline</h4>
              {deadlineOptions.map((opt) => (
                <label className="check" key={opt}>
                  <input
                    type="radio"
                    name="deadline-filter"
                    checked={deadline === opt}
                    onChange={() => setDeadline(opt)}
                  />
                  {opt}
                </label>
              ))}
            </div>

            <div className="filter-group">
              <h4>Location</h4>
              <div className="map-thumb">
                <span style={{ color: "var(--accent-orange)" }}>
                  <MapPin />
                </span>
              </div>
            </div>
          </aside>

          {/* Job list */}
          <div>
            <div className="jd-header">
              <strong>{visible.length} Jobs Found</strong>
              <span>Sorted by best match</span>
            </div>
            <div className="job-list">
              {visible.map((job) => (
                <article className="job-card scroll-reveal" key={job.id} data-delay="40">
                  <div className="job-card__match">
                    <b>{job.match}%</b>
                    <span>Match</span>
                  </div>
                  <div className="job-card__body">
                    <button
                      className="job-card__bookmark"
                      aria-label="Save job"
                      onClick={() => toggleBookmark(job.id)}
                      style={{ color: bookmarked.has(String(job.id)) ? "var(--accent-orange)" : "rgba(232,136,60,.7)" }}
                    >
                      <BookmarkIcon />
                    </button>
                    <h3 className="job-card__title">{job.title}</h3>
                    <p className="job-card__company">{job.company}</p>
                    <div className="job-tags">
                      {job.tags.map((tag) => (
                        <span className="job-tag" key={tag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                    <Link to={`/jobs/${job.id}`} className="view-job">
                      [ View Job ]
                    </Link>
                  </div>
                </article>
              ))}
              {visible.length === 0 && (
                <div className="card card--alt" style={{ textAlign: "center" }}>
                  <h3>No jobs found</h3>
                  <p style={{ color: "rgba(255,255,255,.8)" }}>
                    Try adjusting your search or filters.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}