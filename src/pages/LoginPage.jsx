import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import HeroArt from "../components/HeroArt.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function LoginPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [authError, setAuthError] = useState("");

  const validateEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  async function handleSubmit(e) {
    e.preventDefault();
    setAuthError("");
    const errs = {};
    if (!form.email.trim()) errs.email = "Email is required.";
    else if (!validateEmail(form.email)) errs.email = "Enter a valid email.";
    if (!form.password) errs.password = "Password is required.";
    setErrors(errs);

    if (Object.keys(errs).length === 0) {
      setSubmitting(true);
      try {
        const res = await signIn({ email: form.email, password: form.password });
        const userRole = res?.user?.user_metadata?.role || "worker";
        if (userRole === "employer") {
          navigate("/employer");
        } else {
          navigate("/home");
        }
      } catch (err) {
        setAuthError(err.message || "Failed to log in. Please check your credentials.");
      } finally {
        setSubmitting(false);
      }
    }
  }

  return (
    <div className="signup login-page">
      <div className="signup__topbar">
        <button className="signup__back" onClick={() => navigate(-1)} aria-label="Go back">
          <span aria-hidden="true">←</span> Back
        </button>
        <Link to="/" className="signup__brand">
          <img src="/logo-nexora.webp" alt="Nexora logo" width="38" height="38" loading="lazy" decoding="async" />
          Nexora
        </Link>
      </div>

      {/* Sharp vector ambient background effects */}
      <div className="signup__bg-art" aria-hidden="true">
        <div className="signup__bg-glow signup__bg-glow--1" />
        <div className="signup__bg-glow signup__bg-glow--2" />
        <div className="signup__bg-glow signup__bg-glow--3" />
      </div>

      <h1 className="signup__title">Welcome Back</h1>
      <p className="signup__sub">Log in to your Nexora account</p>

      <form className="signup-form signup-form--worker login-page__form" onSubmit={handleSubmit} noValidate>
        {authError && (
          <div
            style={{
              padding: "10px 14px",
              background: "rgba(220, 53, 69, 0.2)",
              border: "1px solid rgba(220, 53, 69, 0.4)",
              borderRadius: "8px",
              color: "#ff8b94",
              fontSize: "0.88rem",
              marginBottom: "12px",
            }}
          >
            {authError}
          </div>
        )}

        <div className="field">
          <label htmlFor="li-email">Email</label>
          <input
            id="li-email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          {errors.email && <p className="field__error">{errors.email}</p>}
        </div>

        <div className="field">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <label htmlFor="li-pass" style={{ margin: 0 }}>Password</label>
            <Link to="/forgot-password" style={{ fontSize: "12.5px", color: "inherit", opacity: 0.85, textDecoration: "underline" }}>
              Forgot password?
            </Link>
          </div>
          <input
            id="li-pass"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          {errors.password && <p className="field__error">{errors.password}</p>}
        </div>

        <button type="submit" className="cta-btn cta-btn--dark" disabled={submitting}>
          <span className="cta-btn__play" />
          {submitting ? "Logging in…" : "Login"}
        </button>

        <p className="signup-form__alt">
          Don&apos;t have an account?{" "}
          <Link to="/signup" style={{ color: "inherit" }}>
            Sign Up
          </Link>
        </p>
      </form>
    </div>
  );
}