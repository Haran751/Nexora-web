import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
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

  const { email, newPassword } = body || {};

  if (!email || !newPassword) {
    return res.status(400).json({ error: "email and newPassword are required" });
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
        return res.status(404).json({ error: "User tidak ditemukan dengan email tersebut." });
      }

      const { error: updateError } = await supabase.auth.admin.updateUserById(target.id, {
        password: newPassword,
      });

      if (updateError) throw updateError;
      return res.status(200).json({ success: true, message: "Password berhasil diperbarui via Admin API." });
    }

    // 2. Jika hanya anon key, panggil RPC reset_password_by_email
    const { data: rpcSuccess, error: rpcError } = await supabase.rpc("reset_password_by_email", {
      user_email: email.trim(),
      new_plain_password: newPassword,
    });

    if (rpcError) {
      console.warn("RPC reset_password_by_email failed:", rpcError.message);
      return res.status(400).json({
        error: "Gagal update password. Tambahkan SUPABASE_SERVICE_ROLE_KEY di .env atau jalankan fungsi SQL reset_password_by_email di Supabase SQL Editor.",
      });
    }

    return res.status(200).json({ success: true, message: "Password berhasil diperbarui via RPC." });
  } catch (err) {
    console.error("update-password error:", err);
    return res.status(500).json({ error: err.message || "Gagal update password" });
  }
}
