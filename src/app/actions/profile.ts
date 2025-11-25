"use server";

import type { ParsedResume } from "@/mastra/agents/resume-parser";
import { cookies } from "next/headers";

// Use cookies for profile storage until database is configured
const PROFILE_COOKIE_KEY = "apply-io-profile";

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

export type SaveProfileResult =
  | { success: true }
  | { success: false; error: string };

export type LoadProfileResult =
  | { success: true; data: ProfileData | null }
  | { success: false; error: string };

export async function saveProfile(data: ProfileData): Promise<SaveProfileResult> {
  try {
    const cookieStore = await cookies();
    
    // Store profile as JSON in cookie (chunked if needed due to 4KB limit)
    const profileJson = JSON.stringify(data);
    
    // Set cookie with 1 year expiry
    cookieStore.set(PROFILE_COOKIE_KEY, profileJson, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: "/",
    });

    return { success: true };
  } catch (error) {
    console.error("Save profile error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save profile",
    };
  }
}

export async function loadProfile(): Promise<LoadProfileResult> {
  try {
    const cookieStore = await cookies();
    const profileCookie = cookieStore.get(PROFILE_COOKIE_KEY);

    if (!profileCookie?.value) {
      return { success: true, data: null };
    }

    const data = JSON.parse(profileCookie.value) as ProfileData;

    return {
      success: true,
      data: {
        headline: data.headline ?? null,
        summary: data.summary ?? null,
        skills: data.skills ?? [],
        experience: data.experience ?? [],
        education: data.education ?? [],
        targetTitles: data.targetTitles ?? [],
        targetLocations: data.targetLocations ?? [],
        searchKeywords: data.searchKeywords ?? [],
        minSalary: data.minSalary ?? null,
        maxSalary: data.maxSalary ?? null,
        remotePreference: data.remotePreference ?? null,
        companySize: data.companySize ?? [],
        resumeText: data.resumeText ?? null,
      },
    };
  } catch (error) {
    console.error("Load profile error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to load profile",
    };
  }
}

// Helper to update profile from parsed resume
export async function updateProfileFromResume(
  parsedData: ParsedResume,
  rawText: string
): Promise<SaveProfileResult> {
  try {
    // Load existing profile to merge data
    const existingResult = await loadProfile();
    const existingProfile = existingResult.success ? existingResult.data : null;

    const mergedData: ProfileData = {
      headline: parsedData.headline ?? existingProfile?.headline ?? null,
      summary: parsedData.summary ?? existingProfile?.summary ?? null,
      skills: parsedData.skills?.length > 0 
        ? parsedData.skills 
        : (existingProfile?.skills ?? []),
      experience: parsedData.experience?.length > 0 
        ? parsedData.experience 
        : (existingProfile?.experience ?? []),
      education: parsedData.education?.length > 0 
        ? parsedData.education 
        : (existingProfile?.education ?? []),
      targetTitles: parsedData.targetTitles?.length > 0 
        ? parsedData.targetTitles 
        : (existingProfile?.targetTitles ?? []),
      targetLocations: existingProfile?.targetLocations ?? [],
      searchKeywords: parsedData.searchKeywords?.length > 0 
        ? parsedData.searchKeywords 
        : (existingProfile?.searchKeywords ?? []),
      minSalary: existingProfile?.minSalary ?? null,
      maxSalary: existingProfile?.maxSalary ?? null,
      remotePreference: existingProfile?.remotePreference ?? null,
      companySize: existingProfile?.companySize ?? [],
      resumeText: rawText,
    };

    return saveProfile(mergedData);
  } catch (error) {
    console.error("Update profile from resume error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update profile",
    };
  }
}
