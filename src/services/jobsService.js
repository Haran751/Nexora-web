import { supabase, isSupabaseConfigured } from "../lib/supabase.js";
import { jdJobs } from "../lib/jobsData.js";
import { sanitizeText } from "../lib/security.js";

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

const CACHE_TTL_MS = 60 * 1000; // 60 seconds
const jobsCache = new Map();
const jobByIdCache = new Map();

export function clearJobsCache() {
  jobsCache.clear();
  jobByIdCache.clear();
}

function getFilterKey(filters = {}) {
  return `${filters.status || "Active"}_${filters.employerId || "all"}`;
}

function indexJobs(jobsList) {
  if (Array.isArray(jobsList)) {
    jobsList.forEach((j) => {
      if (j?.id) jobByIdCache.set(String(j.id), j);
    });
  }
}

export async function fetchJobs(filters = {}) {
  const cacheKey = getFilterKey(filters);
  const cached = jobsCache.get(cacheKey);
  const now = Date.now();

  // Return fresh cache immediately
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  // SWR: If we have stale cache, return it immediately and revalidate in background
  if (cached) {
    fetchJobsRaw(filters)
      .then((fresh) => {
        jobsCache.set(cacheKey, { data: fresh, timestamp: Date.now() });
        indexJobs(fresh);
      })
      .catch(() => {});
    return cached.data;
  }

  // Cold cache: fetch directly
  const data = await fetchJobsRaw(filters);
  jobsCache.set(cacheKey, { data, timestamp: now });
  indexJobs(data);
  return data;
}

async function fetchJobsRaw(filters = {}) {
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
  const strId = String(id);
  // Check fast in-memory index
  if (jobByIdCache.has(strId)) {
    return jobByIdCache.get(strId);
  }

  if (isSupabaseConfigured && isValidUuid(id)) {
    try {
      const { data, error } = await supabase.from("jobs").select("*").eq("id", id).maybeSingle();
      if (!error && data) {
        const job = mapJobFromDB(data);
        if (job) jobByIdCache.set(strId, job);
        return job;
      }
    } catch (err) {
      console.warn("fetchJobById error, falling back to local:", err.message);
    }
  }

  const list = loadLocalJobs();
  indexJobs(list);
  const found = list.find((j) => String(j.id) === strId) || null;
  if (found) jobByIdCache.set(strId, found);
  return found;
}

export async function createJob(jobData, userId) {
  const safeTitle = sanitizeText(jobData.title, 120);
  const safeCompany = sanitizeText(jobData.company || "Your Company", 100);
  const safeLocation = sanitizeText(jobData.location || "Jakarta", 80);
  const safeSalary = sanitizeText(jobData.salary || "Negotiable", 50);
  const safeDesc = sanitizeText(jobData.description || "", 5000);
  const safeReqs = (Array.isArray(jobData.requirements)
    ? jobData.requirements
    : typeof jobData.requirements === "string"
    ? jobData.requirements.split("\n")
    : []
  )
    .map((r) => sanitizeText(r, 200))
    .filter(Boolean);

  if (isSupabaseConfigured) {
    const payload = {
      employer_id: userId || null,
      title: safeTitle,
      company: safeCompany,
      company_logo: jobData.companyLogo || "",
      location: safeLocation,
      work_mode: jobData.workMode || "Hybrid",
      salary: safeSalary,
      type: jobData.type || "Full-time",
      industry: jobData.industry || "Technology",
      deadline: jobData.deadline || "",
      duration: jobData.duration || "Full-time",
      description: safeDesc,
      requirements: safeReqs,
      status: jobData.status || "Active",
    };

    const { data, error } = await supabase.from("jobs").insert([payload]).select().single();
    if (error) throw error;
    const mapped = mapJobFromDB(data);
    if (mapped) {
      jobByIdCache.set(String(mapped.id), mapped);
      jobsCache.clear();
    }
    return mapped;
  }

  // Local fallback
  const newJob = {
    id: `local-${Date.now()}`,
    employerId: userId ,
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
  jobByIdCache.set(String(newJob.id), newJob);
  jobsCache.clear();
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
    const mapped = mapJobFromDB(data);
    if (mapped) {
      jobByIdCache.set(String(mapped.id), mapped);
      jobsCache.clear();
    }
    return mapped;
  }

  const current = loadLocalJobs();
  const next = current.map((j) => (String(j.id) === String(id) ? { ...j, ...updates } : j));
  saveLocalJobs(next);
  const updated = next.find((j) => String(j.id) === String(id));
  if (updated) {
    jobByIdCache.set(String(updated.id), updated);
    jobsCache.clear();
  }
  return updated;
}
