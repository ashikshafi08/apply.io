// Client-side profile storage using localStorage
// This is more reliable than cookies for larger data

export type ProfileData = {
  headline: string | null;
  summary: string | null;
  skills: string[];
  experience: {
    title: string;
    company: string;
    duration: string;
    highlights: string[];
  }[];
  education: {
    school: string;
    degree: string;
    year: string;
  }[];
  targetTitles: string[];
  targetLocations: string[];
  searchKeywords: string[];
  minSalary: number | null;
  maxSalary: number | null;
  remotePreference: string | null;
  companySize: string[];
  resumeText: string | null;
};

const STORAGE_KEY = "apply-io-profile";

export function saveProfileToStorage(data: ProfileData): boolean {
  try {
    if (typeof window === "undefined") return false;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error("Failed to save profile to localStorage:", error);
    return false;
  }
}

export function loadProfileFromStorage(): ProfileData | null {
  try {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as ProfileData;
  } catch (error) {
    console.error("Failed to load profile from localStorage:", error);
    return null;
  }
}

export function clearProfileStorage(): void {
  try {
    if (typeof window === "undefined") return;
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear profile from localStorage:", error);
  }
}

