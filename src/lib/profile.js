const KEY = "nexora_profile_v1";

export const DEFAULT_PROFILE = {
  name: "User",
  email: "",
  phone: "",
  birthday: "March 5, 1999",
  placeOfBirth: "Jakarta",
  location: "Jakarta",
  about: "",
  skills: [],
  education: [],
  experience: [],
  projects: [],
  certificates: [],
};

export function loadProfile() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_PROFILE };
    return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_PROFILE };
  }
}

export function saveProfile(profile) {
  try {
    localStorage.setItem(KEY, JSON.stringify(profile));
  } catch {
    /* storage unavailable — ignore */
  }
}

const WEIGHTS = {
  about: 10,
  skills: 20,
  education: 20,
  experience: 25,
  projects: 15,
  certificates: 10,
};

export function profilePercent(profile) {
  let score = 0;
  if (profile.name && profile.name.trim()) score += 6;
  if (profile.about && profile.about.trim()) score += WEIGHTS.about;
  if (profile.email) score += 4;
  if (profile.location) score += 3;
  if (profile.birthday) score += 2;
  score += Math.min(WEIGHTS.skills, (profile.skills?.length || 0) * 4);
  if ((profile.education?.length || 0) > 0) score += WEIGHTS.education;
  if ((profile.experience?.length || 0) > 0) score += WEIGHTS.experience;
  if ((profile.projects?.length || 0) > 0) score += WEIGHTS.projects;
  if ((profile.certificates?.length || 0) > 0) score += WEIGHTS.certificates;
  return Math.min(100, Math.round(score));
}