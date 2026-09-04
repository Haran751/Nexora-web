import { useState } from "react";
import { Link } from "react-router-dom";

const AVAILABLE_SKILLS = [
  { id: "react", label: "React", category: "dev" },
  { id: "figma", label: "Figma", category: "design" },
  { id: "python", label: "Python", category: "data" },
  { id: "sql", label: "SQL", category: "data" },
  { id: "ui-ux", label: "UI/UX", category: "design" },
  { id: "javascript", label: "JavaScript", category: "dev" },
];

const ROLES_DATABASE = [
  {
    skills: ["react", "javascript"],
    title: "Frontend Developer Intern",
    company: "Nexora Studio",
    location: "Jakarta (Hybrid)",
    stipend: "Paid Internship",
  },
  {
    skills: ["figma", "ui-ux"],
    title: "Junior Product Designer",
    company: "Brightmind Agency",
    location: "Bandung (On-site)",
    stipend: "Entry Level",
  },
  {
    skills: ["python", "sql"],
    title: "Data Analyst Associate",
    company: "CloudNine Analytics",
    location: "Remote",
    stipend: "Entry Level",
  },
];

export default function MatchSimulator() {
  const [selectedSkills, setSelectedSkills] = useState(["figma", "react"]);

  const toggleSkill = (id) => {
    setSelectedSkills((prev) => {
      if (prev.includes(id)) {
        return prev.filter((s) => s !== id);
      }
      if (prev.length >= 4) {
        return [...prev.slice(1), id]; // Max 4 active skills
      }
      return [...prev, id];
    });
  };

  // Calculate dynamic match score
  const matchScore =
    selectedSkills.length === 0
      ? 50
      : Math.min(98, 70 + selectedSkills.length * 8 + (selectedSkills.includes("react") && selectedSkills.includes("figma") ? 4 : 0));

  // Determine best matching role from current selection
  const matchingRole =
    ROLES_DATABASE.find((r) => r.skills.some((s) => selectedSkills.includes(s))) ||
    ROLES_DATABASE[0];

  return (
    <div
      className="match-sim"
      style={{
        background: "var(--bg-gradient)",
        borderRadius: "20px",
        padding: "24px 26px",
        boxShadow: "var(--shadow-card)",
        color: "var(--text-light)",
        border: "1px solid rgba(255, 255, 255, 0.12)",
        maxWidth: 480,
        margin: "0 auto",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
        <div>
          <span
            style={{
              fontSize: "0.75rem",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--accent-orange)",
              display: "block",
              marginBottom: 4,
            }}
          >
            Live Skill Match Simulator
          </span>
          <h4 style={{ margin: 0, fontSize: "1.15rem", fontFamily: "Playfair Display, serif" }}>
            Tap your skills to test match
          </h4>
        </div>

        {/* Dynamic circular gauge indicator */}
        <div
          style={{
            width: 54,
            height: 54,
            borderRadius: "50%",
            background: "rgba(232, 136, 60, 0.15)",
            border: "2px solid var(--accent-orange)",
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: "1.05rem", fontWeight: 800, color: "#fff" }}>
            {matchScore}%
          </span>
        </div>
      </div>

      {/* Skill Pills Selection */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
        {AVAILABLE_SKILLS.map((skill) => {
          const isSelected = selectedSkills.includes(skill.id);
          return (
            <button
              key={skill.id}
              type="button"
              onClick={() => toggleSkill(skill.id)}
              aria-pressed={isSelected}
              style={{
                background: isSelected ? "var(--accent-orange)" : "rgba(255, 255, 255, 0.08)",
                color: "#fff",
                border: isSelected ? "1px solid var(--accent-orange)" : "1px solid rgba(255, 255, 255, 0.16)",
                borderRadius: "999px",
                padding: "7px 14px",
                fontSize: "0.85rem",
                fontWeight: isSelected ? 700 : 500,
                cursor: "pointer",
                transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span>{skill.label}</span>
              {isSelected ? (
                <span style={{ fontSize: "0.8rem", lineHeight: 1 }}>✕</span>
              ) : (
                <span style={{ fontSize: "0.8rem", opacity: 0.6, lineHeight: 1 }}>+</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Dynamic Match Preview Card */}
      <div
        style={{
          background: "rgba(0, 0, 0, 0.22)",
          borderRadius: 14,
          padding: "16px 18px",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          marginBottom: 18,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <span style={{ fontSize: "0.78rem", color: "var(--accent-pink)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {matchingRole.stipend}
          </span>
          <span style={{ fontSize: "0.8rem", color: "rgba(255, 255, 255, 0.75)" }}>
            {matchingRole.location}
          </span>
        </div>

        <strong style={{ display: "block", fontSize: "1.05rem", color: "#fff", marginBottom: 4 }}>
          {matchingRole.title}
        </strong>
        <span style={{ fontSize: "0.88rem", color: "rgba(255, 255, 255, 0.8)" }}>
          {matchingRole.company}
        </span>

        {/* Dynamic Progress Bar */}
        <div style={{ marginTop: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", marginBottom: 4, opacity: 0.85 }}>
            <span>Compatibility Index</span>
            <strong>{matchScore}% High Match</strong>
          </div>
          <div style={{ height: 6, borderRadius: 999, background: "rgba(255, 255, 255, 0.15)", overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                width: "100%",
                transform: `scaleX(${matchScore / 100})`,
                transformOrigin: "left",
                background: "linear-gradient(90deg, var(--accent-pink), var(--accent-orange))",
                borderRadius: 999,
                transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            />
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <Link
        to="/jobs"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          padding: "12px 20px",
          background: "var(--accent-orange)",
          color: "#fff",
          borderRadius: 999,
          fontWeight: 600,
          fontSize: "0.92rem",
          textDecoration: "none",
          boxShadow: "0 6px 18px rgba(232, 136, 60, 0.35)",
          transition: "transform 0.15s ease, box-shadow 0.15s ease",
        }}
        className="match-sim__cta"
      >
        Explore Roles for Your Skills →
      </Link>
    </div>
  );
}
