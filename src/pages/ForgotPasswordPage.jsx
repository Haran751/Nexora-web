import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import HeroArt from "../components/HeroArt.jsx";
import OtpInput from "../components/OtpInput.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { resetPasswordForEmail, verifyOtp, updateUserPassword, resendOtp } = useAuth();

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
    <div className="signup login-page">
      <HeroArt width={767} height={633} className="signup__art-bg" />

      <h1 className="signup__title">Reset Password</h1>
      <p className="signup__sub">Recover access to your Nexora account</p>

      {authError && (
        <div
          style={{
            maxWidth: 440,
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

      {step === "email" && (
        <div className="signup__form-wrap">
          <form className="signup-form signup-form--worker" onSubmit={handleRequestOtp} noValidate>
            <div className="field">
              <label htmlFor="fp-email">Enter your Gmail / Account Email</label>
              <input
                id="fp-email"
                type="email"
                placeholder="you@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
              />
              {emailError && <p className="field__error">{emailError}</p>}
            </div>

            <button type="submit" className="cta-btn cta-btn--dark" disabled={submitting}>
              <span className="cta-btn__play" /> {submitting ? "Sending OTP…" : "Send 6-Digit OTP"}
            </button>

            <p className="signup-form__alt">
              Remember your password?{" "}
              <Link to="/login" style={{ color: "inherit", fontWeight: 600 }}>
                Log in
              </Link>
            </p>
          </form>
        </div>
      )}

      {step === "otp" && (
        <div className="signup__form-wrap">
          <button className="signup-form__back" onClick={() => { setStep("email"); setVerifiedToken(""); }}>
            ← Change email
          </button>

          <div className="signup-form signup-form--worker">
            <h3>Enter OTP Code</h3>
            <p className="signup__sub" style={{ textAlign: "left", margin: "0 0 12px" }}>
              A 6-digit recovery code has been sent to:
            </p>

            <div className="otp-info-pill">
              <span>✉️</span>
              <strong>{email}</strong>
            </div>

            {!verifiedToken ? (
              <OtpInput
                email={email}
                onComplete={handleVerifyOtp}
                onResend={handleResendOtp}
                loading={submitting}
                error={authError}
                demoCode={demoCode}
              />
            ) : (
              <form onSubmit={handleResetPassword} style={{ marginTop: 14 }}>
                <div
                  style={{
                    background: "rgba(46, 204, 113, 0.2)",
                    border: "1px solid rgba(46, 204, 113, 0.4)",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    color: "#a3f7bf",
                    fontSize: "0.85rem",
                    marginBottom: 14,
                    textAlign: "center",
                  }}
                >
                  ✓ OTP verified! Please set your new password.
                </div>

                <div className="field">
                  <label htmlFor="new-pass">New Password</label>
                  <input
                    id="new-pass"
                    type="password"
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoFocus
                  />
                </div>

                <div className="field">
                  <label htmlFor="conf-pass">Confirm New Password</label>
                  <input
                    id="conf-pass"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  {passwordError && <p className="field__error">{passwordError}</p>}
                </div>

                <button type="submit" className="cta-btn cta-btn--dark" disabled={submitting}>
                  <span className="cta-btn__play" /> {submitting ? "Updating Password…" : "Update Password"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {step === "success" && (
        <div className="card" style={{ maxWidth: 420, textAlign: "center" }}>
          <span style={{ fontSize: "2.4rem", display: "block", marginBottom: 8 }}>🎉</span>
          <h3>Password Updated!</h3>
          <p style={{ color: "rgba(255,255,255,.85)" }}>
            Your account password has been successfully reset. You can now log in with your new credentials.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="cta-btn cta-btn--orange"
            style={{ marginTop: 14, width: "100%" }}
          >
            <span className="cta-btn__play" /> Back to Login
          </button>
        </div>
      )}
    </div>
  );
}
