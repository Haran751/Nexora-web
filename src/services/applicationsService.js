import { supabase, isSupabaseConfigured } from "../lib/supabase.js";

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

export async function getUserApplications(userId) {
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

  if (isSupabaseConfigured && isValidUuid(applicantId) && isValidUuid(jobId)) {
    const { data, error } = await supabase
      .from("applications")
      .upsert({
        job_id: jobId,
        applicant_id: applicantId,
        status: "Applied",
        cover_note: coverNote || "",
        resume_url: resumeUrl || "",
        timeline: initialTimeline,
      })
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  // Local fallback
  const newApp = {
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
  const next = [newApp, ...filtered];
  saveLocalApps(next);
  return newApp;
}

export async function getEmployerCandidates(employerId) {
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

export async function updateCandidateStatus(applicationId, newStatus) {
  if (isSupabaseConfigured && isValidUuid(applicationId)) {
    const { error } = await supabase
      .from("applications")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", applicationId);

    if (error) throw error;
    return true;
  }

  const current = loadLocalApps();
  const next = current.map((a) => {
    if (String(a.id) === String(applicationId)) {
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
  return true;
}
