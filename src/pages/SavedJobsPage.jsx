import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import HeroArt from "../components/HeroArt.jsx";
import useScrollReveal from "../hooks/useScrollReveal.js";
import { daysLeft } from "../lib/jobsData.js";
import { useAuth } from "../context/AuthContext.jsx";
import { fetchJobs } from "../services/jobsService.js";
import { fetchSavedJobIds, toggleSavedJobId } from "../services/savedJobsService.js";

function deadlineBadge(job) {
  const left = daysLeft(job.deadline);
  if (left < 0) return "Closed";
  if (left <= 3) return "Closing soon!";
  return `${left} days left`;
}

export default function SavedJobsPage() {
  const { user } = useAuth();
  const [allJobs, setAllJobs] = useState([]);
  const [bookmarked, setBookmarked] = useState(() => new Set());
  const [loading, setLoading] = useState(true);

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
          setAllJobs(jobsList);
          setBookmarked(savedSet);
        }
      } catch (err) {
        console.error("SavedJobsPage load error:", err);
      } finally {
        if (active) setLoading(false);
      }
    }
    loadData();
    return () => {
      active = false;
    };
  }, [user?.id]);

  const savedJobs = allJobs.filter((j) => bookmarked.has(String(j.id)));
  const revealRef = useScrollReveal([savedJobs]);

  const remove = async (id) => {
    const next = await toggleSavedJobId(user?.id, id, bookmarked);
    setBookmarked(new Set(next));
  };

  return (
    <div className="page">
      <Navbar />
      <main className="page__body saved" ref={revealRef}>
        <div className="jd-header">
          <h2 className="saved__title">Saved Jobs</h2>
          <span>{loading ? "Loading..." : `${savedJobs.length} saved`}</span>
        </div>

        {savedJobs.length > 0 ? (
          <div className="job-list">
            {savedJobs.map((job) => {
              const tags = job.tags || [job.location, job.workMode, job.salary, job.posted];
              return (
                <article className="job-card scroll-reveal" key={job.id} data-delay="40">
                  <div className="job-card__match">
                    <b>{job.match || 92}%</b>
                    <span>Match</span>
                  </div>
                  <div className="job-card__body">
                    <h3 className="job-card__title">{job.title}</h3>
                    <p className="job-card__company">{job.company}</p>
                    <div className="job-tags">
                      {tags.map((tag) => (
                        <span className="job-tag" key={tag}>
                          {tag}
                        </span>
                      ))}
                      <span className="job-tag job-tag--deadline">{deadlineBadge(job)}</span>
                    </div>
                    <div className="saved-actions">
                      <Link to={`/jobs/${job.id}`} className="cta-btn cta-btn--pink">
                        <span className="cta-btn__play" /> Apply Now
                      </Link>
                      <button className="saved-actions__remove" onClick={() => remove(job.id)}>
                        Remove
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="saved-empty">
            <HeroArt width={767} height={633} />
            <h3>No saved jobs yet</h3>
            <p>Bookmark opportunities you like and they will show up here.</p>
            <Link to="/jobs" className="cta-btn cta-btn--orange">
              <span className="cta-btn__play" /> Browse Jobs
            </Link>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}