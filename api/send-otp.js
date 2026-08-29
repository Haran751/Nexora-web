import nodemailer from "nodemailer";
import { checkRateLimit, storeRecoveryOtp } from "./_store.js";

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export default async function handler(req, res) {
  // Security headers
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Parse body safely
  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ error: "Malformed JSON payload" });
    }
  }

  const { to_email, to_name = "User", otp_code, type = "signup" } = body || {};

  // Strict boundary validation
  if (!to_email || typeof to_email !== "string" || !EMAIL_REGEX.test(to_email.trim())) {
    return res.status(400).json({ error: "Valid recipient email is required" });
  }

  if (!otp_code || typeof otp_code !== "string" || !/^\d{6}$/.test(otp_code.trim())) {
    return res.status(400).json({ error: "Valid 6-digit OTP code is required" });
  }

  // Sanitize header injection possibilities
  const cleanEmail = to_email.trim().toLowerCase().replace(/[\r\n]/g, "");
  const cleanName = String(to_name).trim().slice(0, 50).replace(/[\r\n]/g, "");
  const cleanType = type === "recovery" ? "recovery" : "signup";

  // Rate Limiting (Defense against DoS, SMS/Email bombing, and brute-force)
  const clientIp = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket?.remoteAddress || "local";
  const ipAllowed = checkRateLimit(`otp-ip:${clientIp}`, 10, 10 * 60 * 1000);
  const emailAllowed = checkRateLimit(`otp-email:${cleanEmail}`, 5, 10 * 60 * 1000);

  if (!ipAllowed || !emailAllowed) {
    return res.status(429).json({
      error: "Terlalu banyak permintaan OTP. Silakan tunggu beberapa menit sebelum mencoba lagi.",
    });
  }

  // If this is password recovery, save OTP state securely for verification
  if (cleanType === "recovery") {
    storeRecoveryOtp(cleanEmail, otp_code.trim());
  }

  const gmailUser = process.env.GMAIL_USER?.trim();
  const gmailPass = process.env.GMAIL_APP_PASSWORD?.trim();

  // Mode demo fallback jika environment variables SMTP belum dikonfigurasi (memudahkan penjurian lomba)
  if (!gmailUser || !gmailPass) {
    console.log(`[DEMO SMTP] Email tujuan: ${cleanEmail} | Kode OTP: ${otp_code}`);
    return res.status(200).json({
      success: true,
      demo: true,
      otp_code: otp_code.trim(),
      message: "GMAIL_USER atau GMAIL_APP_PASSWORD belum diisi di .env. Mode demo aktif.",
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

    const isSignup = cleanType === "signup";
    const subject = isSignup
      ? `Kode Verifikasi Akun Nexora: ${otp_code}`
      : `Kode Reset Password Nexora: ${otp_code}`;

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
            <p class="greeting">Halo, ${cleanName}!</p>
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

    const plainText = `Halo ${cleanName},\n\n${
      isSignup
        ? "Terima kasih telah mendaftar di Nexora. Berikut kode verifikasi OTP Anda:"
        : "Berikut kode OTP reset password akun Nexora Anda:"
    }\n\nKODE OTP: ${otp_code}\n\nKode ini berlaku selama 10 menit. Jangan berikan kode ini kepada siapapun demi keamanan akun Anda.\n\nSalam,\nNexora Platform`;

    await transporter.sendMail({
      from: `"Nexora Security" <${gmailUser}>`,
      replyTo: gmailUser,
      to: cleanEmail,
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
    console.error("Gagal kirim email via SMTP Gmail:", err.message);
    // Generic sanitized error message to prevent leaking internal SMTP config
    return res.status(500).json({ error: "Gagal mengirim email verifikasi. Pastikan konfigurasi SMTP benar." });
  }
}
