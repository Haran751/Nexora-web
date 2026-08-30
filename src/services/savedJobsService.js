import { supabase, isSupabaseConfigured } from "../lib/supabase.js";
import { loadSavedJobs, saveSavedJobs, toggleSavedJob as toggleLocal } from "../lib/savedJobs.js";

function isValidUuid(id) {
  return typeof id === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

const savedJobsCache = new Map();

export async function fetchSavedJobIds(userId) {
  const cacheKey = String(userId || "guest");
  if (savedJobsCache.has(cacheKey)) {
    // Return cached immediately; if user exists, revalidate in background
    if (isSupabaseConfigured && isValidUuid(userId)) {
      fetchSavedJobIdsRaw(userId).then((freshSet) => {
        savedJobsCache.set(cacheKey, freshSet);
      }).catch(() => {});
    }
    return savedJobsCache.get(cacheKey);
  }

  const set = await fetchSavedJobIdsRaw(userId);
  savedJobsCache.set(cacheKey, set);
  return set;
}

async function fetchSavedJobIdsRaw(userId) {
  if (isSupabaseConfigured && isValidUuid(userId)) {
    try {
      const { data, error } = await supabase
        .from("saved_jobs")
        .select("job_id")
        .eq("user_id", userId);

      if (error) throw error;
      if (data) {
        return new Set(data.map((r) => String(r.job_id)));
      }
    } catch (err) {
      console.warn("fetchSavedJobIds error, using local:", err.message);
    }
  }

  return loadSavedJobs();
}

export async function toggleSavedJobId(userId, jobId, currentSet) {
  const isSaved = currentSet.has(String(jobId));

  if (isSupabaseConfigured && isValidUuid(userId) && isValidUuid(jobId)) {
    try {
      if (isSaved) {
        await supabase
          .from("saved_jobs")
          .delete()
          .eq("user_id", userId)
          .eq("job_id", jobId);
      } else {
        await supabase
          .from("saved_jobs")
          .insert({ user_id: userId, job_id: jobId });
      }
    } catch (err) {
      console.error("toggleSavedJobId Supabase error:", err);
    }
  }

  // Always update local cache for instant UI feedback
  const next = toggleLocal(currentSet, jobId);
  saveSavedJobs(next);
  savedJobsCache.set(String(userId || "guest"), next);
  return next;
}
