import { useState, useRef, useEffect } from "react";

export default function OtpInput({
  email,
  onComplete,
  onResend,
  loading = false,
  error = "",
  
}) {
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  // Auto-focus kotak pertama saat pertama kali muncul
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Countdown timer 60 detik
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((t) => t - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleChange = (index, val) => {
    const clean = val.replace(/\D/g, "");
    if (!clean) {
      const next = [...digits];
      next[index] = "";
      setDigits(next);
      return;
    }

    const next = [...digits];
    next[index] = clean.slice(-1); // ambil 1 digit terakhir
    setDigits(next);

    // Auto-advance ke input berikutnya
    if (index < 5 && clean) {
      inputRefs.current[index + 1]?.focus();
    }

    // Jika sudah lengkap 6 digit, otomatis submit
    const fullOtp = next.join("");
    if (fullOtp.length === 6 && !fullOtp.includes("")) {
      onComplete(fullOtp);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (!digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
        const next = [...digits];
        next[index - 1] = "";
        setDigits(next);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasteData) return;

    const next = [...digits];
    for (let i = 0; i < 6; i++) {
      next[i] = pasteData[i] || "";
    }
    setDigits(next);

    const focusIdx = Math.min(pasteData.length, 5);
    inputRefs.current[focusIdx]?.focus();

    if (pasteData.length === 6) {
      onComplete(pasteData);
    }
  };

  const handleResend = async () => {
    if (!canResend || loading) return;
    setDigits(["", "", "", "", "", ""]);
    setTimer(60);
    setCanResend(false);
    if (onResend) {
      await onResend();
    }
    inputRefs.current[0]?.focus();
  };

  
  return (
    <div className="otp-container">
      {demoCode && (
        <div className="otp-demo-pill" onClick={handleAutofillDemo} title="Click to autofill demo code">
          <span className="otp-demo-dot" />
          <span>Demo OTP Code: <b>{demoCode}</b> (click to autofill)</span>
        </div>
      )}

      <div className="otp-inputs" onPaste={handlePaste}>
        {digits.map((digit, idx) => (
          <input
            key={idx}
            ref={(el) => (inputRefs.current[idx] = el)}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            className={`otp-box ${digit ? "otp-box--filled" : ""} ${error ? "otp-box--error" : ""}`}
            disabled={loading}
            aria-label={`Digit ${idx + 1}`}
            autoComplete="one-time-code"
          />
        ))}
      </div>

      {error && <p className="field__error" style={{ textAlign: "center", margin: "12px 0 6px" }}>{error}</p>}

      <div className="otp-footer">
        <div className="otp-timer">
          {canResend ? (
            <button
              type="button"
              className="otp-resend-btn"
              onClick={handleResend}
              disabled={loading}
            >
              Resend code to Gmail
            </button>
          ) : (
            <span className="otp-timer__text">
              Resend code in <b>{String(timer).padStart(2, "0")}s</b>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
