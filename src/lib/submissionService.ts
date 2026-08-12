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

// Allowed File Types & Max Size
const ALLOWED_EXTENSIONS = [".pptx", ".ppt", ".pdf"];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

// 1. Fetch Team Submission Details
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

    // Generate signed download URL (valid 1 hour)
    const { data: urlData } = await supabase.storage
      .from("round1-submissions")
      .createSignedUrl(data.file_path, 3600);

    return {
      submission: data as Submission,
      signedUrl: urlData?.signedUrl || null,
    };
  } catch (err: any) {
    return { submission: null, signedUrl: null, error: err.message };
  }
}

// 2. Upload or Replace Round 1 Submission (Leader Only)
export async function uploadSubmission(
  teamId: string,
  leaderId: string,
  file: File
): Promise<{ submission: Submission | null; error?: string }> {
  try {
    // 1. Check deadline single source of truth (28 August 2026 Asia/Kolkata)
    const settings = await getHackathonSettings();
    if (isDeadlinePassed(settings.registration_deadline) || !settings.submission_open) {
      return {
        submission: null,
        error: "Submissions for Round 1 closed on 28 August 2026. Replacing or uploading files is locked.",
      };
    }

    // 2. Verify caller is Team Leader
    const { data: team, error: teamErr } = await supabase
      .from("teams")
      .select("leader_id")
      .eq("id", teamId)
      .maybeSingle();

    if (teamErr || !team || team.leader_id !== leaderId) {
      return {
        submission: null,
        error: "Permission denied: Only the Team Leader can upload or replace submissions.",
      };
    }

    // 3. Validate File Extension
    const fileName = file.name;
    const ext = "." + fileName.split(".").pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return {
        submission: null,
        error: `Invalid file type. Only ${ALLOWED_EXTENSIONS.join(", ")} files are accepted.`,
      };
    }

    // 4. Validate File Size (Max 10MB)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      return {
        submission: null,
        error: `File size exceeds the 10MB limit (Selected: ${sizeMB} MB). Please compress your file.`,
      };
    }

    // 5. Upload file to Supabase Storage bucket 'round1-submissions'
    const sanitizeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filePath = `${teamId}/${Date.now()}_${sanitizeName}`;

    const { error: storageErr } = await supabase.storage
      .from("round1-submissions")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (storageErr) {
      console.error("Storage upload error:", storageErr);
      return {
        submission: null,
        error: `Storage upload failed: ${storageErr.message}`,
      };
    }

    // 6. Upsert submission record in public.submissions table
    const { data: subData, error: subErr } = await supabase
      .from("submissions")
      .upsert(
        {
          team_id: teamId,
          file_path: filePath,
          file_name: fileName,
          file_size: file.size,
          file_type: file.type || ext,
          submitted_by: leaderId,
          status: "submitted",
          submitted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "team_id" }
      )
      .select()
      .single();

    if (subErr) {
      console.error("Database submission record error:", subErr);
      return {
        submission: null,
        error: `Failed to save submission record: ${subErr.message}`,
      };
    }

    return { submission: subData as Submission };
  } catch (err: any) {
    console.error("uploadSubmission unexpected error:", err);
    return { submission: null, error: err.message || "An unexpected upload error occurred." };
  }
}

// 3. Generate Signed Download URL for Any File Path (Authorized Calls)
export async function getSubmissionSignedUrl(filePath: string): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage
      .from("round1-submissions")
      .createSignedUrl(filePath, 3600);

    if (error || !data) return null;
    return data.signedUrl;
  } catch (err) {
    return null;
  }
}
