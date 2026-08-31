import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import OtpInput from "../components/OtpInput.jsx";
import useScrollReveal from "../hooks/useScrollReveal.js";
import { useAuth } from "../context/AuthContext.jsx";

const gradient = "linear-gradient(90deg, #ad4359 0%, #ab4259 30%, #ad4359 55%, #4d194b 100%)";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { resetPasswordForEmail, verifyOtp, updateUserPassword, resendOtp } = useAuth();
  const revealRef = useScrollReveal();

  const [step, setStep] = useState("email"); // 'email' | 'otp' | 'success'
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [authError, setAuthError] = useState("");
  const [demoCode, setDemoCode] = useState("");
  const [verifiedToken, setVerifiedToken] = useState("");

  const validateEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setAuthError("");
    setEmailError("");

    if (!email.trim()) {
      setEmailError("Gmail / Email is required.");
      return;
    }
    if (!validateEmail(email)) {
      setEmailError("Enter a valid email address.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await resetPasswordForEmail(email.trim());
      if (res?.demoCode) setDemoCode(res.demoCode);
      setStep("otp");
    } catch (err) {
      setAuthError(err.message || "Failed to send reset code. Please check the email address.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOtp = async (token) => {
    setAuthError("");
    setSubmitting(true);
    try {
      await verifyOtp({
        email: email.trim(),
        token,
        type: "recovery",
      });
      setVerifiedToken(token);
      setAuthError("");
    } catch (err) {
      setAuthError(err.message || "Invalid or expired recovery code.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    setAuthError("");
    try {
      const res = await resendOtp({ email: email.trim(), type: "recovery" });
      if (res?.demoCode) setDemoCode(res.demoCode);
    } catch (err) {
      setAuthError(err.message || "Failed to resend code.");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setAuthError("");

    if (!newPassword || newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      await updateUserPassword({ email: email.trim(), newPassword, token: verifiedToken });
      setStep("success");
    } catch (err) {
      setAuthError(err.message || "Failed to update password. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="forgot" ref={revealRef}>
      <header className="forgot__navbar">
        <Link to="/login" className="forgot__navbar-brand">
          <img src="/logo-nexora.webp" alt="Nexora logo" width="38" height="38" loading="lazy" decoding="async" />
          Nexora
        </Link>
      </header>

      <div className="forgot__content">

      {authError && (
        <div className="forgot__error">
          {authError}
        </div>
      )}

      {step === "email" && (
        <div className="forgot-card" role="dialog" aria-modal="true" aria-label="Forgot password">
          <h2 className="forgot-card__title">Forgot Your Password?</h2>
          <p className="forgot-card__sub">
            Masukkan email terdaftar Anda dan kami akan mengirimkan kode OTP untuk memulihkan akun Anda.
          </p>

          <form onSubmit={handleRequestOtp} noValidate>
            <div className="forgot-field">
              <label htmlFor="fp-email">Email Terdaftar</label>
              <input
                id="fp-email"
                type="email"
                placeholder="contoh@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
              />
              {emailError && <p className="forgot-field__error">{emailError}</p>}
            </div>

            <button type="submit" className="forgot-btn" style={{ background: gradient }} disabled={submitting}>
              {submitting ? "Mengirim…" : "Request kode otp"}
            </button>
          </form>

          <Link to="/login" className="forgot-card__back">
            ← Back To Login
          </Link>
        </div>
      )}

      {step === "otp" && (
        <div className="forgot-card" role="dialog" aria-modal="true" aria-label="Check your email">
          <button className="forgot-card__back-top" onClick={() => { setStep("email"); setVerifiedToken(""); }}>
            ← Change email
          </button>

          <h2 className="forgot-card__title">Check your email!</h2>
          <p className="forgot-card__sub">
            Kami telah mengirimkan kode 6-digit ke <strong className="forgot-card__email">{email}</strong>. Masukkan
            kode di bawah untuk melanjutkan.
          </p>

          {!verifiedToken ? (
            <>
              <OtpInput
                email={email}
                onComplete={handleVerifyOtp}
                onResend={handleResendOtp}
                loading={submitting}
                error={authError}
                demoCode={demoCode}
              />
              <button className="forgot-btn" style={{ background: gradient }} disabled={submitting}>
                Enter
              </button>
            </>
          ) : (
            <form onSubmit={handleResetPassword} noValidate>
              <div className="forgot-verified">✓ OTP verified! Silakan atur password baru Anda.</div>
              <div className="forgot-field">
                <label htmlFor="new-pass">New Password</label>
                <input
                  id="new-pass"
                  type="password"
                  placeholder="Minimal 6 karakter"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="forgot-field">
                <label htmlFor="conf-pass">Confirm New Password</label>
                <input
                  id="conf-pass"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                {passwordError && <p className="forgot-field__error">{passwordError}</p>}
              </div>
              <button type="submit" className="forgot-btn" style={{ background: gradient }} disabled={submitting}>
                {submitting ? "Memperbarui…" : "Update Password"}
              </button>
            </form>
          )}

          <Link to="/login" className="forgot-card__back">
            ← Back To Login
          </Link>
        </div>
      )}

      {step === "success" && (
        <div className="forgot-card forgot-card--success">
          <span className="forgot-card__emoji">🎉</span>
          <h2 className="forgot-card__title">Password Updated!</h2>
          <p className="forgot-card__sub">
            Password akun Anda berhasil direset. Anda kini dapat masuk dengan kredensial baru.
          </p>
          <button className="forgot-btn" style={{ background: gradient }} onClick={() => navigate("/login")}>
            Back to Login
          </button>
        </div>
      )}
      </div>
    </div>
  );
}
