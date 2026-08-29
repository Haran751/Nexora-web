import { createClient } from "@supabase/supabase-js";
import { checkRateLimit, consumeResetAuthorization } from "./_store.js";

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export default async function handler(req, res) {
  // Security headers
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ error: "Malformed JSON payload" });
    }
  }

  const { email, newPassword, token, otpCode } = body || {};

  // Boundary input validation
  if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
    return res.status(400).json({ error: "Format email tidak valid." });
  }

  if (!newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
    return res.status(400).json({ error: "Password baru harus memiliki minimal 6 karakter." });
  }

  if (newPassword.length > 128) {
    return res.status(400).json({ error: "Password terlalu panjang (maksimal 128 karakter)." });
  }

  const cleanEmail = email.trim().toLowerCase();
  const resetCode = String(token || otpCode || "").trim();

  // Rate Limiting on password updates
  const clientIp = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket?.remoteAddress || "local";
  const allowed = checkRateLimit(`pwd-reset:${cleanEmail}`, 5, 15 * 60 * 1000);
  const ipAllowed = checkRateLimit(`pwd-reset-ip:${clientIp}`, 10, 15 * 60 * 1000);

  if (!allowed || !ipAllowed) {
    return res.status(429).json({
      error: "Terlalu banyak percobaan reset password. Silakan coba lagi setelah 15 menit.",
    });
  }

  // Authorization Check: Must possess a valid, unexpired, verified recovery OTP or code
  const isAuthorized = consumeResetAuthorization(cleanEmail, resetCode);

  const supabaseUrl = process.env.VITE_SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  // If in demo mode (no backend credentials configured)
  if (!supabaseUrl || !serviceKey) {
    if (!isAuthorized && resetCode !== "123456") {
      return res.status(403).json({ error: "Kode verifikasi OTP tidak valid atau telah kedaluwarsa." });
    }
    return res.status(200).json({ success: true, demo: true, message: "Demo mode password updated." });
  }

  // In production / configured Supabase mode: Strictly require valid authorization
  if (!isAuthorized) {
    return res.status(403).json({
      error: "Otorisasi reset password tidak valid atau telah kedaluwarsa. Silakan minta kode OTP baru.",
    });
  }

  try {
    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) throw listError;

    const target = users.find((u) => u.email?.toLowerCase() === cleanEmail);
    if (!target) {
      // Use generic message to prevent account enumeration
      return res.status(404).json({ error: "Permintaan reset password tidak dapat diproses." });
    }

    const { error: updateError } = await supabase.auth.admin.updateUserById(target.id, {
      password: newPassword,
    });

    if (updateError) throw updateError;

    return res.status(200).json({ success: true, message: "Password berhasil diperbarui." });
  } catch (err) {
    console.error("update-password secure handler error:", err.message);
    return res.status(500).json({ error: "Gagal memperbarui password. Silakan coba lagi." });
  }
}
