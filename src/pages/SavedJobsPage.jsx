import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import HeroArt from "../components/HeroArt.jsx";
import useScrollReveal from "../hooks/useScrollReveal.js";
import { jdJobs, daysLeft } from "../lib/jobsData.js";
import { loadSavedJobs, saveSavedJobs, toggleSavedJob } from "../lib/savedJobs.js";

function deadlineBadge(job) {
  const left = daysLeft(job.deadline);
  if (left < 0) return "Closed";
  if (left <= 3) return "Closing soon!";
  return `${left} hari lagi`;
}

export default function SavedJobsPage() {
  const [bookmarked, setBookmarked] = useState(loadSavedJobs);
  const revealRef = useScrollReveal();

  const savedJobs = jdJobs.filter((j) => bookmarked.has(String(j.id)));

  const remove = (id) => {
    setBookmarked((prev) => {
      const next = toggleSavedJob(prev, id);
      saveSavedJobs(next);
      return next;
    });
  };

  return (
    <div className="page">
      <Navbar />
      <main className="page__body saved" ref={revealRef}>
        <div className="jd-header">
          <h2 className="saved__title">Saved Jobs</h2>
          <span>{savedJobs.length} saved</span>
        </div>

        {savedJobs.length > 0 ? (
          <div className="job-list">
            {savedJobs.map((job) => (
              <article className="job-card scroll-reveal" key={job.id} data-delay="40">
                <div className="job-card__match">
                  <b>{job.match}%</b>
                  <span>Match</span>
                </div>
                <div className="job-card__body">
                  <h3 className="job-card__title">{job.title}</h3>
                  <p className="job-card__company">{job.company}</p>
                  <div className="job-tags">
                    {job.tags.map((tag) => (
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
            ))}
          </div>
        ) : (
          <div className="saved-empty">
            <HeroArt width={300} height={248} />
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