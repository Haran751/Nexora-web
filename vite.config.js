import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

// In-memory store for rate limiting and recovery codes in dev server
const devRateLimits = new Map();
const devRecoveryStore = new Map();

function checkDevRateLimit(key, limit = 5, windowMs = 10 * 60 * 1000) {
  const now = Date.now();
  const record = devRateLimits.get(key);
  if (!record || now > record.resetAt) {
    devRateLimits.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (record.count >= limit) return false;
  record.count += 1;
  return true;
}

function securityHeadersPlugin() {
  return {
    name: "security-headers-plugin",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === "/robots.txt" || req.url?.startsWith("/robots.txt?")) {
          const robotsPath = path.resolve(process.cwd(), "public/robots.txt");
          if (fs.existsSync(robotsPath)) {
            res.setHeader("Content-Type", "text/plain; charset=utf-8");
            res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
            res.end(fs.readFileSync(robotsPath, "utf-8"));
            return;
          }
        }
        res.setHeader("X-Content-Type-Options", "nosniff");
        res.setHeader("X-Frame-Options", "SAMEORIGIN");
        res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
        res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
        next();
      });
    },
  };
}

function smtpApiPlugin(env) {
  return {
    name: "smtp-api-dev-server",
    configureServer(server) {
      server.middlewares.use("/api/send-otp", async (req, res) => {
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
        res.setHeader("X-Content-Type-Options", "nosniff");
        res.setHeader("X-Frame-Options", "DENY");

        if (req.method !== "POST") {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: "Method not allowed" }));
          return;
        }

        let bodyRaw = "";
        req.on("data", (chunk) => {
          bodyRaw += chunk;
          if (bodyRaw.length > 50000) {
            req.destroy();
          }
        });

        req.on("end", async () => {
          let body = {};
          try {
            body = JSON.parse(bodyRaw);
          } catch {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: "Malformed JSON" }));
            return;
          }

          const { to_email, to_name = "User", otp_code, type = "signup" } = body;

          if (!to_email || typeof to_email !== "string" || !EMAIL_REGEX.test(to_email.trim())) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: "Valid recipient email is required" }));
            return;
          }

          if (!otp_code || typeof otp_code !== "string" || !/^\d{6}$/.test(otp_code.trim())) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: "Valid 6-digit OTP code is required" }));
            return;
          }

          const cleanEmail = to_email.trim().toLowerCase().replace(/[\r\n]/g, "");
          const cleanName = String(to_name).trim().slice(0, 50).replace(/[\r\n]/g, "");
          const cleanCode = otp_code.trim();

          // Rate limit checks
          const clientIp = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket?.remoteAddress || "local";
          if (!checkDevRateLimit(`send-otp:${cleanEmail}`, 5) || !checkDevRateLimit(`send-otp-ip:${clientIp}`, 10)) {
            res.statusCode = 429;
            res.end(JSON.stringify({ error: "Terlalu banyak permintaan OTP. Silakan tunggu beberapa menit." }));
            return;
          }

          // If recovery, store in dev store for verification
          if (type === "recovery") {
            devRecoveryStore.set(cleanEmail, {
              code: cleanCode,
              expiresAt: Date.now() + 10 * 60 * 1000,
              attempts: 0,
              verified: false,
            });
          }

          const gmailUser = env.GMAIL_USER?.trim() || process.env.GMAIL_USER?.trim();
          const gmailPass = env.GMAIL_APP_PASSWORD?.trim() || process.env.GMAIL_APP_PASSWORD?.trim();

          if (!gmailUser || !gmailPass) {
            console.log(`\n\x1b[33m[DEMO SMTP]\x1b[0m Email tujuan: \x1b[36m${cleanEmail}\x1b[0m | Kode OTP: \x1b[32m${cleanCode}\x1b[0m`);
            console.log(`\x1b[90m(Tips: Tambahkan GMAIL_USER dan GMAIL_APP_PASSWORD di .env agar email benar-benar masuk ke inbox Gmail)\x1b[0m\n`);
            res.statusCode = 200;
            res.end(JSON.stringify({ success: true, demo: true, otp_code: cleanCode }));
            return;
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
              ? `Kode Verifikasi Akun Nexora: ${cleanCode}`
              : `Kode Reset Password Nexora: ${cleanCode}`;

            const htmlContent = `
              <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; border: 1px solid #eee;">
                <div style="background: #42154C; padding: 24px; text-align: center; color: #fff;">
                  <h1 style="margin: 0; font-size: 24px;">Nexora</h1>
                  <p style="margin: 4px 0 0; opacity: 0.8; font-size: 13px;">Career & Opportunity Platform</p>
                </div>
                <div style="padding: 24px; color: #333;">
                  <p style="font-size: 15px; font-weight: 600;">Halo ${cleanName},</p>
                  <p style="line-height: 1.5; color: #555;">
                    ${isSignup ? "Kode OTP verifikasi pendaftaran akun Anda adalah:" : "Kode OTP reset password akun Anda adalah:"}
                  </p>
                  <div style="background: #fff8f3; border: 2px dashed #e8883c; border-radius: 8px; padding: 16px; text-align: center; margin: 20px 0;">
                    <div style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #e8883c; font-family: monospace;">
                      ${cleanCode}
                    </div>
                  </div>
                  <p style="font-size: 13px; color: #888;">Kode ini berlaku 10 menit. Jangan bagikan kode ini kepada siapapun.</p>
                </div>
              </div>
            `;

            const plainText = `Halo ${cleanName},\n\n${
              isSignup
                ? "Terima kasih telah mendaftar di Nexora. Berikut kode verifikasi OTP Anda:"
                : "Berikut kode OTP reset password akun Nexora Anda:"
            }\n\nKODE OTP: ${cleanCode}\n\nKode ini berlaku selama 10 menit. Jangan berikan kode ini kepada siapapun demi keamanan akun Anda.\n\nSalam,\nNexora Platform`;

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

            console.log(`\n\x1b[32m[SMTP SUKSES]\x1b[0m Email OTP berhasil dikirim ke: \x1b[36m${cleanEmail}\x1b[0m\n`);
            res.statusCode = 200;
            res.end(JSON.stringify({ success: true, message: "Email OTP berhasil dikirim." }));
          } catch (err) {
            console.error("\x1b[31m[SMTP ERROR]\x1b[0m", err.message);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: "Gagal mengirim email via SMTP." }));
          }
        });
      });

      server.middlewares.use("/api/update-password", async (req, res) => {
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
        res.setHeader("X-Content-Type-Options", "nosniff");
        res.setHeader("X-Frame-Options", "DENY");

        if (req.method !== "POST") {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: "Method not allowed" }));
          return;
        }

        let bodyRaw = "";
        req.on("data", (chunk) => {
          bodyRaw += chunk;
          if (bodyRaw.length > 50000) req.destroy();
        });

        req.on("end", async () => {
          let body = {};
          try {
            body = JSON.parse(bodyRaw);
          } catch {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: "Malformed JSON" }));
            return;
          }

          const { email, newPassword, token, otpCode } = body;

          if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: "Format email tidak valid." }));
            return;
          }

          if (!newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: "Password baru minimal 6 karakter." }));
            return;
          }

          const cleanEmail = email.trim().toLowerCase();
          const clientIp = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket?.remoteAddress || "local";

          if (!checkDevRateLimit(`pwd-reset:${cleanEmail}`, 5, 15 * 60 * 1000) || !checkDevRateLimit(`pwd-reset-ip:${clientIp}`, 10, 15 * 60 * 1000)) {
            res.statusCode = 429;
            res.end(JSON.stringify({ error: "Terlalu banyak percobaan reset password. Tunggu 15 menit." }));
            return;
          }

          // Verify recovery token/code from store
          const providedCode = String(token || otpCode || "").trim();
          const rec = devRecoveryStore.get(cleanEmail);
          let isAuthorized = false;

          if (rec && Date.now() <= rec.expiresAt) {
            rec.attempts += 1;
            if (rec.verified || (providedCode && providedCode === rec.code)) {
              isAuthorized = true;
              devRecoveryStore.delete(cleanEmail); // Single-use
            }
          }

          const supabaseUrl = env.VITE_SUPABASE_URL?.trim() || process.env.VITE_SUPABASE_URL?.trim();
          const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY?.trim() || process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

          // Demo fallback mode (memudahkan penjurian lomba jika credentials belum diisi)
          if (!supabaseUrl || !serviceKey) {
            if (!isAuthorized && providedCode !== "123456") {
              res.statusCode = 403;
              res.end(JSON.stringify({ error: "Kode verifikasi OTP tidak valid atau kedaluwarsa." }));
              return;
            }
            res.statusCode = 200;
            res.end(JSON.stringify({ success: true, demo: true }));
            return;
          }

          // Production / configured mode strictly requires authorization
          if (!isAuthorized) {
            res.statusCode = 403;
            res.end(JSON.stringify({ error: "Otorisasi reset password tidak valid atau telah kedaluwarsa." }));
            return;
          }

          try {
            const { createClient } = await import("@supabase/supabase-js");
            const supabase = createClient(supabaseUrl, serviceKey, {
              auth: { autoRefreshToken: false, persistSession: false },
            });

            const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
            if (!listError && users) {
              const target = users.find((u) => u.email?.toLowerCase() === cleanEmail);
              if (target) {
                const { error: updateError } = await supabase.auth.admin.updateUserById(target.id, {
                  password: newPassword,
                });
                if (!updateError) {
                  console.log(`\n\x1b[32m[RESET PASSWORD SUKSES]\x1b[0m Password untuk \x1b[36m${cleanEmail}\x1b[0m berhasil diperbarui via Admin API!\n`);
                  res.statusCode = 200;
                  res.end(JSON.stringify({ success: true }));
                  return;
                }
              }
            }

            res.statusCode = 400;
            res.end(JSON.stringify({ error: "Gagal memperbarui password user." }));
          } catch (err) {
            console.error("\x1b[31m[UPDATE PASSWORD ERROR]\x1b[0m", err.message);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: "Gagal memperbarui password." }));
          }
        });
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react(), securityHeadersPlugin(), smtpApiPlugin(env)],
    base: "/",
    server: {
      port: 5173,
      open: true,
    },
    esbuild: {
      drop: mode === "production" ? ["console", "debugger"] : [],
    },
    build: {
      target: "es2020",
      cssCodeSplit: true,
      cssMinify: true,
      sourcemap: false,
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules")) {
              if (id.includes("@supabase")) {
                return "vendor-supabase";
              }
              if (
                id.includes("react") ||
                id.includes("react-dom") ||
                id.includes("react-router") ||
                id.includes("scheduler")
              ) {
                return "vendor-react";
              }
            }
          },
        },
      },
    },
  };
});