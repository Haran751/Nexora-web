import { supabase, isSupabaseConfigured } from "../lib/supabase.js";

const NOTIF_PREFIX = "nexora_notifications_";

function getStorageKey(userId) {
  return `${NOTIF_PREFIX}${userId || "guest"}`;
}

function isValidUuid(id) {
  return typeof id === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

export function formatTimeAgo(dateInput) {
  if (!dateInput) return "Baru saja";
  const timestamp = typeof dateInput === "number" ? dateInput : new Date(dateInput).getTime();
  const diffSec = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));

  if (diffSec < 60) return "Baru saja";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} menit lalu`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} jam lalu`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 30) return `${diffDay} hari lalu`;
  return new Date(timestamp).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

function loadLocalNotifications(userId) {
  try {
    const raw = localStorage.getItem(getStorageKey(userId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveLocalNotifications(userId, list) {
  try {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(list));
    window.dispatchEvent(new CustomEvent("nexora:notification_change", { detail: { userId } }));
  } catch {
    /* ignore */
  }
}

export async function fetchNotifications(userId, { role = "worker", userName = "" } = {}) {
  if (!userId) return [];

  // Try Supabase if configured
  if (isSupabaseConfigured && isValidUuid(userId)) {
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        return data.map((n) => ({
          id: n.id,
          type: n.type || "status",
          title: n.title,
          message: n.message || "",
          link: n.link || "",
          unread: Boolean(n.unread ?? !n.is_read),
          createdAt: new Date(n.created_at).getTime(),
          time: formatTimeAgo(n.created_at),
        }));
      }
    } catch {
      // Fallback to local storage
    }
  }

  // Local storage lookup per user
  let localList = loadLocalNotifications(userId);

  // If new user with no notification history, seed customized welcome notification
  if (localList === null || localList.length === 0) {
    const welcomeNotif = {
      id: `notif-welcome-${userId}`,
      type: "recommendation",
      title: role === "employer" ? "Selamat datang di Nexora Employer Hub!" : "Selamat datang di Nexora!",
      message:
        role === "employer"
          ? `Halo ${userName || "Perusahaan"}, mulai pasang lowongan pertama Anda dan temukan kandidat terbaik.`
          : `Halo ${userName || "Pencari Kerja"}, lengkapi riwayat profil Anda untuk memaksimalkan skor kecocokan pekerjaan.`,
      link: role === "employer" ? "/employer" : "/profile",
      unread: true,
      createdAt: Date.now(),
      time: "Baru saja",
    };
    localList = [welcomeNotif];
    saveLocalNotifications(userId, localList);
  }

  return localList.map((n) => ({
    ...n,
    time: formatTimeAgo(n.createdAt),
  }));
}

export async function addNotification({ userId, type = "status", title, message = "", link = "" }) {
  if (!userId || !title) return;

  const newNotif = {
    id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type,
    title,
    message,
    link,
    unread: true,
    createdAt: Date.now(),
  };

  if (isSupabaseConfigured && isValidUuid(userId)) {
    try {
      await supabase.from("notifications").insert([
        {
          user_id: userId,
          type,
          title,
          message,
          link,
          unread: true,
        },
      ]);
    } catch {
      // ignore
    }
  }

  const existing = loadLocalNotifications(userId) || [];
  const updated = [newNotif, ...existing.slice(0, 49)];
  saveLocalNotifications(userId, updated);
}

export async function markAllNotificationsRead(userId) {
  if (!userId) return;

  if (isSupabaseConfigured && isValidUuid(userId)) {
    try {
      await supabase
        .from("notifications")
        .update({ unread: false, is_read: true })
        .eq("user_id", userId);
    } catch {
      // ignore
    }
  }

  const existing = loadLocalNotifications(userId) || [];
  const updated = existing.map((n) => ({ ...n, unread: false }));
  saveLocalNotifications(userId, updated);
}

export async function markNotificationRead(userId, notifId) {
  if (!userId || !notifId) return;

  if (isSupabaseConfigured && isValidUuid(userId) && isValidUuid(notifId)) {
    try {
      await supabase
        .from("notifications")
        .update({ unread: false, is_read: true })
        .eq("id", notifId);
    } catch {
      // ignore
    }
  }

  const existing = loadLocalNotifications(userId) || [];
  const updated = existing.map((n) => (String(n.id) === String(notifId) ? { ...n, unread: false } : n));
  saveLocalNotifications(userId, updated);
}
