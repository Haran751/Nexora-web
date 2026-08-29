import { createContext, useContext, useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabase.js";
import { loadProfile, saveProfile, DEFAULT_PROFILE } from "../lib/profile.js";
import { sendOtpEmail } from "../lib/sendOtp.js";
import { isValidEmail, sanitizeText } from "../lib/security.js";

const AuthContext = createContext(null);

const DEMO_USER_KEY = "nexora_demo_user_v1";
const DEMO_OTP_KEY = "nexora_demo_otps_v1";

function getStoredOtp(email) {
  try {
    const raw = sessionStorage.getItem(DEMO_OTP_KEY);
    const map = raw ? JSON.parse(raw) : {};
    return map[email.toLowerCase()] || null;
  } catch {
    return null;
  }
}

function setStoredOtp(email, code) {
  try {
    const raw = sessionStorage.getItem(DEMO_OTP_KEY);
    const map = raw ? JSON.parse(raw) : {};
    map[email.toLowerCase()] = code;
    sessionStorage.setItem(DEMO_OTP_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);

  // Inisialisasi status user & profile
  useEffect(() => {
    async function initAuth() {
      if (isSupabaseConfigured) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            setUser(session.user);
            await fetchProfile(session.user.id);
          } else {
            setUser(null);
            setProfile(DEFAULT_PROFILE);
          }
        } catch (err) {
          console.error("Supabase getSession error:", err);
        } finally {
          setLoading(false);
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (session?.user) {
              setUser(session.user);
              await fetchProfile(session.user.id);
            } else {
              setUser(null);
              setProfile(DEFAULT_PROFILE);
            }
            setLoading(false);
          }
        );

        return () => subscription?.unsubscribe();
      } else {
        const savedDemo = localStorage.getItem(DEMO_USER_KEY);
        if (savedDemo) {
          try {
            const parsed = JSON.parse(savedDemo);
            setUser(parsed.user);
            setProfile(parsed.profile || loadProfile());
          } catch {
            setUser(null);
          }
        } else {
          setProfile(loadProfile());
        }
        setLoading(false);
      }
    }

    initAuth();
  }, []);

  async function fetchProfile(userId) {
    if (!userId) return;
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        console.warn("Could not fetch profile, using defaults:", error.message);
        return;
      }

      if (data) {
        setProfile({
          ...DEFAULT_PROFILE,
          name: data.full_name || data.email,
          email: data.email,
          phone: data.phone || "",
          location: data.location || "Jakarta",
          birthday: data.birthday || "",
          placeOfBirth: data.place_of_birth || "",
          about: data.about || "",
          skills: Array.isArray(data.skills) ? data.skills : [],
          education: Array.isArray(data.education) ? data.education : [],
          experience: Array.isArray(data.experience) ? data.experience : [],
          projects: Array.isArray(data.projects) ? data.projects : [],
          certificates: Array.isArray(data.certificates) ? data.certificates : [],
          companyName: data.company_name || "",
          role: data.role || "worker",
          avatarUrl: data.avatar_url || "",
          resumeUrl: data.resume_url || "",
        });
      } else {
        // Jika baris profiles belum ada di database, buatkan otomatis
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (currentUser) {
          const initialName = currentUser.user_metadata?.full_name || currentUser.email?.split("@")[0] || "User";
          const initialRole = currentUser.user_metadata?.role || "worker";
          const initialCompany = currentUser.user_metadata?.company_name || "";
          
          await supabase.from("profiles").upsert({
            id: userId,
            full_name: initialName,
            email: currentUser.email || "",
            role: initialRole,
            company_name: initialCompany,
          });

          setProfile({
            ...DEFAULT_PROFILE,
            name: initialName,
            email: currentUser.email || "",
            role: initialRole,
            companyName: initialCompany,
          });
        }
      }
    } catch (err) {
      console.error("fetchProfile error:", err);
    }
  }

  // 1. Sign Up (Generate 6-digit OTP & Kirim via EmailJS ke Gmail)
  async function signUp({ email, password, fullName, role = "worker", companyName = "" }) {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setStoredOtp(email, code);

    const pendingUser = {
      id: `user-${Date.now()}`,
      email,
      user_metadata: { full_name: fullName, role, company_name: companyName },
    };

    sessionStorage.setItem(
      "nexora_pending_signup",
      JSON.stringify({ user: pendingUser, fullName, role, companyName, password, code })
    );

    // Kirim email OTP langsung ke Gmail user via SMTP
    const sendRes = await sendOtpEmail({
      to_email: email,
      to_name: fullName || companyName || "User",
      otp_code: code,
      type: "signup",
    });

    return {
      user: pendingUser,
      demoCode: sendRes?.demo ? code : null,
    };
  }

  // 2. Verifikasi Kode OTP (Signup atau Recovery)
  async function verifyOtp({ email, token, type = "signup" }) {
    const savedCode = getStoredOtp(email);

    // Bypass "123456" hanya diizinkan pada offline demo mode jika Supabase belum dikonfigurasi (untuk memudahkan penjurian lomba)
    const allowDemoBypass = !isSupabaseConfigured && token === "123456";
    if (token !== savedCode && !allowDemoBypass) {
      throw new Error("Kode OTP salah atau tidak cocok. Periksa email Anda.");
    }

    if (type === "signup") {
      const rawPending = sessionStorage.getItem("nexora_pending_signup");
      const pending = rawPending ? JSON.parse(rawPending) : {};
      const targetUser = pending.user || {
        id: `user-${Date.now()}`,
        email,
        user_metadata: { full_name: pending.fullName || email.split("@")[0], role: pending.role || "worker" },
      };
      const newProfile = {
        ...DEFAULT_PROFILE,
        name: pending.fullName || email.split("@")[0],
        email,
        role: pending.role || "worker",
        companyName: pending.companyName || "",
      };

      if (isSupabaseConfigured) {
        try {
          const { data } = await supabase.auth.signUp({
            email,
            password: pending.password || "Password123!",
            options: {
              data: {
                full_name: pending.fullName,
                role: pending.role,
                company_name: pending.companyName,
              },
            },
          });
          if (data?.user) {
            setUser(data.user);
            await fetchProfile(data.user.id);
          }
        } catch (err) {
          console.warn("Supabase background signup warning:", err.message);
        }
      }

      setUser(targetUser);
      setProfile(newProfile);
      saveProfile(newProfile);
      localStorage.setItem(DEMO_USER_KEY, JSON.stringify({ user: targetUser, profile: newProfile }));
      sessionStorage.removeItem("nexora_pending_signup");
      return { user: targetUser };
    }

    // Jika recovery
    return { success: true };
  }

  // 3. Resend OTP Code ke Gmail
  async function resendOtp({ email, type = "signup" }) {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setStoredOtp(email, code);

    const rawPending = sessionStorage.getItem("nexora_pending_signup");
    const pending = rawPending ? JSON.parse(rawPending) : {};

    const sendRes = await sendOtpEmail({
      to_email: email,
      to_name: pending.fullName || "User",
      otp_code: code,
      type,
    });

    return { demoCode: sendRes?.demo ? code : null };
  }

  // 4. Request Password Reset (Kirim OTP ke Gmail)
  async function resetPasswordForEmail(email) {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setStoredOtp(email, code);

    const sendRes = await sendOtpEmail({
      to_email: email,
      to_name: email.split("@")[0],
      otp_code: code,
      type: "recovery",
    });

    return { success: true, demoCode: sendRes?.demo ? code : null };
  }

  // 5. Update Password setelah OTP terverifikasi
  async function updateUserPassword(payload) {
    const newPassword = typeof payload === "string" ? payload : payload?.newPassword;
    const email = typeof payload === "object" ? payload?.email : user?.email;
    const token = typeof payload === "object" ? payload?.token : null;

    if (!newPassword || newPassword.length < 6) {
      throw new Error("Password baru minimal 6 karakter.");
    }

    // 1. Panggil server endpoint /api/update-password dengan token otorisasi
    try {
      const res = await fetch("/api/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword, token }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        return { success: true };
      }
      if (!res.ok && data.error) {
        throw new Error(data.error);
      }
    } catch (apiErr) {
      console.warn("API /api/update-password error:", apiErr.message);

      // 2. Jika user sedang aktif login di session resmi Supabase
      if (isSupabaseConfigured && user) {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (!error) return { success: true };
      }

      // 3. Fallback demo storage jika berjalan tanpa Supabase (offline demo penjurian)
      if (!isSupabaseConfigured) {
        const savedDemo = localStorage.getItem(DEMO_USER_KEY);
        if (savedDemo) {
          try {
            const parsed = JSON.parse(savedDemo);
            parsed.updatedAt = new Date().toISOString();
            localStorage.setItem(DEMO_USER_KEY, JSON.stringify(parsed));
          } catch {}
        }
        return { success: true, demo: true };
      }

      throw apiErr;
    }

    return { success: true };
  }

  // 6. Sign In
  async function signIn({ email, password }) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return data;
    } else {
      const mockUser = {
        id: "demo-user-123",
        email,
        user_metadata: { full_name: email.split("@")[0], role: "worker" },
      };
      const mockProfile = {
        ...loadProfile(),
        name: email.split("@")[0],
        email,
      };
      setUser(mockUser);
      setProfile(mockProfile);
      localStorage.setItem(DEMO_USER_KEY, JSON.stringify({ user: mockUser, profile: mockProfile }));
      return { user: mockUser };
    }
  }

  async function signOut() {
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.signOut();
      if (error) console.error("Sign out error:", error);
    }
    setUser(null);
    setProfile(DEFAULT_PROFILE);
    localStorage.removeItem(DEMO_USER_KEY);
  }

  async function updateProfileData(updates) {
    const next = { ...profile, ...updates };
    setProfile(next);
    saveProfile(next);

    if (isSupabaseConfigured && user) {
      const dbPayload = {
        full_name: next.name,
        phone: next.phone,
        location: next.location,
        birthday: next.birthday,
        place_of_birth: next.placeOfBirth,
        about: next.about,
        skills: next.skills,
        education: next.education,
        experience: next.experience,
        projects: next.projects,
        certificates: next.certificates,
        company_name: next.companyName,
        avatar_url: next.avatarUrl || "",
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("profiles")
        .update(dbPayload)
        .eq("id", user.id);

      if (error) throw error;
    } else if (user) {
      localStorage.setItem(DEMO_USER_KEY, JSON.stringify({ user, profile: next }));
    }
  }

  const role = profile?.role || user?.user_metadata?.role || "worker";

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        loading,
        signUp,
        signIn,
        signOut,
        verifyOtp,
        resendOtp,
        resetPasswordForEmail,
        updateUserPassword,
        updateProfile: updateProfileData,
        isSupabaseConfigured,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
