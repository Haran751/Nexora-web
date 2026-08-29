import { useState } from "react";
import { Link } from "react-router-dom";
import HeroArt from "../components/HeroArt.jsx";

const Magnifier = () => (
  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" strokeLinecap="round" />
  </svg>
);

export default function SignUpPage() {
  const [stage, setStage] = useState("role");

  const [empForm, setEmpForm] = useState({ company: "", email: "" });
  const [empErrors, setEmpErrors] = useState({});
  const [workerForm, setWorkerForm] = useState({ email: "", password: "", verify: "" });
  const [workerErrors, setWorkerErrors] = useState({});

  const validateEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  function handleEmployerSubmit(e) {
    e.preventDefault();
    const errs = {};
    if (!empForm.company.trim()) errs.company = "Company name is required.";
    if (!empForm.email.trim()) errs.email = "Company email is required.";
    else if (!validateEmail(empForm.email)) errs.email = "Enter a valid email.";
    setEmpErrors(errs);
    if (Object.keys(errs).length === 0) setStage("done-employer");
  }

  function handleWorkerSubmit(e) {
    e.preventDefault();
    const errs = {};
    if (!validateEmail(workerForm.email)) errs.email = "Enter a valid email.";
    if (workerForm.password.length < 6) errs.password = "Password must be at least 6 characters.";
    if (workerForm.password !== workerForm.verify) errs.verify = "Passwords do not match.";
    setWorkerErrors(errs);
    if (Object.keys(errs).length === 0) setStage("done-worker");
  }

  return (
    <div className="signup">
      <HeroArt width={767} height={633} className="signup__art-bg" />
      <h1 className="signup__title">Get Started with Nexora</h1>
      <p className="signup__sub">Choose how you want to join the Nexora community.</p>

      {stage === "role" && (
        <div className="signup__grid">
          <button className="role-card role-card--worker" onClick={() => setStage("worker")}>
            <span className="role-card__ico">
              <Magnifier />
            </span>
            <h3>For Workers</h3>
            <p>Find your next opportunity yourself.</p>
          </button>
          <button className="role-card role-card--employer" onClick={() => setStage("employer")}>
            <span className="role-card__ico">
              <img src="/for-employer.png" alt="For Employers" />
            </span>
            <h3>For Employers</h3>
            <p>Hire great talent, effortlessly.</p>
          </button>
        </div>
      )}

      {stage === "worker" && (
        <div className="signup__form-wrap">
          <button className="signup-form__back" onClick={() => setStage("role")}>
            ← Back
          </button>
          <form className="signup-form signup-form--worker" onSubmit={handleWorkerSubmit} noValidate>
            <h3>Worker Sign Up</h3>
            <p className="signup__sub" style={{ textAlign: "left", margin: "0 0 8px" }}>Create your account</p>

            <div className="field">
              <label htmlFor="w-email">Email</label>
              <input
                id="w-email"
                type="email"
                placeholder="you@example.com"
                value={workerForm.email}
                onChange={(e) => setWorkerForm({ ...workerForm, email: e.target.value })}
              />
              {workerErrors.email && <p className="field__error">{workerErrors.email}</p>}
            </div>

            <div className="field">
              <label htmlFor="w-pass">Password</label>
              <input
                id="w-pass"
                type="password"
                placeholder="••••••••"
                value={workerForm.password}
                onChange={(e) => setWorkerForm({ ...workerForm, password: e.target.value })}
              />
              {workerErrors.password && <p className="field__error">{workerErrors.password}</p>}
            </div>

            <div className="field">
              <label htmlFor="w-verify">Verify Password</label>
              <input
                id="w-verify"
                type="password"
                placeholder="••••••••"
                value={workerForm.verify}
                onChange={(e) => setWorkerForm({ ...workerForm, verify: e.target.value })}
              />
              {workerErrors.verify && <p className="field__error">{workerErrors.verify}</p>}
            </div>

            <button type="submit" className="cta-btn cta-btn--dark">
              <span className="cta-btn__play" /> Enter
            </button>

            <p className="signup-form__alt">
              Have an account already?{" "}
              <Link to="/login" style={{ color: "inherit" }}>
                Log in
              </Link>
            </p>
          </form>
        </div>
      )}

      {stage === "employer" && (
        <div className="signup__form-wrap" style={{ maxWidth: 460 }}>
          <button className="signup-form__back" onClick={() => setStage("role")}>
            ← Back
          </button>
          <form className="signup-form signup-form--employer" onSubmit={handleEmployerSubmit} noValidate>
            <h3>Employer Sign Up</h3>
            <p className="signup__sub" style={{ textAlign: "left", margin: "0 0 8px" }}>Register your company</p>

            <div className="field">
              <label htmlFor="e-company">Company Name</label>
              <input
                id="e-company"
                type="text"
                placeholder="Acme Inc."
                value={empForm.company}
                onChange={(e) => setEmpForm({ ...empForm, company: e.target.value })}
              />
              {empErrors.company && <p className="field__error">{empErrors.company}</p>}
            </div>

            <div className="field">
              <label htmlFor="e-email">Company Email</label>
              <input
                id="e-email"
                type="email"
                placeholder="hr@acme.com"
                value={empForm.email}
                onChange={(e) => setEmpForm({ ...empForm, email: e.target.value })}
              />
              {empErrors.email && <p className="field__error">{empErrors.email}</p>}
            </div>

            <button type="submit" className="cta-btn cta-btn--dark">
              <span className="cta-btn__play" /> Sign Up
            </button>
          </form>
        </div>
      )}

      {(stage === "done-worker" || stage === "done-employer") && (
        <div className="card" style={{ maxWidth: 420, textAlign: "center" }}>
          <h3>Welcome to Nexora!</h3>
          <p style={{ color: "rgba(255,255,255,.85)" }}>
            {stage === "done-worker"
              ? "Your worker account was created successfully."
              : "Your employer account was created successfully."}
          </p>
          <Link to="/home" className="cta-btn cta-btn--orange" style={{ marginTop: 10 }}>
            <span className="cta-btn__play" /> Go to Dashboard
          </Link>
        </div>
      )}
    </div>
  );
}
