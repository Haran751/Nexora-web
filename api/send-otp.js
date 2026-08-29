import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Parse body (bisa berupa object JSON atau string JSON)
  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }

  const { to_email, to_name = "User", otp_code, type = "signup" } = body || {};

  if (!to_email || !otp_code) {
    return res.status(400).json({ error: "to_email and otp_code are required" });
  }

  const gmailUser = process.env.GMAIL_USER?.trim();
  const gmailPass = process.env.GMAIL_APP_PASSWORD?.trim();

  // Jika belum diset di .env, jalankan fallback mode demo agar tidak crash
  if (!gmailUser || !gmailPass) {
    console.log(`[DEMO SMTP] Email ke: ${to_email} | Kode OTP: ${otp_code}`);
    return res.status(200).json({
      success: true,
      demo: true,
      otp_code,
      message: "GMAIL_USER atau GMAIL_APP_PASSWORD belum diisi di .env. Kode dicetak di log.",
    });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
    });

    const isSignup = type === "signup";
    const subject = isSignup
      ? `Kode Verifikasi Akun Nexora: ${otp_code}`
      : `Kode Reset Password Nexora: ${otp_code}`;

    // TEMPLATE EMAIL DITULIS LANGSUNG DI DALAM KODINGAN
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Inter', Arial, sans-serif; background-color: #f4ece7; margin: 0; padding: 24px; color: #3d1028; }
          .container { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(61, 16, 40, 0.15); }
          .header { background: linear-gradient(180deg, #42154c, #632248); padding: 32px 24px; text-align: center; color: #ffffff; }
          .header h1 { margin: 0; font-size: 26px; font-weight: 700; letter-spacing: 1px; }
          .body { padding: 32px 28px; }
          .greeting { font-size: 16px; font-weight: 600; margin-bottom: 12px; }
          .otp-box { background: #fdf6f0; border: 2px dashed #e8883c; border-radius: 12px; padding: 18px; text-align: center; margin: 24px 0; }
          .otp-code { font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #e8883c; font-family: monospace; }
          .footer { padding: 20px 28px; background: #faf5f2; font-size: 12.5px; color: #8b6070; text-align: center; border-top: 1px solid #f0e2db; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Nexora</h1>
            <p style="margin: 6px 0 0; opacity: 0.85; font-size: 14px;">Next-Gen Career & Opportunity Platform</p>
          </div>
          <div class="body">
            <p class="greeting">Halo, ${to_name}!</p>
            <p style="line-height: 1.6;">
              ${
                isSignup
                  ? "Terima kasih telah mendaftar di Nexora. Gunakan kode verifikasi 6-digit berikut untuk mengaktifkan akun Anda:"
                  : "Kami menerima permintaan untuk mereset password akun Nexora Anda. Gunakan kode berikut untuk melanjutkan:"
              }
            </p>
            
            <div class="otp-box">
              <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700; color: #c46a28; margin-bottom: 6px;">KODE VERIFIKASI OTP</div>
              <div class="otp-code">${otp_code}</div>
            </div>

            <p style="font-size: 13.5px; color: #666; line-height: 1.5;">
              ⚠️ Kode ini hanya berlaku selama <b>10 menit</b>. Jangan berikan kode ini kepada siapapun demi keamanan akun Anda.
            </p>
          </div>
          <div class="footer">
            &copy; 2026 Nexora Platform. Hak cipta dilindungi undang-undang.
          </div>
        </div>
      </body>
      </html>
    `;

    const plainText = `Halo ${to_name},\n\n${
      isSignup
        ? "Terima kasih telah mendaftar di Nexora. Berikut kode verifikasi OTP Anda:"
        : "Berikut kode OTP reset password akun Nexora Anda:"
    }\n\nKODE OTP: ${otp_code}\n\nKode ini berlaku selama 10 menit. Jangan berikan kode ini kepada siapapun demi keamanan akun Anda.\n\nSalam,\nNexora Platform`;

    await transporter.sendMail({
      from: `"Nexora" <${gmailUser}>`,
      replyTo: gmailUser,
      to: to_email,
      subject,
      text: plainText,
      html: htmlContent,
      priority: "high",
      headers: {
        "X-Priority": "1",
        "X-MSMail-Priority": "High",
        Importance: "high",
      },
    });

    return res.status(200).json({ success: true, message: "Email OTP berhasil dikirim." });
  } catch (err) {
    console.error("Gagal kirim email via SMTP Gmail:", err);
    return res.status(500).json({ error: err.message || "Gagal mengirim email via SMTP." });
  }
}
