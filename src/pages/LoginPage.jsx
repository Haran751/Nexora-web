import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import HeroArt from "../components/HeroArt.jsx";

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validateEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  function handleSubmit(e) {
    e.preventDefault();
    const errs = {};
    if (!form.email.trim()) errs.email = "Email is required.";
    else if (!validateEmail(form.email)) errs.email = "Enter a valid email.";
    if (!form.password) errs.password = "Password is required.";
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      setSubmitting(true);
      setTimeout(() => navigate("/home"), 700);
    }
  }

  return (
    <div className="signup login-page">
      <HeroArt width={767} height={633} className="signup__art-bg" />
      <h1 className="signup__title">Welcome Back</h1>
      <p className="signup__sub">Log in to your Nexora account</p>

      <form className="signup-form signup-form--worker" onSubmit={handleSubmit} noValidate>
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
          <label htmlFor="li-pass">Password</label>
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