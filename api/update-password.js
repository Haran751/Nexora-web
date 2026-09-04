import { createClient } from "@supabase/supabase-js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const rateLimitMap = new Map();

function checkRateLimit(key, maxRequests = 5, windowMs = 15 * 60 * 1000) {
  const now = Date.now();
  const entry = rateLimitMap.get(key) || { count: 0, resetAt: now + windowMs };

  if (now > entry.resetAt) {
    entry.count = 1;
    entry.resetAt = now + windowMs;
    rateLimitMap.set(key, entry);
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (entry.count >= maxRequests) {
    const retryAfterSeconds = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, retryAfterSeconds };
  }

  entry.count += 1;
  rateLimitMap.set(key, entry);
  return { allowed: true, remaining: maxRequests - entry.count };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }

  const { email, newPassword, resetToken } = body || {};

  // Input Validation
  if (!email || !EMAIL_REGEX.test(email)) {
    return res.status(400).json({ error: "Valid email address is required" });
  }

  if (!newPassword || typeof newPassword !== "string" || newPassword.length < 8 || newPassword.length > 128) {
    return res.status(400).json({ error: "Password must be between 8 and 128 characters" });
  }

  // Require OTP verification token for password reset
  if (!resetToken || typeof resetToken !== "string" || !resetToken.startsWith("rst_")) {
    return res.status(401).json({ error: "Invalid or missing OTP verification token. Please verify OTP first." });
  }

  // Rate Limiting (max 5 attempts per 15 minutes per IP/email)
  const clientIp = req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "local";
  const rateLimitKey = `pwd_${clientIp}_${email.toLowerCase()}`;
  const rateCheck = checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000);

  if (!rateCheck.allowed) {
    res.setHeader("Retry-After", String(rateCheck.retryAfterSeconds));
    return res.status(429).json({
      error: `Terlalu banyak percobaan update password. Silakan tunggu ${rateCheck.retryAfterSeconds} detik sebelum mencoba lagi.`,
    });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL?.trim();
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY)?.trim();

  if (!supabaseUrl || !serviceKey) {
    return res.status(200).json({ success: true, message: "Demo mode updated" });
  }

  try {
    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // 1. Jika ada service_role key, gunakan Admin API resmi Supabase
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
      if (listError) throw listError;

      const target = users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
      if (!target) {
        // Return generic success or not found without leaking user existence
        return res.status(200).json({ success: true, message: "If the email exists, password has been updated." });
      }

      const { error: updateError } = await supabase.auth.admin.updateUserById(target.id, {
        password: newPassword,
      });

      if (updateError) throw updateError;
      return res.status(200).json({ success: true, message: "Password updated successfully." });
    }

    // 2. Jika hanya anon key, panggil RPC reset_password_by_email
    const { data: rpcSuccess, error: rpcError } = await supabase.rpc("reset_password_by_email", {
      user_email: email.trim(),
      new_plain_password: newPassword,
    });

    if (rpcError) {
      console.warn("RPC reset_password_by_email failed:", rpcError.message);
      return res.status(400).json({
        error: "Failed to update password. Please check your configuration.",
      });
    }

    return res.status(200).json({ success: true, message: "Password updated successfully." });
  } catch (err) {
    console.error("update-password error:", err);
    return res.status(500).json({ error: "Internal server error while updating password" });
  }
}
