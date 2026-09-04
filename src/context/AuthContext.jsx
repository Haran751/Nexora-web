import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabase.js";
import { loadProfile, saveProfile, DEFAULT_PROFILE } from "../lib/profile.js";
import { sendOtpEmail } from "../lib/sendOtp.js";
import { isValidEmail, sanitizeText } from "../lib/security.js";

const AuthContext = createContext(null);

const DEMO_USER_KEY = "nexora_demo_user_v1";
const DEMO_OTP_KEY = "nexora_demo_otps_v1";
const RESET_TOKEN_KEY = "nexora_reset_token_v1";

function getStoredOtp(email) {
  try {
    const raw = sessionStorage.getItem(DEMO_OTP_KEY);
    const map = raw ? JSON.parse(raw) : {};
    const entry = map[email.toLowerCase()];
    if (!entry) return null;
    if (typeof entry === "string") return entry;
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      clearStoredOtp(email);
      return null;
    }
    return entry.code;
  } catch {
    return null;
  }
}

function setStoredOtp(email, code) {
  try {
    const raw = sessionStorage.getItem(DEMO_OTP_KEY);
    const map = raw ? JSON.parse(raw) : {};
    // 10 minutes TTL
    map[email.toLowerCase()] = {
      code,
      expiresAt: Date.now() + 10 * 60 * 1000,
    };
    sessionStorage.setItem(DEMO_OTP_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

function clearStoredOtp(email) {
  try {
    const raw = sessionStorage.getItem(DEMO_OTP_KEY);
    if (!raw) return;
    const map = JSON.parse(raw);
    delete map[email.toLowerCase()];
    sessionStorage.setItem(DEMO_OTP_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

function setResetToken(email) {
  try {
    const token = `rst_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    sessionStorage.setItem(
      RESET_TOKEN_KEY,
      JSON.stringify({ email: email.toLowerCase(), token, expiresAt: Date.now() + 5 * 60 * 1000 })
    );
    return token;
  } catch {
    return null;
  }
}

function getResetToken(email) {
  try {
    const raw = sessionStorage.getItem(RESET_TOKEN_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data.email !== email.toLowerCase() || Date.now() > data.expiresAt) {
      sessionStorage.removeItem(RESET_TOKEN_KEY);
      return null;
    }
    return data.token;
  } catch {
    return null;
  }
}

function clearResetToken() {
  try {
    sessionStorage.removeItem(RESET_TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId) => {
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
  }, []);

  // Inisialisasi status user & profile
  useEffect(() => {
    let mounted = true;
    let authInitialized = false;

    async function initAuth() {
      // Check if user has an existing session in localStorage
      let hasStoredSession = false;
      try {
        hasStoredSession = Object.keys(localStorage).some(
          (k) => (k.startsWith("sb-") && k.endsWith("-auth-token")) || k === DEMO_USER_KEY
        );
      } catch {}

      if (!hasStoredSession) {
        // Fast path for first-time / guest visitors (instant initial paint)
        setUser(null);
        setProfile(DEFAULT_PROFILE);
        setLoading(false);
      }

      if (isSupabaseConfigured) {
        try {
          if (hasStoredSession) {
            const { data: { session } } = await supabase.auth.getSession();
            if (!mounted) return;
            if (session?.user) {
              setUser(session.user);
              await fetchProfile(session.user.id);
            } else {
              setUser(null);
              setProfile(DEFAULT_PROFILE);
            }
          }
        } catch (err) {
          console.error("Supabase getSession error:", err);
        } finally {
          if (mounted) {
            authInitialized = true;
            setLoading(false);
          }
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (!mounted) return;
            // Prevent redundant fetch on INITIAL_SESSION if already loaded
            if (event === "INITIAL_SESSION" && authInitialized) return;
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

        return () => {
          mounted = false;
          subscription?.unsubscribe();
        };
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
        return () => {
          mounted = false;
        };
      }
    }

    initAuth();
  }, [fetchProfile]);
  // 1. Sign Up (Generate 6-digit OTP & Kirim via EmailJS ke Gmail)
  const signUp = useCallback(async ({ email, password, fullName, role = "worker", companyName = "" }) => {
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
      demoCode: null,
    };
  }, []);

  // 2. Verifikasi Kode OTP (Signup atau Recovery)
  const verifyOtp = useCallback(async ({ email, token, type = "signup" }) => {
    const savedCode = getStoredOtp(email);

    if (!savedCode) {
      throw new Error("Kode OTP telah kedaluwarsa atau belum diminta. Silakan minta kode baru.");
    }

    // Validasi token cocok dengan kode yang dikirim ke email (strict, no bypass)
    if (token !== savedCode) {
      throw new Error("Kode OTP salah atau tidak cocok. Periksa email Anda.");
    }

    // Hapus kode OTP agar tidak bisa digunakan berulang kali (anti-replay)
    clearStoredOtp(email);

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
      
      sessionStorage.removeItem("nexora_pending_signup");
      return { user: targetUser };
    }

    // Jika recovery, buat reset token jangka pendek (5 menit)
    const resetToken = setResetToken(email);
    return { success: true, resetToken };
  }, []);

  // 3. Resend OTP Code ke Gmail
  const resendOtp = useCallback(async ({ email, type = "signup" }) => {
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

    return { demoCode: null };
  }, []);

  // 4. Request Password Reset (Kirim OTP ke Gmail)
  const resetPasswordForEmail = useCallback(async (email) => {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setStoredOtp(email, code);

    const sendRes = await sendOtpEmail({
      to_email: email,
      to_name: email.split("@")[0],
      otp_code: code,
      type: "recovery",
    });

    return { success: true, demoCode: null };
  }, []);

  // 5. Update Password setelah OTP terverifikasi
  const updateUserPassword = useCallback(async (payload) => {
    const newPassword = typeof payload === "string" ? payload : payload?.newPassword;
    const email = typeof payload === "object" ? payload?.email : user?.email;
    const resetToken = typeof payload === "object" ? payload?.resetToken : null;

    if (!newPassword || newPassword.length < 8) {
      throw new Error("Password baru minimal 8 karakter demi keamanan.");
    }

    // Validasi reset token jika reset dipanggil di luar session aktif
    if (!user && email) {
      const validToken = getResetToken(email);
      if (!validToken || (resetToken && resetToken !== validToken)) {
        throw new Error("Sesi verifikasi reset password tidak valid atau telah kedaluwarsa. Silakan verifikasi ulang OTP.");
      }
    }

    // 1. Coba panggil server endpoint /api/update-password dengan resetToken
    try {
      const res = await fetch("/api/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword, resetToken }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        clearResetToken();
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
            
          } catch {}
        }
        return { success: true, demo: true };
      }

      throw apiErr;
    }

    return { success: true };
  }, [user]);

  // 6. Sign In
  const signIn = useCallback(async ({ email, password }) => {
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
      
      return { user: mockUser };
    }
  }, []);

  const signOut = useCallback(async () => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.signOut();
      if (error) console.error("Sign out error:", error);
    }
    setUser(null);
    setProfile(DEFAULT_PROFILE);
    
  }, []);

  const updateProfileData = useCallback(async (updates) => {
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
      
    }
  }, [profile, user]);

  const role = profile?.role || user?.user_metadata?.role || "worker";

  const contextValue = useMemo(() => ({
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
  }), [
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
    updateProfileData,
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
