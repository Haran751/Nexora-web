export async function sendOtpEmail({ to_email, to_name = "User", otp_code, type = "signup" }) {
  try {
    const res = await fetch("/api/send-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to_email,
        to_name,
        otp_code,
        type,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Gagal mengirim email OTP.");
    }
    return data;
  } catch (err) {
    console.error("sendOtpEmail fetch error:", err);
    throw new Error(err.message || "Gagal menghubungi layanan pengiriman email. Silakan coba kembali.");
  }
}
