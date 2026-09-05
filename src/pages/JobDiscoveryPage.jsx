import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import useScrollReveal from "../hooks/useScrollReveal.js";
import { daysLeft } from "../lib/jobsData.js";
import { useAuth } from "../context/AuthContext.jsx";
import { fetchJobs } from "../services/jobsService.js";
import { fetchSavedJobIds, toggleSavedJobId } from "../services/savedJobsService.js";

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" strokeLinecap="round" />
  </svg>
);

const PinIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11z" strokeLinejoin="round" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);

const BriefcaseIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

const CardIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </svg>
);

const BookmarkIcon = ({ filled = false }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" strokeLinejoin="round" />
  </svg>
);

const SortIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <line x1="4" y1="6" x2="20" y2="6" />
    <circle cx="14" cy="6" r="2" fill="currentColor" />
    <line x1="4" y1="12" x2="20" y2="12" />
    <circle cx="8" cy="12" r="2" fill="currentColor" />
    <line x1="4" y1="18" x2="20" y2="18" />
    <circle cx="16" cy="18" r="2" fill="currentColor" />
  </svg>
);

const parseSalary = (s) => {
  const match = String(s).match(/[\d,.]+/);
  if (!match) return 0;
  const n = parseFloat(match[0].replace(/,/g, ""));
  if (/k/i.test(s)) return n * 1000;
  if (/\/hr/i.test(s)) return n * 160; // normalize hourly to approx monthly
  return n;
};

const workingScheduleOptions = [
  "Full time",
  "Part time",
  "Internship",
  "Project work",
  "Volunteering",
];

const employmentTypeOptions = [
  "Full day",
  "Flexible schedule",
  "Shift work",
  "Distant work",
  "Shift method",
];

const locationOptions = ["All Locations", "San Francisco, CA", "California, CA", "New York, NY", "Jakarta, ID", "Bandung, ID", "Remote"];
const experienceOptions = ["All Levels", "Junior level", "Middle level", "Senior level", "Intern"];
const payPeriodOptions = ["Per month", "Per hour", "Per year"];

