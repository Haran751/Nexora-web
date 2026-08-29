import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { loadProfile, saveProfile, profilePercent } from "../lib/profile.js";
import useScrollReveal from "../hooks/useScrollReveal.js";
import { useAuth } from "../context/AuthContext.jsx";
import AvatarUploadModal from "../components/AvatarUploadModal.jsx";
import { sanitizeUrl } from "../lib/security.js";

function ActivityChart() {
  const w = 800;
  const h = 260;
  const pad = { top: 30, right: 30, bottom: 44, left: 50 };
  const innerW = w - pad.left - pad.right;
  const innerH = h - pad.top - pad.bottom;

  const points = [
    { x: 0, y: 300 },
    { x: 60, y: 180 },
    { x: 120, y: 110 },
    { x: 180, y: 70 },
    { x: 240, y: 60 },
    { x: 300, y: 90 },
    { x: 360, y: 150 },
    { x: 420, y: 230 },
    { x: 480, y: 320 },
    { x: 540, y: 390 },
    { x: 600, y: 430 },
    { x: 660, y: 450 },
    { x: 720, y: 460 },
    { x: 780, y: 470 },
  ];
  const maxY = 1000;

  const coord = (p) => ({
    x: pad.left + (p.x / 800) * innerW,
    y: pad.top + innerH - (Math.min(p.y, maxY) / maxY) * innerH,
  });

  const pts = points.map(coord);
  const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L${pts[pts.length - 1].x},${pad.top + innerH} L${pts[0].x},${pad.top + innerH} Z`;

  const yTicks = [0, 250, 500, 750, 1000];
  const xLabels = ["kemarennya lagi", "kemaren", "kemaren banget", "tadi"];

  return (
    <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label="Activity over time">
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4C7DFF" stopOpacity="0.35" />
          <stop offset="1" stopColor="#4C7DFF" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {yTicks.map((t) => {
        const y = pad.top + innerH - (t / maxY) * innerH;
        return (
          <g key={t}>
            <line x1={pad.left} y1={y} x2={w - pad.right} y2={y} stroke="#8B4A2A" strokeOpacity="0.5" />
            <text x={pad.left - 10} y={y + 4} textAnchor="end" fontSize="13" fill="#3D1028" fontWeight="600">
              {t}
            </text>
          </g>
        );
      })}

      <path d={areaPath} fill="url(#areaGrad)" />
      <path d={linePath} fill="none" stroke="#4C7DFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

      <g>
        {[
          { label: "kemarennya lagi", x: pad.left + innerW * 0.12 },
          { label: "kemaren", x: pad.left + innerW * 0.4 },
          { label: "kemaren banget", x: pad.left + innerW * 0.68 },
          { label: "tadi", x: pad.left + innerW * 0.9 },
        ].map((l, i) => (
          <text
            key={i}
            x={l.x}
            y={h - 14}
            textAnchor={i === 3 ? "end" : "start"}
            fontSize="13"
            fill="#3D1028"
            fontWeight="600"
          >
            {l.label}
          </text>
        ))}
      </g>

      <rect
        x={pad.left}
        y={pad.top}
        width={innerW}
        height={innerH}
        fill="none"
        stroke="var(--accent-orange)"
        strokeWidth="2"
        rx="10"
      />
    </svg>
  );
}

const UserIcon = () => (
  <svg width="60" height="60" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <circle cx="12" cy="7.5" r="4" />
    <path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5z" />
  </svg>
);

function SectionCard({ title, editing, onToggleEdit, children, className = "" }) {
  return (
    <section className={`profile-section ${className}`}>
      <div className="profile-section__head">
        <h3>{title}</h3>
        <button type="button" className="profile-section__edit" onClick={onToggleEdit}>
          {editing ? "Done" : "Edit"}
        </button>
      </div>
      {children}
    </section>
  );
}

function InfoField({ label, value, edit }) {
  return (
    <div className="profile-field">
      <span className="profile-field__label">{label}</span>
      <span className="profile-field__value">{value}</span>
      <div className="profile-field__edit">{edit}</div>
    </div>
  );
}

export default function ProfilePage() {
  const { user, profile: authProfile, updateProfile } = useAuth();
  const [profile, setProfile] = useState(() => authProfile || loadProfile());
  const [editing, setEditing] = useState({});
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const revealRef = useScrollReveal();
  const isUserEditRef = useRef(false);

  // Sync from authProfile if it changes externally (e.g. initial fetch from Supabase)
  useEffect(() => {
    if (authProfile && !isUserEditRef.current) {
      setProfile((prev) => {
        if (JSON.stringify(prev) === JSON.stringify(authProfile)) {
          return prev;
        }
        return authProfile;
      });
    }
  }, [authProfile]);

  // Sync to localStorage and updateProfile only when modified by the user
  useEffect(() => {
    if (!isUserEditRef.current) return;

    saveProfile(profile);

    const timer = setTimeout(() => {
      updateProfile(profile).catch((err) => console.warn("Profile sync error:", err));
      isUserEditRef.current = false;
    }, 400);

    return () => clearTimeout(timer);
  }, [profile, updateProfile]);

  const set = (patch) => {
    isUserEditRef.current = true;
    setProfile((p) => ({ ...p, ...patch }));
  };

  const toggleEdit = (key) => {
    if (editing[key]) {
      // Selesai edit bagian ini, langsung simpan
      saveProfile(profile);
      updateProfile(profile).catch((err) => console.warn("Profile sync error:", err));
      isUserEditRef.current = false;
    }
    setEditing((e) => ({ ...e, [key]: !e[key] }));
  };

  const addItem = (key) => {
    isUserEditRef.current = true;
    setProfile((p) => {
      const template =
        key === "education"
          ? { institution: "", major: "", year: "" }
          : key === "experience"
          ? { company: "", role: "", duration: "", description: "" }
          : key === "projects"
          ? { title: "", description: "", url: "" }
          : { title: "", issuer: "", year: "" };
      return { ...p, [key]: [...(p[key] || []), template] };
    });
  };

  const updateItem = (key, idx, patch) => {
    isUserEditRef.current = true;
    setProfile((p) => ({
      ...p,
      [key]: (p[key] || []).map((item, i) => (i === idx ? { ...item, ...patch } : item)),
    }));
  };

  const removeItem = (key, idx) => {
    isUserEditRef.current = true;
    setProfile((p) => ({ ...p, [key]: (p[key] || []).filter((_, i) => i !== idx) }));
  };

  const addSkill = (skill) => {
    const s = skill.trim();
    if (!s) return;
    isUserEditRef.current = true;
    setProfile((p) => ({ ...p, skills: (p.skills || []).includes(s) ? p.skills : [...(p.skills || []), s] }));
  };

  const removeSkill = (idx) => {
    isUserEditRef.current = true;
    setProfile((p) => ({ ...p, skills: (p.skills || []).filter((_, i) => i !== idx) }));
  };

  const percent = profilePercent(profile);

  const profileName = profile.name?.trim() ? profile.name : "User";

  return (
    <div className="page">
      <Navbar />
      <main className="page__body profile" ref={revealRef}>
        <h1>Profile</h1>

        <div className="profile__complete">
          <div className="profile__complete-meta">
            <strong>Profile {percent}% Complete</strong>
            <Link to="/cv" className="view-job">
              Generate CV →
            </Link>
          </div>
          <div className="progress-track profile__complete-bar">
            <div className="progress-track__fill" style={{ width: `${percent}%` }} />
          </div>
        </div>

        <div className="profile__top">
          <div className="profile__avatar-container">
            <div
              className="profile__avatar"
              onClick={() => setIsAvatarModalOpen(true)}
              role="button"
              tabIndex={0}
              title="Klik untuk mengganti foto profil"
              onKeyDown={(e) => e.key === "Enter" && setIsAvatarModalOpen(true)}
            >
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profileName}
                  className="profile__avatar-img"
                />
              ) : (
                <UserIcon />
              )}
              <button
                type="button"
                className="profile__avatar-badge"
                title="Ubah Foto"
                aria-label="Ubah Foto"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsAvatarModalOpen(true);
                }}
              >
                📷
              </button>
            </div>
            <button
              type="button"
              className="profile__avatar-change-link"
              onClick={() => setIsAvatarModalOpen(true)}
            >
              {profile.avatarUrl ? "Ubah Foto Profil" : "+ Pasang Foto Profil"}
            </button>
          </div>
          <div className="profile__meta">
            <div className="profile__meta-label">birthday / place of birth</div>
            <div className="profile__meta-line" />
          </div>
        </div>

        <h2>{profileName}</h2>

        <div className="profile__sections">
          <SectionCard title="Personal Info" editing={editing.info} onToggleEdit={() => toggleEdit("info")}>
            {editing.info ? (
              <div className="profile-fields">
                <div className="profile-input">
                  <label>Name</label>
                  <input value={profile.name || ""} onChange={(e) => set({ name: e.target.value })} />
                </div>
                <div className="profile-input">
                  <label>Email</label>
                  <input value={profile.email || ""} onChange={(e) => set({ email: e.target.value })} />
                </div>
                <div className="profile-input">
                  <label>Phone</label>
                  <input value={profile.phone || ""} onChange={(e) => set({ phone: e.target.value })} />
                </div>
                <div className="profile-input">
                  <label>Birthday</label>
                  <input value={profile.birthday || ""} onChange={(e) => set({ birthday: e.target.value })} />
                </div>
                <div className="profile-input">
                  <label>Location</label>
                  <input value={profile.location || ""} onChange={(e) => set({ location: e.target.value })} />
                </div>
              </div>
            ) : (
              <div className="profile-fields">
                <InfoField label="Name" value={profile.name || "—"} />
                <InfoField label="Email" value={profile.email || "—"} />
                <InfoField label="Phone" value={profile.phone || "—"} />
                <InfoField label="Birthday" value={profile.birthday || "—"} />
                <InfoField label="Location" value={profile.location || "—"} />
              </div>
            )}
          </SectionCard>

          <SectionCard title="About Me" editing={editing.about} onToggleEdit={() => toggleEdit("about")}>
            {editing.about ? (
              <textarea
                className="profile-textarea"
                rows={5}
                placeholder="Tell employers about yourself…"
                value={profile.about || ""}
                onChange={(e) => set({ about: e.target.value })}
              />
            ) : (
              <p className="profile-paragraph">
                {profile.about?.trim() ? profile.about : "Tell employers about yourself."}
              </p>
            )}
          </SectionCard>

          <SectionCard title="Skills" editing={editing.skills} onToggleEdit={() => toggleEdit("skills")}>
            <div className="skill-list">
              {(profile.skills || []).map((skill, idx) => (
                <span className="skill-chip" key={`${skill}-${idx}`}>
                  {skill}
                  <button
                    type="button"
                    aria-label={`Remove ${skill}`}
                    onClick={() => removeSkill(idx)}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            {editing.skills && (
              <SkillInput onAdd={addSkill} />
            )}
          </SectionCard>

          <SectionCard
            title="Education"
            editing={editing.education}
            onToggleEdit={() => toggleEdit("education")}
          >
            {(profile.education || []).map((item, idx) => (
              <div className="profile-subcard" key={idx}>
                {editing.education ? (
                  <>
                    <div className="profile-input">
                      <label>Institution</label>
                      <input value={item.institution || ""} onChange={(e) => updateItem("education", idx, { institution: e.target.value })} />
                    </div>
                    <div className="profile-input">
                      <label>Major</label>
                      <input value={item.major || ""} onChange={(e) => updateItem("education", idx, { major: e.target.value })} />
                    </div>
                    <div className="profile-input">
                      <label>Year</label>
                      <input value={item.year || ""} onChange={(e) => updateItem("education", idx, { year: e.target.value })} />
                    </div>
                  </>
                ) : (
                  <div className="profile-subcard__view">
                    <strong>{item.institution || "Institution"}</strong>
                    <span>{[item.major, item.year].filter(Boolean).join(" · ") || "Major · Year"}</span>
                  </div>
                )}
                <button type="button" className="profile-subcard__remove" onClick={() => removeItem("education", idx)}>
                  Remove
                </button>
              </div>
            ))}
            {editing.education && (
              <button type="button" className="profile-add" onClick={() => addItem("education")}>
                + Add Education
              </button>
            )}
          </SectionCard>

          <SectionCard
            title="Experience"
            editing={editing.experience}
            onToggleEdit={() => toggleEdit("experience")}
          >
            {(profile.experience || []).map((item, idx) => (
              <div className="profile-subcard" key={idx}>
                {editing.experience ? (
                  <>
                    <div className="profile-input">
                      <label>Company</label>
                      <input value={item.company || ""} onChange={(e) => updateItem("experience", idx, { company: e.target.value })} />
                    </div>
                    <div className="profile-input">
                      <label>Role</label>
                      <input value={item.role || ""} onChange={(e) => updateItem("experience", idx, { role: e.target.value })} />
                    </div>
                    <div className="profile-input">
                      <label>Duration</label>
                      <input value={item.duration || ""} onChange={(e) => updateItem("experience", idx, { duration: e.target.value })} />
                    </div>
                    <div className="profile-input">
                      <label>Description</label>
                      <textarea rows={2} value={item.description || ""} onChange={(e) => updateItem("experience", idx, { description: e.target.value })} />
                    </div>
                  </>
                ) : (
                  <div className="profile-subcard__view">
                    <strong>{item.role || "Role"}</strong>
                    <span>{[item.company, item.duration].filter(Boolean).join(" · ")}</span>
                    {item.description && <p>{item.description}</p>}
                  </div>
                )}
                <button type="button" className="profile-subcard__remove" onClick={() => removeItem("experience", idx)}>
                  Remove
                </button>
              </div>
            ))}
            {editing.experience && (
              <button type="button" className="profile-add" onClick={() => addItem("experience")}>
                + Add Experience
              </button>
            )}
          </SectionCard>

          <SectionCard
            title="Projects & Portfolio"
            editing={editing.projects}
            onToggleEdit={() => toggleEdit("projects")}
          >
            {(profile.projects || []).map((item, idx) => (
              <div className="profile-subcard" key={idx}>
                {editing.projects ? (
                  <>
                    <div className="profile-input">
                      <label>Title</label>
                      <input value={item.title || ""} onChange={(e) => updateItem("projects", idx, { title: e.target.value })} />
                    </div>
                    <div className="profile-input">
                      <label>Description</label>
                      <textarea rows={2} value={item.description || ""} onChange={(e) => updateItem("projects", idx, { description: e.target.value })} />
                    </div>
                    <div className="profile-input">
                      <label>URL</label>
                      <input value={item.url || ""} onChange={(e) => updateItem("projects", idx, { url: e.target.value })} />
                    </div>
                  </>
                ) : (
                  <div className="profile-subcard__view">
                    <strong>{item.title || "Project title"}</strong>
                    {item.description && <p>{item.description}</p>}
                    {item.url && sanitizeUrl(item.url) && (
                      <a href={sanitizeUrl(item.url)} target="_blank" rel="noopener noreferrer" className="view-job">
                        {sanitizeUrl(item.url)}
                      </a>
                    )}
                  </div>
                )}
                <button type="button" className="profile-subcard__remove" onClick={() => removeItem("projects", idx)}>
                  Remove
                </button>
              </div>
            ))}
            {editing.projects && (
              <button type="button" className="profile-add" onClick={() => addItem("projects")}>
                + Add Project
              </button>
            )}
          </SectionCard>

          <SectionCard
            title="Certificates"
            editing={editing.certificates}
            onToggleEdit={() => toggleEdit("certificates")}
          >
            {(profile.certificates || []).map((item, idx) => (
              <div className="profile-subcard" key={idx}>
                {editing.certificates ? (
                  <>
                    <div className="profile-input">
                      <label>Title</label>
                      <input value={item.title || ""} onChange={(e) => updateItem("certificates", idx, { title: e.target.value })} />
                    </div>
                    <div className="profile-input">
                      <label>Issuer</label>
                      <input value={item.issuer || ""} onChange={(e) => updateItem("certificates", idx, { issuer: e.target.value })} />
                    </div>
                    <div className="profile-input">
                      <label>Year</label>
                      <input value={item.year || ""} onChange={(e) => updateItem("certificates", idx, { year: e.target.value })} />
                    </div>
                  </>
                ) : (
                  <div className="profile-subcard__view">
                    <strong>{item.title || "Certificate"}</strong>
                    <span>{[item.issuer, item.year].filter(Boolean).join(" · ")}</span>
                  </div>
                )}
                <button type="button" className="profile-subcard__remove" onClick={() => removeItem("certificates", idx)}>
                  Remove
                </button>
              </div>
            ))}
            {editing.certificates && (
              <button type="button" className="profile-add" onClick={() => addItem("certificates")}>
                + Add Certificate
              </button>
            )}
          </SectionCard>
        </div>

        <div className="profile__activity scroll-reveal">
          <h3>Activity</h3>
          <div className="chart">
            <ActivityChart />
          </div>
        </div>

        <AvatarUploadModal
          isOpen={isAvatarModalOpen}
          onClose={() => setIsAvatarModalOpen(false)}
          currentAvatarUrl={profile.avatarUrl}
          userName={profileName}
          userId={user?.id || "user"}
          onAvatarSaved={(newUrl) => set({ avatarUrl: newUrl })}
          onAvatarDeleted={() => set({ avatarUrl: "" })}
        />
      </main>
      <Footer />
    </div>
  );
}

function SkillInput({ onAdd }) {
  const [value, setValue] = useState("");
  return (
    <div className="skill-input">
      <input
        placeholder="Add a skill and press Enter"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onAdd(value);
            setValue("");
          }
        }}
      />
      <button
        type="button"
        className="cta-btn cta-btn--orange"
        style={{ padding: "10px 18px", fontSize: 14 }}
        onClick={() => {
          onAdd(value);
          setValue("");
        }}
      >
        Add
      </button>
    </div>
  );
}