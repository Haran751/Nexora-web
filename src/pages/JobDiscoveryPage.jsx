import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import HeroArt from "../components/HeroArt.jsx";
import useScrollReveal from "../hooks/useScrollReveal.js";
import { daysLeft } from "../lib/jobsData.js";
import { useAuth } from "../context/AuthContext.jsx";
import { fetchJobs } from "../services/jobsService.js";
import { fetchSavedJobIds, toggleSavedJobId } from "../services/savedJobsService.js";

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

const shortDescription = (job) => {
  const text =
    job.description ||
    `${job.title} at ${job.company} — an opening in ${job.industry || "your field"}.`;
  return text.length > 130 ? text.slice(0, 130).replace(/\s+\S*$/, "") + "…" : text;
};

const parseSalary = (s) => {
  const match = String(s).match(/[\d.]+/);
  if (!match) return 0;
  const n = parseFloat(match[0]);
  return /k/i.test(s) ? n * 1000 : n;
};

const typeOptions = [
  { label: "Internship" },
  { label: "Entry Level" },
  { label: "Part-Time" },
  { label: "Freelance" },
  { label: "Full-time" },
];

const modeOptions = ["Remote", "Hybrid", "On-site"];
const industryOptions = ["Technology", "Design", "Data & Analytics", "Marketing", "Fintech", "Corporate"];
const durationOptions = ["Any", "3 months", "4 months", "6 months", "Full-time", "1 year"];
const deadlineOptions = ["Any", "Soon (≤ 7 days)", "Within a month", "Flexible"];

export default function JobDiscoveryPage() {
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [bookmarked, setBookmarked] = useState(() => new Set());
  const [checkedTypes, setCheckedTypes] = useState(() => new Set());
  const [checkedModes, setCheckedModes] = useState(() => new Set());
  const [checkedIndustries, setCheckedIndustries] = useState(() => new Set());
  const [salaryMax, setSalaryMax] = useState(2000);
  const [duration, setDuration] = useState("Any");
  const [deadline, setDeadline] = useState("Any");

  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(search.trim());
    }, 200);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let active = true;
    async function loadData() {
      setLoading(true);
      try {
        const [jobsList, savedSet] = await Promise.all([
          fetchJobs({ status: "Active" }),
          fetchSavedJobIds(user?.id),
        ]);
        if (active) {
          setJobs(jobsList);
          setBookmarked(savedSet);
        }
      } catch (err) {
        console.error("Failed to load discovery data:", err);
      } finally {
        if (active) setLoading(false);
      }
    }
    loadData();
    return () => {
      active = false;
    };
  }, [user?.id]);

  const toggleBookmark = async (id) => {
    const next = await toggleSavedJobId(user?.id, id, bookmarked);
    setBookmarked(new Set(next));
  };

  const toggleSet = (setter, value) => {
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  };

  const clearFilters = () => {
    setQuery("");
    setSearch("");
    setCheckedTypes(new Set());
    setCheckedModes(new Set());
    setCheckedIndustries(new Set());
    setSalaryMax(2000);
    setDuration("Any");
    setDeadline("Any");
  };

  const activeFilterCount =
    checkedTypes.size + checkedModes.size + checkedIndustries.size + (duration !== "Any" ? 1 : 0) + (deadline !== "Any" ? 1 : 0) + (query ? 1 : 0);

  const visible = useMemo(() => {
    return jobs.filter((job) => {
      if (query && !(job.title + " " + job.company).toLowerCase().includes(query.toLowerCase())) return false;
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
  }, [jobs, query, checkedTypes, checkedModes, checkedIndustries, salaryMax, duration, deadline]);

  const revealRef = useScrollReveal([visible]);

  return (
    <div className="page">
      {user && (
        <Navbar variant={role === "employer" ? "employer" : "app"} onEmployerView={() => navigate("/employer")} />
      )}
      <main className="page__body" ref={revealRef}>
        <div className="jd-backbar">
          <button className="signup__back" onClick={() => navigate(-1)} aria-label="Go back">
            <span aria-hidden="true">←</span> Back
          </button>
        </div>
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

            <div className="jd-hero__stats">
              <div className="jd-stat">
                <b>{loading ? "…" : jobs.length}</b>
                <span>Live roles</span>
              </div>
              <div className="jd-stat">
                <b>{loading ? "…" : visible.length}</b>
                <span>Matches</span>
              </div>
              <div className="jd-stat">
                <b>85+</b>
                <span>Companies</span>
              </div>
              <div className="jd-stat">
                <b>24/7</b>
                <span>Apply anytime</span>
              </div>
            </div>
          </div>
          <div className="jd-hero__art">
            <HeroArt width={767} height={633} />
          </div>
        </div>

        <div className="jd-layout">
          {/* Filters */}
          <aside className="jd-filters">
            <div className="jd-filters__head">
              <strong>Filters</strong>
              {activeFilterCount > 0 && (
                <button className="jd-filters__clear" onClick={clearFilters} title="Clear all filters">
                  Clear all ({activeFilterCount})
                </button>
              )}
            </div>

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
                  max="2500"
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
              <div>
                <strong>{loading ? "Loading vacancies..." : `${visible.length} Jobs Found`}</strong>
                {query && <span className="jd-header__query">for “{query}”</span>}
              </div>
              <span>Sorted by best match</span>
            </div>
            <div className="job-list">
              {visible.map((job) => {
                const tags = job.tags || [job.location, job.workMode, job.salary, job.posted];
                return (
                  <article className="job-card scroll-reveal" key={job.id} data-delay="40">
                    <div className="job-card__match">
                      <b>{job.match || 90}%</b>
                      <span>Match</span>
                      <div className="match-mini-track">
                        <div className="match-mini-track__fill" style={{ width: `${job.match || 90}%` }} />
                      </div>
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

                      <p className="job-card__desc">{shortDescription(job)}</p>

                      <div className="job-tags">
                        {tags.map((tag) => (
                          <span className="job-tag" key={tag}>
                            {tag}
                          </span>
                        ))}
                      </div>
                      <Link to={`/jobs/${job.id}`} className="view-job view-job--btn">
                        View Job
                      </Link>
                    </div>
                  </article>
                );
              })}
              {!loading && visible.length === 0 && (
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