export default function JobDiscoveryPage() {
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [bookmarked, setBookmarked] = useState(() => new Set());
  
  // Top bar filters
  const [locationFilter, setLocationFilter] = useState("All Locations");
  const [experienceFilter, setExperienceFilter] = useState("All Levels");
  const [payPeriodFilter, setPayPeriodFilter] = useState("Per month");
  const [salaryMin, setSalaryMin] = useState(300);
  const [salaryMax, setSalaryMax] = useState(3500);
  const [sortBy, setSortBy] = useState("last_updated");

  // Sidebar filters
  const [checkedSchedules, setCheckedSchedules] = useState(() => new Set());
  const [checkedEmploymentTypes, setCheckedEmploymentTypes] = useState(() => new Set());

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
    setLocationFilter("All Locations");
    setExperienceFilter("All Levels");
    setPayPeriodFilter("Per month");
    setSalaryMin(300);
    setSalaryMax(3500);
    setCheckedSchedules(new Set());
    setCheckedEmploymentTypes(new Set());
    setSortBy("last_updated");
  };

  const activeFilterCount =
    (query ? 1 : 0) +
    (locationFilter !== "All Locations" ? 1 : 0) +
    (experienceFilter !== "All Levels" ? 1 : 0) +
    checkedSchedules.size +
    checkedEmploymentTypes.size +
    (salaryMax < 3500 ? 1 : 0);

  const visible = useMemo(() => {
    let list = jobs.filter((job) => {
      // Query filter
      if (query) {
        const full = `${job.title} ${job.company} ${job.location} ${job.industry || ""} ${(job.tags || []).join(" ")}`.toLowerCase();
        if (!full.includes(query.toLowerCase())) return false;
      }

      // Location filter
      if (locationFilter !== "All Locations") {
        if (locationFilter === "Remote") {
          if (job.workMode !== "Remote" && !job.location?.toLowerCase().includes("remote")) return false;
        } else if (!job.location?.toLowerCase().includes(locationFilter.toLowerCase())) {
          return false;
        }
      }

      // Experience filter
      if (experienceFilter !== "All Levels") {
        const exp = (job.experienceLevel || "").toLowerCase();
        const target = experienceFilter.toLowerCase();
        const hasTag = (job.tags || []).some((t) => t.toLowerCase().includes(target));
        if (!exp.includes(target) && !hasTag && !job.title?.toLowerCase().includes(target.split(" ")[0])) {
          return false;
        }
      }

      // Schedule filter (Full time, Part time, Internship, etc.)
      if (checkedSchedules.size > 0) {
        let matchSchedule = false;
        const jobSchedule = (job.schedule || job.type || "").toLowerCase();
        const tags = (job.tags || []).map((t) => t.toLowerCase());
        for (const item of checkedSchedules) {
          const needle = item.toLowerCase();
          if (jobSchedule.includes(needle) || tags.some((t) => t.includes(needle))) {
            matchSchedule = true;
            break;
          }
        }
        if (!matchSchedule) return false;
      }

      // Employment type filter (Full day, Flexible schedule, Shift work, Distant work, etc.)
      if (checkedEmploymentTypes.size > 0) {
        let matchType = false;
        const jobEmp = (job.employmentType || "").toLowerCase();
        const jobWorkMode = (job.workMode || "").toLowerCase();
        const tags = (job.tags || []).map((t) => t.toLowerCase());
        for (const item of checkedEmploymentTypes) {
          const needle = item.toLowerCase();
          if (
            jobEmp.includes(needle) ||
            tags.some((t) => t.includes(needle)) ||
            (needle === "distant work" && jobWorkMode === "remote")
          ) {
            matchType = true;
            break;
          }
        }
        if (!matchType) return false;
      }

      // Salary filter
      const sal = job.salaryNum || parseSalary(job.salary);
      if (sal > salaryMax) return false;

      return true;
    });

    // Sorting
    if (sortBy === "salary_high") {
      list = [...list].sort((a, b) => (b.salaryNum || parseSalary(b.salary)) - (a.salaryNum || parseSalary(a.salary)));
    } else if (sortBy === "match_score") {
      list = [...list].sort((a, b) => (b.match || 90) - (a.match || 90));
    }

    return list;
  }, [jobs, query, locationFilter, experienceFilter, checkedSchedules, checkedEmploymentTypes, salaryMax, sortBy]);

  const revealRef = useScrollReveal([visible]);

  // Color mapping helper to give cards the signature pastel look from the design
  const getCardColorClass = (job, index) => {
    if (job.colorCard) return `disco-card--${job.colorCard}`;
    const colors = ["peach", "mint", "lavender", "sky", "pink", "lilac"];
    return `disco-card--${colors[index % colors.length]}`;
  };

  const getCompanyInitial = (name) => {
    return (name || "C").trim().charAt(0).toUpperCase();
  };

  return (
    <div className="page disco-page">
      {/* STICKY HEADER: navbar + topbar nempel jadi satu */}
      <div className="disco-sticky-header">
        {user && (
          <Navbar variant={role === "employer" ? "employer" : "app"} onEmployerView={() => navigate("/employer")} />
        )}
        {!user && <Navbar variant="landing" />}

        {/* TOP SEARCH & QUICK FILTERS BAR (from design) */}
        <div className="disco-topbar">
          <div className="disco-topbar__inner">
            {/* Role / Search Input */}
            <div className="disco-topbar__item disco-topbar__search">
              <SearchIcon />
              <input
                type="text"
                placeholder="Designer, Engineer, Marketing…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") setQuery(search.trim());
                }}
              />
              {search && (
                <button
                  type="button"
                  className="disco-topbar__clear-search"
                  onClick={() => {
                    setSearch("");
                    setQuery("");
                  }}
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="disco-topbar__divider" />

            {/* Work Location Dropdown */}
            <div className="disco-topbar__item disco-topbar__select-wrap">
              <PinIcon />
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                aria-label="Work location"
              >
                {locationOptions.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc === "All Locations" ? "Work location" : loc}
                  </option>
                ))}
              </select>
            </div>

            <div className="disco-topbar__divider" />

            {/* Experience Dropdown */}
            <div className="disco-topbar__item disco-topbar__select-wrap">
              <BriefcaseIcon />
              <select
                value={experienceFilter}
                onChange={(e) => setExperienceFilter(e.target.value)}
                aria-label="Experience level"
              >
                {experienceOptions.map((exp) => (
                  <option key={exp} value={exp}>
                    {exp === "All Levels" ? "Experience" : exp}
                  </option>
                ))}
              </select>
            </div>

            <div className="disco-topbar__divider" />

            {/* Pay Period Dropdown */}
            <div className="disco-topbar__item disco-topbar__select-wrap">
              <CardIcon />
              <select
                value={payPeriodFilter}
                onChange={(e) => setPayPeriodFilter(e.target.value)}
                aria-label="Pay frequency"
              >
                {payPeriodOptions.map((period) => (
                  <option key={period} value={period}>
                    {period}
                  </option>
                ))}
              </select>
            </div>

            <div className="disco-topbar__divider" />

            {/* Salary Range Slider */}
            <div className="disco-topbar__item disco-topbar__salary">
              <div className="disco-topbar__salary-labels">
                <span>Salary range</span>
                <strong>${salaryMin} - ${salaryMax >= 1000 ? `${(salaryMax / 1000).toFixed(1)}k` : salaryMax}</strong>
              </div>
              <div className="disco-topbar__slider-track">
                <input
                  type="range"
                  min="300"
                  max="3500"
                  step="50"
                  value={salaryMax}
                  onChange={(e) => setSalaryMax(Number(e.target.value))}
                  className="disco-topbar__range-input"
                  aria-label="Max salary"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <main className="page__body disco-body" ref={revealRef}>
        <div className="disco-layout">
          {/* LEFT SIDEBAR */}
          <aside className="disco-sidebar">
            {/* Promo Banner Card (from design) */}
            <div className="disco-promo-card">
              <div className="disco-promo-card__circle" aria-hidden="true" />
              <div className="disco-promo-card__star" aria-hidden="true" />
              <h2 className="disco-promo-card__title">
                Get Your best profession with Nexora
              </h2>
              <Link to="/cv" className="disco-promo-card__btn">
                Learn more
              </Link>
            </div>

            {/* Filter Section */}
            <div className="disco-filter-box">
              <div className="disco-filter-box__head">
                <h3>Filters</h3>
                {activeFilterCount > 0 && (
                  <button className="disco-filter-box__clear" onClick={clearFilters}>
                    Reset ({activeFilterCount})
                  </button>
                )}
              </div>

              {/* Working Schedule Filter */}
              <div className="disco-filter-group">
                <h4>Working schedule</h4>
                <div className="disco-filter-group__options">
                  {workingScheduleOptions.map((opt) => {
                    const isChecked = checkedSchedules.has(opt);
                    return (
                      <label className={`disco-check ${isChecked ? "disco-check--active" : ""}`} key={opt}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSet(setCheckedSchedules, opt)}
                        />
                        <span className="disco-check__box">
                          {isChecked && <span className="disco-check__tick">✓</span>}
                        </span>
                        <span className="disco-check__label">{opt}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Employment Type Filter */}
              <div className="disco-filter-group">
                <h4>Employment type</h4>
                <div className="disco-filter-group__options">
                  {employmentTypeOptions.map((opt) => {
                    const isChecked = checkedEmploymentTypes.has(opt);
                    return (
                      <label className={`disco-check ${isChecked ? "disco-check--active" : ""}`} key={opt}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSet(setCheckedEmploymentTypes, opt)}
                        />
                        <span className="disco-check__box">
                          {isChecked && <span className="disco-check__tick">✓</span>}
                        </span>
                        <span className="disco-check__label">{opt}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </aside>

          {/* RIGHT JOB LIST GRID */}
          <section className="disco-main">
            {/* Header row with count and Sort by */}
            <div className="disco-main__header">
              <div className="disco-main__title-wrap">
                <h2>Recommended jobs</h2>
                <span className="disco-main__count-badge">
                  {loading ? "…" : visible.length}
                </span>
              </div>

              <div className="disco-main__sort-wrap">
                <span className="disco-main__sort-label">Sort by:</span>
                <div className="disco-main__sort-select">
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="last_updated">Last updated</option>
                    {user && <option value="match_score">Best Match</option>}
                    <option value="salary_high">Salary: High to Low</option>
                  </select>
                  <SortIcon />
                </div>
              </div>
            </div>

            {/* Jobs Grid */}
            <div className="disco-grid">
              {visible.map((job, index) => {
                const colorClass = getCardColorClass(job, index);
                const isSaved = bookmarked.has(String(job.id));
                const tags = job.tags || [job.type, job.experienceLevel || "Junior level", job.workMode, "Project work"];

                return (
                  <article className={`disco-card ${colorClass} scroll-reveal`} key={job.id} data-delay={index * 30}>
                    {/* Top Row: Date pill & Bookmark */}
                    <div className="disco-card__top">
                      <span className="disco-card__date-pill">
                        {job.postedDate || job.posted || "Recent"}
                      </span>
                      <button
                        type="button"
                        className={`disco-card__bookmark-btn ${isSaved ? "disco-card__bookmark-btn--active" : ""}`}
                        onClick={() => toggleBookmark(job.id)}
                        aria-label={isSaved ? "Remove bookmark" : "Save job"}
                        title={isSaved ? "Saved" : "Save job"}
                      >
                        <BookmarkIcon filled={isSaved} />
                      </button>
                    </div>

                    {/* Middle: Company, Title, Logo */}
                    <div className="disco-card__mid">
                      <div className="disco-card__company-row">
                        <div className="disco-card__title-area">
                          <span className="disco-card__company">{job.company}</span>
                          <h3 className="disco-card__title">{job.title}</h3>
                        </div>
                        <div className="disco-card__logo-badge">
                          {job.companyLogo ? (
                            <img
                              src={job.companyLogo}
                              alt={job.company}
                              className="disco-card__logo-img"
                              onError={(e) => {
                                e.target.style.display = "none";
                                e.target.nextSibling.style.display = "grid";
                              }}
                            />
                          ) : null}
                          <span
                            className="disco-card__logo-fallback"
                            style={{ display: job.companyLogo ? "none" : "grid" }}
                          >
                            {getCompanyInitial(job.company)}
                          </span>
                        </div>
                      </div>

                      {/* Tag Badges */}
                      <div className="disco-card__tags">
                        {tags.slice(0, 4).map((tag, tIdx) => (
                          <span className="disco-card__tag" key={`${tag}-${tIdx}`}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Row: Salary & Location + Details Button */}
                    <div className="disco-card__bottom">
                      <div className="disco-card__pay-loc">
                        <strong className="disco-card__salary">{job.salary}</strong>
                        <span className="disco-card__location">{job.location}</span>
                      </div>
                      <Link to={`/jobs/${job.id}`} className="disco-card__details-btn">
                        Details
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Empty State */}
            {!loading && visible.length === 0 && (
              <div className="disco-empty card">
                <h3>No matching roles found</h3>
                <p>Try adjusting your search keywords, salary range, or filters.</p>
                <button
                  type="button"
                  className="cta-btn cta-btn--orange"
                  onClick={clearFilters}
                  style={{ marginTop: 14 }}
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}