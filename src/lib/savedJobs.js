const KEY = "nexora_saved_jobs_v1";

export function loadSavedJobs() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr.map((id) => String(id)) : []);
  } catch {
    return new Set();
  }
}

export function saveSavedJobs(set) {
  try {
    localStorage.setItem(KEY, JSON.stringify([...set]));
  } catch {
    /* ignore */
  }
}

export function toggleSavedJob(set, id) {
  const next = new Set(set);
  const key = String(id);
  if (next.has(key)) next.delete(key);
  else next.add(key);
  return next;
}