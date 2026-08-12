import { supabase } from "./supabase/client";
import { getHackathonSettings, isDeadlinePassed } from "./teamService";

export interface Submission {
  id: string;
  team_id: string;
  file_path: string;
  file_name: string;
  file_size: number;
  file_type: string;
  submitted_by?: string;
  status: string;
  submitted_at: string;
  updated_at: string;
}

const ALLOWED_EXTENSIONS = [".ppt", ".pptx", ".pdf"];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

// 1. Fetch Team Submission Details & Signed Download URL
export async function getTeamSubmission(teamId: string): Promise<{
  submission: Submission | null;
  signedUrl: string | null;
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from("submissions")
      .select("*")
      .eq("team_id", teamId)
      .maybeSingle();

    if (error || !data) {
      return { submission: null, signedUrl: null };
    }

    // Get signed URL via API endpoint
    let signedUrl: string | null = null;
    try {
      const resp = await fetch("/api/submissions/signed-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filePath: data.file_path }),
      });
      if (resp.ok) {
        const urlData = await resp.json();
        signedUrl = urlData.signedUrl || null;
      }
    } catch (e) {
      // Client storage fallback
      const { data: urlData } = await supabase.storage
        .from("round1-submissions")
        .createSignedUrl(data.file_path, 3600);
      signedUrl = urlData?.signedUrl || null;
    }

    return {
      submission: data as Submission,
      signedUrl,
    };
  } catch (err: any) {
    return { submission: null, signedUrl: null, error: err.message };
  }
}

// 2. Upload or Replace Round 1 Submission via Secure API Endpoint
export async function uploadSubmission(
  teamId: string,
  leaderId: string,
  file: File
): Promise<{ submission: Submission | null; error?: string }> {
  try {
    // Client-side quick validations
    const settings = await getHackathonSettings();
    if (isDeadlinePassed(settings.registration_deadline) || !settings.submission_open) {
      return {
        submission: null,
        error: "Submissions for Round 1 closed on 28 August 2026. File upload and replacement are locked.",
      };
    }

    const fileName = file.name;
    const ext = "." + fileName.split(".").pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return {
        submission: null,
        error: `Invalid file type. Only ${ALLOWED_EXTENSIONS.join(", ")} files are accepted.`,
      };
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      return {
        submission: null,
        error: `File size exceeds the 10MB limit (Selected: ${sizeMB} MB). Please compress your file.`,
      };
    }

    // Send to Server Upload API
    const formData = new FormData();
    formData.append("file", file);
    formData.append("teamId", teamId);
    formData.append("userId", leaderId);

    const resp = await fetch("/api/submissions/upload", {
      method: "POST",
      body: formData,
    });

    const resData = await resp.json();

    if (!resp.ok || !resData.success) {
      return {
        submission: null,
        error: resData.error || "Failed to upload submission to server.",
      };
    }

    return { submission: resData.submission as Submission };
  } catch (err: any) {
    console.error("uploadSubmission unexpected error:", err);
    return { submission: null, error: err.message || "An unexpected upload error occurred." };
  }
}

// 3. Generate Signed Download URL for Any File Path
export async function getSubmissionSignedUrl(filePath: string): Promise<string | null> {
  try {
    const resp = await fetch("/api/submissions/signed-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filePath }),
    });
    if (resp.ok) {
      const resData = await resp.json();
      return resData.signedUrl || null;
    }
  } catch (err) {
    // Client fallback
    const { data } = await supabase.storage.from("round1-submissions").createSignedUrl(filePath, 3600);
    return data?.signedUrl || null;
  }
  return null;
}
