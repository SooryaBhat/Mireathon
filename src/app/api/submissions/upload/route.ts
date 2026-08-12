import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isDeadlinePassed } from "@/lib/teamService";

const ALLOWED_EXTENSIONS = [".ppt", ".pptx", ".pdf"];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const BUCKET_NAME = "round1-submissions";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const teamId = formData.get("teamId") as string | null;
    const userId = formData.get("userId") as string | null;

    if (!file || !teamId || !userId) {
      return NextResponse.json(
        { error: "Missing required fields: file, teamId, or userId." },
        { status: 400 }
      );
    }

    // 1. Verify Deadline (28 August 2026 Asia/Kolkata)
    const { data: settings } = await supabaseAdmin
      .from("hackathon_settings")
      .select("registration_deadline, submission_open")
      .limit(1)
      .maybeSingle();

    const deadline = settings?.registration_deadline || "2026-08-28T23:59:59+05:30";
    if (isDeadlinePassed(deadline) || settings?.submission_open === false) {
      return NextResponse.json(
        { error: "Round 1 submissions closed on 28 August 2026. File upload and replacement are locked." },
        { status: 403 }
      );
    }

    // 2. Verify User & Team Leader Status from Database (Do NOT trust client values)
    const { data: team, error: teamErr } = await supabaseAdmin
      .from("teams")
      .select("id, leader_id, team_name")
      .eq("id", teamId)
      .maybeSingle();

    if (teamErr || !team) {
      return NextResponse.json({ error: "Team not found." }, { status: 404 });
    }

    if (team.leader_id !== userId) {
      return NextResponse.json(
        { error: "Permission denied: Only the Team Leader can upload or replace Round 1 proposals." },
        { status: 403 }
      );
    }

    // 3. Validate File Extension & Size
    const fileName = file.name;
    const ext = "." + fileName.split(".").pop()?.toLowerCase();

    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json(
        { error: `Invalid file type. Only ${ALLOWED_EXTENSIONS.join(", ")} files are accepted.` },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      return NextResponse.json(
        { error: `File size exceeds the 10MB limit (Selected: ${sizeMB} MB). Please compress your file.` },
        { status: 400 }
      );
    }

    // 4. Guarantee Private Bucket Exists in Remote Supabase Project
    const { data: bucket } = await supabaseAdmin.storage.getBucket(BUCKET_NAME);
    if (!bucket) {
      console.log(`Bucket '${BUCKET_NAME}' not found. Creating private bucket...`);
      await supabaseAdmin.storage.createBucket(BUCKET_NAME, {
        public: false,
        fileSizeLimit: MAX_FILE_SIZE_BYTES,
      });
    }

    // 5. Upload File to Storage Path: {team_id}/{timestamp}_{filename}
    const sanitizeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filePath = `${teamId}/${Date.now()}_${sanitizeName}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadErr } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(filePath, buffer, {
        contentType: file.type || "application/octet-stream",
        upsert: true,
      });

    if (uploadErr) {
      console.error("Supabase Admin storage upload error:", uploadErr);
      return NextResponse.json(
        { error: `Storage upload failed: ${uploadErr.message}` },
        { status: 500 }
      );
    }

    // 6. Create / Update Row in submissions Table
    const { data: subData, error: dbErr } = await supabaseAdmin
      .from("submissions")
      .upsert(
        {
          team_id: teamId,
          submitted_by: userId,
          file_path: filePath,
          file_name: fileName,
          file_size: file.size,
          file_type: file.type || ext,
          status: "submitted",
          submitted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "team_id" }
      )
      .select()
      .single();

    if (dbErr) {
      console.error("Database submission record error:", dbErr);
      return NextResponse.json(
        { error: `Failed to save submission record: ${dbErr.message}` },
        { status: 500 }
      );
    }

    // 7. Generate Signed Download URL (valid 1 hour)
    const { data: urlData } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .createSignedUrl(filePath, 3600);

    return NextResponse.json({
      success: true,
      submission: subData,
      signedUrl: urlData?.signedUrl || null,
    });
  } catch (err: any) {
    console.error("API /api/submissions/upload error:", err);
    return NextResponse.json(
      { error: err.message || "An unexpected server error occurred during upload." },
      { status: 500 }
    );
  }
}
