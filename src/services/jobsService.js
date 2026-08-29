import { supabase, isSupabaseConfigured } from "../lib/supabase.js";
import { jdJobs } from "../lib/jobsData.js";

const LOCAL_JOBS_KEY = "nexora_local_jobs_v1";

function loadLocalJobs() {
  try {
    const raw = localStorage.getItem(LOCAL_JOBS_KEY);
    if (!raw) return [...jdJobs];
    return JSON.parse(raw);
  } catch {
    return [...jdJobs];
  }
}

function saveLocalJobs(jobs) {
  try {
    localStorage.setItem(LOCAL_JOBS_KEY, JSON.stringify(jobs));
  } catch {
    /* ignore */
  }
}

function mapJobFromDB(row) {
  if (!row) return null;
  return {
    id: row.id,
    employerId: row.employer_id,
    title: row.title,
    company: row.company,
    companyLogo: row.company_logo || "",
    location: row.location,
    workMode: row.work_mode,
    salary: row.salary,
    type: row.type,
    industry: row.industry,
    posted: row.created_at ? new Date(row.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" }) : "Recent",
    deadline: row.deadline || "",
    duration: row.duration || "",
    match: 92, // estimated algorithmic match
    matchBreakdown: { skills: 90, location: 95, experience: 88, workMode: 95 },
    description: row.description,
    requirements: Array.isArray(row.requirements) ? row.requirements : [],
    status: row.status,
  };
}

export async function fetchJobs(filters = {}) {
  if (isSupabaseConfigured) {
    try {
      let query = supabase.from("jobs").select("*").order("created_at", { ascending: false });

      if (filters.status) {
        query = query.eq("status", filters.status);
      } else {
        query = query.eq("status", "Active");
      }

      if (filters.employerId) {
        query = query.eq("employer_id", filters.employerId);
      }

      const { data, error } = await query;
      if (error) throw error;
      if (data && data.length > 0) {
        return data.map(mapJobFromDB);
      }
    } catch (err) {
      console.warn("fetchJobs error, falling back to local:", err.message);
    }
  }

  // Fallback ke local
  let list = loadLocalJobs();
  if (filters.employerId) {
    list = list.filter((j) => String(j.employerId) === String(filters.employerId));
  }
  return list;
}

function isValidUuid(id) {
  return typeof id === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

export async function fetchJobById(id) {
  if (isSupabaseConfigured && isValidUuid(id)) {
    try {
      const { data, error } = await supabase.from("jobs").select("*").eq("id", id).maybeSingle();
      if (!error && data) {
        return mapJobFromDB(data);
      }
    } catch (err) {
      console.warn("fetchJobById error, falling back to local:", err.message);
    }
  }

  const list = loadLocalJobs();
  return list.find((j) => String(j.id) === String(id)) || null;
}

export async function createJob(jobData, userId) {
  if (isSupabaseConfigured) {
    const payload = {
      employer_id: userId || null,
      title: jobData.title,
      company: jobData.company || "Your Company",
      company_logo: jobData.companyLogo || "",
      location: jobData.location || "Jakarta",
      work_mode: jobData.workMode || "Hybrid",
      salary: jobData.salary || "Negotiable",
      type: jobData.type || "Full-time",
      industry: jobData.industry || "Technology",
      deadline: jobData.deadline || "",
      duration: jobData.duration || "Full-time",
      description: jobData.description || "",
      requirements: Array.isArray(jobData.requirements)
        ? jobData.requirements
        : typeof jobData.requirements === "string"
        ? jobData.requirements.split("\n").map((r) => r.trim()).filter(Boolean)
        : [],
      status: jobData.status || "Active",
    };

    const { data, error } = await supabase.from("jobs").insert([payload]).select().single();
    if (error) throw error;
    return mapJobFromDB(data);
  }

  // Local fallback
  const newJob = {
    id: `local-${Date.now()}`,
    employerId: userId || "demo-employer",
    title: jobData.title,
    company: jobData.company || "Your Company",
    location: jobData.location || "Jakarta",
    workMode: jobData.workMode || "Hybrid",
    salary: jobData.salary || "Negotiable",
    type: jobData.type || "Full-time",
    industry: jobData.industry || "Technology",
    posted: "Just now",
    deadline: jobData.deadline || "",
    duration: jobData.duration || "Full-time",
    match: 90,
    matchBreakdown: { skills: 90, location: 90, experience: 90, workMode: 90 },
    description: jobData.description || "",
    requirements: typeof jobData.requirements === "string"
      ? jobData.requirements.split("\n").map((r) => r.trim()).filter(Boolean)
      : jobData.requirements || [],
    status: jobData.status || "Active",
  };

  const current = loadLocalJobs();
  const next = [newJob, ...current];
  saveLocalJobs(next);
  return newJob;
}

export async function updateJob(id, updates) {
  if (isSupabaseConfigured) {
    const payload = {};
    if (updates.title) payload.title = updates.title;
    if (updates.status) payload.status = updates.status;
    if (updates.salary) payload.salary = updates.salary;
    if (updates.location) payload.location = updates.location;
    if (updates.workMode) payload.work_mode = updates.workMode;
    if (updates.deadline) payload.deadline = updates.deadline;

    const { data, error } = await supabase.from("jobs").update(payload).eq("id", id).select().single();
    if (error) throw error;
    return mapJobFromDB(data);
  }

  const current = loadLocalJobs();
  const next = current.map((j) => (String(j.id) === String(id) ? { ...j, ...updates } : j));
  saveLocalJobs(next);
  return next.find((j) => String(j.id) === String(id));
}
