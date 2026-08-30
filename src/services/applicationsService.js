import { supabase, isSupabaseConfigured } from "../lib/supabase.js";
import { sanitizeText, sanitizeUrl } from "../lib/security.js";
import { addNotification } from "./notificationsService.js";

const LOCAL_APPS_KEY = "nexora_local_apps_v1";

function loadLocalApps(userId) {
  try {
    const raw = localStorage.getItem(LOCAL_APPS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    // Filter out old hardcoded demo apps (demo-app-1, demo-app-2, demo-app-3)
    const cleaned = parsed.filter((a) => {
      const id = String(a?.id || "");
      if (id.startsWith("demo-app-")) return false;
      if (a?.company === "Nexora Studio" && a?.title === "Frontend Developer Intern") return false;
      if (a?.company === "Brightmind Agency" && a?.title === "UI/UX Designer Grad") return false;
      if (a?.company === "Vertex Retail" && a?.title === "Marketing Assistant") return false;
      return true;
    });

    if (cleaned.length !== parsed.length) {
      saveLocalApps(cleaned);
    }

    if (userId) {
      return cleaned.filter((a) => !a.applicantId || a.applicantId === userId);
    }
    return cleaned;
  } catch {
    return [];
  }
}

function saveLocalApps(apps) {
  try {
    localStorage.setItem(LOCAL_APPS_KEY, JSON.stringify(apps));
  } catch {
    /* ignore */
  }
}

function isValidUuid(id) {
  return typeof id === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

const APPS_CACHE_TTL_MS = 30 * 1000; // 30 seconds
const userAppsCache = new Map();
const employerCandidatesCache = new Map();

export function clearApplicationsCache() {
  userAppsCache.clear();
  employerCandidatesCache.clear();
}

export async function getUserApplications(userId) {
  const cacheKey = String(userId || "guest");
  const cached = userAppsCache.get(cacheKey);
  const now = Date.now();

  if (cached && now - cached.timestamp < APPS_CACHE_TTL_MS) {
    return cached.data;
  }

  if (cached) {
    getUserApplicationsRaw(userId).then((fresh) => {
      userAppsCache.set(cacheKey, { data: fresh, timestamp: Date.now() });
    }).catch(() => {});
    return cached.data;
  }

  const data = await getUserApplicationsRaw(userId);
  userAppsCache.set(cacheKey, { data, timestamp: now });
  return data;
}

async function getUserApplicationsRaw(userId) {
  if (isSupabaseConfigured && isValidUuid(userId)) {
    try {
      const { data, error } = await supabase
        .from("applications")
        .select(`
          id,
          job_id,
          applicant_id,
          status,
          cover_note,
          resume_url,
          timeline,
          created_at,
          jobs (
            id,
            title,
            company,
            location,
            work_mode
          )
        `)
        .eq("applicant_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (Array.isArray(data)) {
        return data.map((a) => ({
          id: a.id,
          jobId: a.job_id,
          title: a.jobs?.title || "Job Vacancy",
          company: a.jobs?.company || "Company",
          applied: new Date(a.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          status: a.status,
          coverNote: a.cover_note,
          resumeUrl: a.resume_url,
          timeline: Array.isArray(a.timeline) && a.timeline.length > 0
            ? a.timeline
            : [{ label: "Application sent", date: new Date(a.created_at).toLocaleDateString() }],
        }));
      }
    } catch (err) {
      console.warn("getUserApplications error, falling back to local:", err.message);
    }
  }

  return loadLocalApps(userId);
}

export async function submitApplication({ jobId, jobTitle, company, applicantId, applicantName, coverNote, resumeUrl }) {
  const dateStr = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const initialTimeline = [{ label: "Application sent", date: dateStr }];

  const safeCoverNote = sanitizeText(coverNote || "", 3000);
  const safeResumeUrl = resumeUrl ? sanitizeUrl(resumeUrl) || "" : "";

  if (isSupabaseConfigured && isValidUuid(applicantId) && isValidUuid(jobId)) {
    const { data, error } = await supabase
      .from("applications")
      .upsert({
        job_id: jobId,
        applicant_id: applicantId,
        status: "Applied",
        cover_note: safeCoverNote,
        resume_url: safeResumeUrl,
        timeline: initialTimeline,
      })
      .select()
      .maybeSingle();

    if (error) throw error;
    clearApplicationsCache();

    if (applicantId) {
      addNotification({
        userId: applicantId,
        type: "application",
        title: `Lamaran Terkirim: ${jobTitle || "Lowongan"}`,
        message: `Lamaran Anda untuk posisi ${jobTitle} di ${company} berhasil dikirim.`,
        link: "/applications",
      }).catch(() => {});
    }

    return data;
  }

  // Local fallback
  const newJobApp = {
    id: `app-${Date.now()}`,
    jobId: String(jobId),
    title: jobTitle || "Role Vacancy",
    company: company || "Hiring Company",
    applicantId: applicantId || "",
    applicantName: applicantName || "Applicant",
    applied: dateStr,
    status: "Applied",
    match: 94,
    timeline: initialTimeline,
  };

  const current = loadLocalApps();
  // Cegah duplicate job application di local
  const filtered = current.filter((a) => {
    if (applicantId && a.applicantId && a.applicantId !== applicantId) return true;
    return String(a.jobId) !== String(jobId);
  });
  const next = [newJobApp, ...filtered];
  saveLocalApps(next);
  clearApplicationsCache();

  if (applicantId) {
    addNotification({
      userId: applicantId,
      type: "application",
      title: `Lamaran Terkirim: ${jobTitle || "Lowongan"}`,
      message: `Lamaran Anda untuk posisi ${jobTitle} di ${company} berhasil dikirim.`,
      link: "/applications",
    }).catch(() => {});
  }

  return newJobApp;
}

export async function getEmployerCandidates(employerId) {
  const cacheKey = String(employerId || "guest-employer");
  const cached = employerCandidatesCache.get(cacheKey);
  const now = Date.now();

  if (cached && now - cached.timestamp < APPS_CACHE_TTL_MS) {
    return cached.data;
  }

  if (cached) {
    getEmployerCandidatesRaw(employerId).then((fresh) => {
      employerCandidatesCache.set(cacheKey, { data: fresh, timestamp: Date.now() });
    }).catch(() => {});
    return cached.data;
  }

  const data = await getEmployerCandidatesRaw(employerId);
  employerCandidatesCache.set(cacheKey, { data, timestamp: now });
  return data;
}

async function getEmployerCandidatesRaw(employerId) {
  if (isSupabaseConfigured && isValidUuid(employerId)) {
    try {
      const { data, error } = await supabase
        .from("applications")
        .select(`
          id,
          job_id,
          applicant_id,
          status,
          created_at,
          profiles:applicant_id (
            full_name,
            email,
            location,
            skills
          ),
          jobs!inner (
            id,
            title,
            employer_id
          )
        `)
        .eq("jobs.employer_id", employerId);

      if (error) throw error;
      if (Array.isArray(data)) {
        return data.map((a) => ({
          id: a.id,
          name: a.profiles?.full_name || a.profiles?.email || "Candidate",
          email: a.profiles?.email || "",
          job: a.jobs?.title || "Role",
          jobId: a.job_id,
          match: 88,
          status: a.status,
          skills: a.profiles?.skills || [],
          appliedAt: a.created_at,
        }));
      }
    } catch (err) {
      console.warn("getEmployerCandidates error:", err.message);
    }
  }

  // Local candidate pool from submitted applications
  const localApps = loadLocalApps();
  if (localApps.length > 0) {
    return localApps.map((a) => ({
      id: a.id,
      name: a.applicantName || "Candidate",
      email: "candidate@nexora.id",
      job: a.title,
      jobId: a.jobId,
      match: a.match || 88,
      status: a.status || "Applied",
      skills: [],
      appliedAt: a.applied,
    }));
  }

  return [];
}

const VALID_STATUSES = new Set([
  "Applied",
  "Viewed",
  "In Review",
  "Shortlisted",
  "Interview",
  "Accepted",
  "Rejected",
]);

export async function updateCandidateStatus(applicationId, newStatus) {
  if (!VALID_STATUSES.has(newStatus)) {
    throw new Error("Invalid application status.");
  }

  clearApplicationsCache();

  if (isSupabaseConfigured && isValidUuid(applicationId)) {
    const { data: appData, error } = await supabase
      .from("applications")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", applicationId)
      .select("applicant_id, jobs(title, company)")
      .maybeSingle();

    if (error) throw error;

    if (appData?.applicant_id) {
      const jobTitle = appData.jobs?.title || "pekerjaan";
      const company = appData.jobs?.company || "Perusahaan";
      const notifType = newStatus === "Interview" ? "interview" : newStatus === "Accepted" ? "application" : "status";
      addNotification({
        userId: appData.applicant_id,
        type: notifType,
        title: `Status Diperbarui: ${jobTitle}`,
        message: `Lamaran Anda di ${company} telah diperbarui ke status: "${newStatus}".`,
        link: "/applications",
      }).catch(() => {});
    }

    return true;
  }

  const current = loadLocalApps();
  let targetApplicantId = null;
  let targetTitle = "Lowongan";
  let targetCompany = "Perusahaan";

  const next = current.map((a) => {
    if (String(a.id) === String(applicationId)) {
      targetApplicantId = a.applicantId;
      targetTitle = a.title || "Lowongan";
      targetCompany = a.company || "Perusahaan";
      const timeline = Array.isArray(a.timeline) ? [...a.timeline] : [];
      timeline.push({
        label: `Status updated to ${newStatus}`,
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      });
      return { ...a, status: newStatus, timeline };
    }
    return a;
  });
  saveLocalApps(next);

  if (targetApplicantId) {
    const notifType = newStatus === "Interview" ? "interview" : newStatus === "Accepted" ? "application" : "status";
    addNotification({
      userId: targetApplicantId,
      type: notifType,
      title: `Status Diperbarui: ${targetTitle}`,
      message: `Lamaran Anda di ${targetCompany} telah diperbarui ke status: "${newStatus}".`,
      link: "/applications",
    }).catch(() => {});
  }

  return true;
}
