import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import nodemailer from "nodemailer";

function smtpApiPlugin(env) {
  return {
    name: "smtp-api-dev-server",
    configureServer(server) {
      server.middlewares.use("/api/send-otp", async (req, res) => {
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "Method not allowed" }));
          return;
        }

        let bodyRaw = "";
        req.on("data", (chunk) => {
          bodyRaw += chunk;
        });

        req.on("end", async () => {
          let body = {};
          try {
            body = JSON.parse(bodyRaw);
          } catch {
            body = {};
          }

          const { to_email, to_name = "User", otp_code, type = "signup" } = body;

          const gmailUser = env.GMAIL_USER?.trim() || process.env.GMAIL_USER?.trim();
          const gmailPass = env.GMAIL_APP_PASSWORD?.trim() || process.env.GMAIL_APP_PASSWORD?.trim();

          res.setHeader("Content-Type", "application/json");

          if (!gmailUser || !gmailPass) {
            console.log(`\n\x1b[33m[DEMO SMTP]\x1b[0m Email tujuan: \x1b[36m${to_email}\x1b[0m | Kode OTP: \x1b[32m${otp_code}\x1b[0m`);
            console.log(`\x1b[90m(Tips: Tambahkan GMAIL_USER dan GMAIL_APP_PASSWORD di .env agar email benar-benar masuk ke inbox Gmail)\x1b[0m\n`);
            res.statusCode = 200;
            res.end(JSON.stringify({ success: true, demo: true, otp_code }));
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
              ? `Kode Verifikasi Akun Nexora: ${otp_code}`
              : `Kode Reset Password Nexora: ${otp_code}`;

            const htmlContent = `
              <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; border: 1px solid #eee;">
                <div style="background: #42154C; padding: 24px; text-align: center; color: #fff;">
                  <h1 style="margin: 0; font-size: 24px;">Nexora</h1>
                  <p style="margin: 4px 0 0; opacity: 0.8; font-size: 13px;">Career & Opportunity Platform</p>
                </div>
                <div style="padding: 24px; color: #333;">
                  <p style="font-size: 15px; font-weight: 600;">Halo ${to_name},</p>
                  <p style="line-height: 1.5; color: #555;">
                    ${isSignup ? "Kode OTP verifikasi pendaftaran akun Anda adalah:" : "Kode OTP reset password akun Anda adalah:"}
                  </p>
                  <div style="background: #fff8f3; border: 2px dashed #e8883c; border-radius: 8px; padding: 16px; text-align: center; margin: 20px 0;">
                    <div style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #e8883c; font-family: monospace;">
                      ${otp_code}
                    </div>
                  </div>
                  <p style="font-size: 13px; color: #888;">Kode ini berlaku 10 menit. Jangan bagikan kode ini kepada siapapun.</p>
                </div>
              </div>
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

            console.log(`\n\x1b[32m[SMTP SUKSES]\x1b[0m Email OTP berhasil dikirim ke: \x1b[36m${to_email}\x1b[0m\n`);
            res.statusCode = 200;
            res.end(JSON.stringify({ success: true, message: "Email OTP berhasil dikirim." }));
          } catch (err) {
            console.error("\x1b[31m[SMTP ERROR]\x1b[0m", err);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message || "Gagal mengirim email via SMTP." }));
          }
        });
      });

      server.middlewares.use("/api/update-password", async (req, res) => {
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "Method not allowed" }));
          return;
        }

        let bodyRaw = "";
        req.on("data", (chunk) => {
          bodyRaw += chunk;
        });

        req.on("end", async () => {
          let body = {};
          try {
            body = JSON.parse(bodyRaw);
          } catch {
            body = {};
          }

          const { email, newPassword } = body;
          const supabaseUrl = env.VITE_SUPABASE_URL?.trim() || process.env.VITE_SUPABASE_URL?.trim();
          const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY?.trim() || process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || env.VITE_SUPABASE_ANON_KEY?.trim() || process.env.VITE_SUPABASE_ANON_KEY?.trim();

          res.setHeader("Content-Type", "application/json");

          if (!supabaseUrl || !serviceKey || !email || !newPassword) {
            res.statusCode = 200;
            res.end(JSON.stringify({ success: true, demo: true }));
            return;
          }

          try {
            const { createClient } = await import("@supabase/supabase-js");
            const supabase = createClient(supabaseUrl, serviceKey, {
              auth: { autoRefreshToken: false, persistSession: false },
            });

            if (env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY) {
              const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
              if (!listError && users) {
                const target = users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
                if (target) {
                  const { error: updateError } = await supabase.auth.admin.updateUserById(target.id, {
                    password: newPassword,
                  });
                  if (!updateError) {
                    console.log(`\n\x1b[32m[RESET PASSWORD SUKSES]\x1b[0m Password untuk \x1b[36m${email}\x1b[0m berhasil diperbarui via Admin API!\n`);
                    res.statusCode = 200;
                    res.end(JSON.stringify({ success: true }));
                    return;
                  }
                }
              }
            }

            // Coba RPC
            const { data: rpcSuccess, error: rpcErr } = await supabase.rpc("reset_password_by_email", {
              user_email: email.trim(),
              new_plain_password: newPassword,
            });

            if (rpcErr) {
              console.warn("\x1b[33m[RESET PASSWORD RPC]\x1b[0m", rpcErr.message);
              res.statusCode = 400;
              res.end(JSON.stringify({ error: rpcErr.message }));
              return;
            }

            console.log(`\n\x1b[32m[RESET PASSWORD SUKSES]\x1b[0m Password untuk \x1b[36m${email}\x1b[0m berhasil diperbarui via RPC!\n`);
            res.statusCode = 200;
            res.end(JSON.stringify({ success: true }));
          } catch (err) {
            console.error("\x1b[31m[UPDATE PASSWORD ERROR]\x1b[0m", err);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message || "Gagal update password" }));
          }
        });
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react(), smtpApiPlugin(env)],
    base: "/",
    server: {
      port: 5173,
      open: true,
    },
  };
});