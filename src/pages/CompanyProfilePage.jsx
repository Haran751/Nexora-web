import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import useScrollReveal from "../hooks/useScrollReveal.js";
import { useAuth } from "../context/AuthContext.jsx";
import { fetchJobs } from "../services/jobsService.js";
import { compressImage, uploadAvatar } from "../lib/avatarUpload.js";

const gradient = "linear-gradient(90deg, #632248 0%, #42154c 100%)";

export default function CompanyProfilePage() {
  const navigate = useNavigate();
  const { user, profile, updateProfile } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ companyName: "", about: "", location: "" });
  const [saving, setSaving] = useState(false);
  const [bannerLoading, setBannerLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [bannerError, setBannerError] = useState("");
  const [avatarError, setAvatarError] = useState("");
  
  const bannerInputRef = useRef(null);
  const avatarInputRef = useRef(null);
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
  const bio = profile?.about || "Ceritakan tentang visi, budaya, dan keunggulan perusahaan Anda.";
  const avatarChar = (companyName || "C").trim().charAt(0).toUpperCase();

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        companyName: form.companyName.trim() || companyName,
        about: form.about,
        location: form.location,
      });
      setEditing(false);
    } catch (err) {
      console.warn("Failed to save company profile:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleBannerUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
    if (!ALLOWED.includes(file.type)) {
      setBannerError("File banner harus JPG, PNG, atau WebP.");
      return;
    }

    setBannerLoading(true);
    setBannerError("");
    try {
      // Compress for high quality banner (1200x500 max)
      const compressed = await compressImage(file, 1200, 500, 0.88);
      const publicUrl = await uploadAvatar(compressed.blob, compressed.dataUrl, user?.id || "employer-banner");
      await updateProfile({ bannerUrl: publicUrl });
    } catch (err) {
      setBannerError(err.message || "Gagal mengunggah banner.");
    } finally {
      setBannerLoading(false);
      if (bannerInputRef.current) bannerInputRef.current.value = "";
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
    if (!ALLOWED.includes(file.type)) {
      setAvatarError("File foto profil harus JPG, PNG, atau WebP.");
      return;
    }

    setAvatarLoading(true);
    setAvatarError("");
    try {
      const compressed = await compressImage(file, 500, 500, 0.88);
      const publicUrl = await uploadAvatar(compressed.blob, compressed.dataUrl, user?.id || "employer-avatar");
      await updateProfile({ avatarUrl: publicUrl });
    } catch (err) {
      setAvatarError(err.message || "Gagal mengunggah foto profil.");
    } finally {
      setAvatarLoading(false);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  };

  const handleRemoveBanner = async () => {
    if (window.confirm("Hapus foto banner perusahaan?")) {
      await updateProfile({ bannerUrl: "" });
    }
  };

  const handleRemoveAvatar = async () => {
    if (window.confirm("Hapus logo perusahaan?")) {
      await updateProfile({ avatarUrl: "" });
    }
  };

  return (
    <div className="page">
      <Navbar variant="employer" onEmployerView={() => navigate("/employer")} />
      <main className="company-profile" ref={revealRef}>
        <div className="company-profile__card">
          {/* BANNER HEADER */}
          <header
            className="company-profile__banner"
            style={{
              backgroundImage: profile?.bannerUrl ? `url(${profile.bannerUrl})` : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <input
              ref={bannerInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleBannerUpload}
            />
            
            <div className="company-profile__banner-actions">
              <button
                type="button"
                className="company-profile__banner-btn"
                onClick={() => bannerInputRef.current?.click()}
                disabled={bannerLoading}
                title="Ganti Foto Banner"
              >
                {bannerLoading ? "Mengunggah…" : "📷 Ubah Banner"}
              </button>
              {profile?.bannerUrl && (
                <button
                  type="button"
                  className="company-profile__banner-btn company-profile__banner-btn--remove"
                  onClick={handleRemoveBanner}
                  title="Hapus Banner"
                >
                  ✕ Hapus
                </button>
              )}
            </div>

            {!profile?.bannerUrl && (
              <>
                <span className="company-profile__banner-circle" aria-hidden="true" />
                <span className="company-profile__banner-text">Company Banner</span>
              </>
            )}
          </header>

          {bannerError && <div className="company-profile__error-bar">{bannerError}</div>}

          {/* AVATAR / LOGO AREA */}
          <div className="company-profile__avatar-wrap">
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleAvatarUpload}
            />
            <div
              className="company-profile__avatar"
              onClick={() => avatarInputRef.current?.click()}
              role="button"
              tabIndex={0}
              title="Klik untuk mengganti logo perusahaan"
              onKeyDown={(e) => e.key === "Enter" && avatarInputRef.current?.click()}
            >
              {profile?.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={companyName}
                  className="company-profile__avatar-img"
                />
              ) : (
                <span className="company-profile__avatar-char">{avatarChar}</span>
              )}
              <span className="company-profile__avatar-badge" title="Ganti Foto Profile">
                {avatarLoading ? "…" : "📷"}
              </span>
            </div>

            <div className="company-profile__avatar-links">
              <button
                type="button"
                className="company-profile__link-btn"
                onClick={() => avatarInputRef.current?.click()}
                disabled={avatarLoading}
              >
                {profile?.avatarUrl ? "Ubah Logo Perusahaan" : "+ Pasang Logo Perusahaan"}
              </button>
              {profile?.avatarUrl && (
                <button
                  type="button"
                  className="company-profile__link-btn company-profile__link-btn--delete"
                  onClick={handleRemoveAvatar}
                >
                  Hapus Logo
                </button>
              )}
            </div>
          </div>

          {avatarError && <div className="company-profile__error-bar">{avatarError}</div>}

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
                  <h2>Job offers ({jobs.length})</h2>
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
