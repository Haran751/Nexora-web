import { useState } from "react";
import { Link } from "react-router-dom";
import HeroArt from "../components/HeroArt.jsx";
import OtpInput from "../components/OtpInput.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const Magnifier = () => (
  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" strokeLinecap="round" />
  </svg>
);

export default function SignUpPage() {
  const { signUp, verifyOtp, resendOtp } = useAuth();
  const [stage, setStage] = useState("role"); // 'role' | 'worker' | 'employer' | 'otp-worker' | 'otp-employer' | 'done-worker' | 'done-employer'

  const [empForm, setEmpForm] = useState({ company: "", email: "", password: "" });
  const [empErrors, setEmpErrors] = useState({});
  const [workerForm, setWorkerForm] = useState({ name: "", email: "", password: "", verify: "" });
  const [workerErrors, setWorkerErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [authError, setAuthError] = useState("");
  const [demoCode, setDemoCode] = useState("");

  const validateEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  async function handleEmployerSubmit(e) {
    e.preventDefault();
    setAuthError("");
    const errs = {};
    if (!empForm.company.trim()) errs.company = "Company name is required.";
    if (!empForm.email.trim()) errs.email = "Company email is required.";
    else if (!validateEmail(empForm.email)) errs.email = "Enter a valid email.";
    if (!empForm.password || empForm.password.length < 6) errs.password = "Password must be at least 6 characters.";
    setEmpErrors(errs);

    if (Object.keys(errs).length === 0) {
      setSubmitting(true);
      try {
        const res = await signUp({
          email: empForm.email,
          password: empForm.password,
          fullName: empForm.company,
          role: "employer",
          companyName: empForm.company,
        });
        if (res?.demoCode) setDemoCode(res.demoCode);
        setStage("otp-employer");
      } catch (err) {
        setAuthError(err.message || "Failed to create employer account.");
      } finally {
        setSubmitting(false);
      }
    }
  }

  async function handleWorkerSubmit(e) {
    e.preventDefault();
    setAuthError("");
    const errs = {};
    if (!workerForm.name.trim()) errs.name = "Full name is required.";
    if (!validateEmail(workerForm.email)) errs.email = "Enter a valid email.";
    if (workerForm.password.length < 6) errs.password = "Password must be at least 6 characters.";
    if (workerForm.password !== workerForm.verify) errs.verify = "Passwords do not match.";
    setWorkerErrors(errs);

    if (Object.keys(errs).length === 0) {
      setSubmitting(true);
      try {
        const res = await signUp({
          email: workerForm.email,
          password: workerForm.password,
          fullName: workerForm.name,
          role: "worker",
        });
        if (res?.demoCode) setDemoCode(res.demoCode);
        setStage("otp-worker");
      } catch (err) {
        setAuthError(err.message || "Failed to create worker account.");
      } finally {
        setSubmitting(false);
      }
    }
  }

  async function handleVerifyOtp(token) {
    setAuthError("");
    setSubmitting(true);
    const email = stage === "otp-employer" ? empForm.email : workerForm.email;
    try {
      await verifyOtp({
        email,
        token,
        type: "signup",
      });
      setStage(stage === "otp-employer" ? "done-employer" : "done-worker");
    } catch (err) {
      setAuthError(err.message || "Verification code is invalid or expired.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResendOtp() {
    setAuthError("");
    const email = stage === "otp-employer" ? empForm.email : workerForm.email;
    try {
      const res = await resendOtp({ email, type: "signup" });
      if (res?.demoCode) setDemoCode(res.demoCode);
    } catch (err) {
      setAuthError(err.message || "Failed to resend verification code.");
    }
  }

  return (
    <div className="signup">
      <HeroArt width={767} height={633} className="signup__art-bg" />
      <h1 className="signup__title">Get Started with Nexora</h1>
      <p className="signup__sub">Choose how you want to join the Nexora community.</p>

      {authError && (
        <div
          style={{
            maxWidth: 420,
            width: "100%",
            margin: "0 auto 16px",
            padding: "10px 14px",
            background: "rgba(220, 53, 69, 0.2)",
            border: "1px solid rgba(220, 53, 69, 0.4)",
            borderRadius: "8px",
            color: "#ff8b94",
            fontSize: "0.88rem",
            textAlign: "center",
          }}
        >
          {authError}
        </div>
      )}

      {stage === "role" && (
        <div className="signup__grid">
          <button className="role-card role-card--worker" onClick={() => { setAuthError(""); setStage("worker"); }}>
            <span className="role-card__ico">
              <Magnifier />
            </span>
            <h3>For Workers</h3>
            <p>Find your next opportunity yourself.</p>
          </button>
          <button className="role-card role-card--employer" onClick={() => { setAuthError(""); setStage("employer"); }}>
            <span className="role-card__ico">
              <img src="/for-employer.png" alt="For Employers" width="44" height="44" loading="lazy" decoding="async" />
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
              <label htmlFor="w-name">Full Name</label>
              <input
                id="w-name"
                type="text"
                placeholder="Alex Morgan"
                value={workerForm.name}
                onChange={(e) => setWorkerForm({ ...workerForm, name: e.target.value })}
              />
              {workerErrors.name && <p className="field__error">{workerErrors.name}</p>}
            </div>

            <div className="field">
              <label htmlFor="w-email">Gmail / Email</label>
              <input
                id="w-email"
                type="email"
                placeholder="you@gmail.com"
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

            <button type="submit" className="cta-btn cta-btn--dark" disabled={submitting}>
              <span className="cta-btn__play" /> {submitting ? "Sending OTP…" : "Continue with Gmail OTP"}
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
              <label htmlFor="e-email">Company Gmail / Email</label>
              <input
                id="e-email"
                type="email"
                placeholder="hr@company.com"
                value={empForm.email}
                onChange={(e) => setEmpForm({ ...empForm, email: e.target.value })}
              />
              {empErrors.email && <p className="field__error">{empErrors.email}</p>}
            </div>

            <div className="field">
              <label htmlFor="e-pass">Password</label>
              <input
                id="e-pass"
                type="password"
                placeholder="••••••••"
                value={empForm.password}
                onChange={(e) => setEmpForm({ ...empForm, password: e.target.value })}
              />
              {empErrors.password && <p className="field__error">{empErrors.password}</p>}
            </div>

            <button type="submit" className="cta-btn cta-btn--dark" disabled={submitting}>
              <span className="cta-btn__play" /> {submitting ? "Sending OTP…" : "Continue with Gmail OTP"}
            </button>
          </form>
        </div>
      )}

      {(stage === "otp-worker" || stage === "otp-employer") && (
        <div className="signup__form-wrap">
          <button
            className="signup-form__back"
            onClick={() => setStage(stage === "otp-employer" ? "employer" : "worker")}
          >
            ← Change email
          </button>

          <div
            className={`signup-form ${stage === "otp-employer" ? "signup-form--employer" : "signup-form--worker"}`}
          >
            <h3>Verify Your Gmail</h3>
            <p className="signup__sub" style={{ textAlign: "left", margin: "0 0 12px" }}>
              Enter the 6-digit code sent to:
            </p>

            <div className="otp-info-pill">
              <span>✉️</span>
              <strong>{stage === "otp-employer" ? empForm.email : workerForm.email}</strong>
            </div>

            <OtpInput
              email={stage === "otp-employer" ? empForm.email : workerForm.email}
              onComplete={handleVerifyOtp}
              onResend={handleResendOtp}
              loading={submitting}
              error={authError}
              demoCode={demoCode}
            />
          </div>
        </div>
      )}

      {(stage === "done-worker" || stage === "done-employer") && (
        <div className="card" style={{ maxWidth: 420, textAlign: "center" }}>
          <h3>Welcome to Nexora! 🎉</h3>
          <p style={{ color: "rgba(255,255,255,.85)" }}>
            {stage === "done-worker"
              ? "Your Gmail has been verified. Your worker account is now active!"
              : "Your Gmail has been verified. Your employer account is now active!"}
          </p>
          <Link
            to={stage === "done-employer" ? "/employer" : "/home"}
            className="cta-btn cta-btn--orange"
            style={{ marginTop: 10 }}
          >
            <span className="cta-btn__play" /> Go to Dashboard
          </Link>
        </div>
      )}
    </div>
  );
}
