import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import useScrollReveal from "../hooks/useScrollReveal.js";
import { useAuth } from "../context/AuthContext.jsx";
import { fetchJobs } from "../services/jobsService.js";

const gradient = "linear-gradient(90deg, #632248 0%, #42154c 100%)";

export default function CompanyProfilePage() {
  const navigate = useNavigate();
  const { user, profile, updateProfile } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ companyName: "", about: "", location: "" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const revealRef = useScrollReveal();

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const list = await fetchJobs({ employerId: user?.id });
        if (active) setJobs(list);
      } catch (err) {
        console.error("CompanyProfile load error:", err);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [user?.id]);

  useEffect(() => {
    setForm({
      companyName: profile?.companyName || "",
      about: profile?.about || "",
      location: profile?.location || "",
    });
  }, [profile?.companyName, profile?.about, profile?.location, editing]);

  const companyName = profile?.companyName || profile?.name || "Company Name";
  const bio = profile?.about || "bio";

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await updateProfile({
        companyName: form.companyName.trim() || companyName,
        about: form.about,
        location: form.location,
      });
      setSaved(true);
      setEditing(false);
    } catch (err) {
      console.warn("Failed to save company profile:", err);
      setSaved(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page">
      <Navbar variant="employer" onEmployerView={() => navigate("/employer")} />
      <main className="company-profile" ref={revealRef}>
        <div className="company-profile__card">
          <header className="company-profile__banner">
            <span className="company-profile__banner-circle" aria-hidden="true" />
            <span className="company-profile__banner-text">Banner</span>
          </header>

          <div className="company-profile__body">
            <button
              className="company-profile__edit-btn"
              onClick={() => setEditing((v) => !v)}
            >
              {editing ? "Cancel" : "✎ Edit Profile"}
            </button>

            {editing ? (
              <form onSubmit={handleSave} className="company-profile__form" noValidate>
                <div className="company-profile__field">
                  <label htmlFor="cp-name">Company Name</label>
                  <input
                    id="cp-name"
                    value={form.companyName}
                    onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                    placeholder="Nama perusahaan"
                    required
                  />
                </div>
                <div className="company-profile__field">
                  <label htmlFor="cp-location">Location</label>
                  <input
                    id="cp-location"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="Jakarta"
                  />
                </div>
                <div className="company-profile__field">
                  <label htmlFor="cp-about">Bio</label>
                  <textarea
                    id="cp-about"
                    rows={4}
                    value={form.about}
                    onChange={(e) => setForm({ ...form, about: e.target.value })}
                    placeholder="Deskripsi singkat perusahaan"
                  />
                </div>
                <div className="company-profile__form-actions">
                  <button
                    type="submit"
                    className="company-profile__save-btn"
                    style={{ background: gradient }}
                    disabled={saving}
                  >
                    {saving ? "Menyimpan…" : "Save"}
                  </button>
                </div>
              </form>
            ) : (
              <>
                <h1 className="company-profile__name">{companyName}</h1>
                <p className="company-profile__bio">{bio}</p>
                <p className="company-profile__location">
                  {profile?.location ? `📍 ${profile.location}` : ""}
                </p>
                <div className="company-profile__lines">
                  <span className="company-profile__line" />
                  <span className="company-profile__line" />
                </div>

                <section className="company-profile__offers">
                  <h2>Job offers</h2>
                  {jobs.length > 0 ? (
                    <div className="company-profile__offers-list">
                      {jobs.map((job) => (
                        <div className="company-profile__offer" key={job.id}>
                          <strong>{job.title}</strong>
                          <span>
                            {job.type} · {job.workMode} · {job.location}
                          </span>
                          <em>{job.salary}</em>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="company-profile__empty">
                      Belum ada lowongan yang diposting.
                    </p>
                  )}
                </section>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
