import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  return handleSetup();
}

export async function POST(req: NextRequest) {
  return handleSetup();
}

async function handleSetup() {
  try {
    const bucketName = "round1-submissions";

    // 1. Check if bucket exists
    const { data: bucket, error: getErr } = await supabaseAdmin.storage.getBucket(bucketName);

    let bucketCreated = false;
    let bucketMessage = "";

    if (getErr || !bucket) {
      // Bucket not found -> Create private bucket
      const { data: newBucket, error: createErr } = await supabaseAdmin.storage.createBucket(bucketName, {
        public: false,
        fileSizeLimit: 10 * 1024 * 1024, // 10MB limit
        allowedMimeTypes: [
          "application/pdf",
          "application/vnd.ms-powerpoint",
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
          "application/octet-stream",
        ],
      });

      if (createErr) {
        console.error("Failed to create storage bucket:", createErr);
        return NextResponse.json(
          { error: `Failed to create storage bucket: ${createErr.message}` },
          { status: 500 }
        );
      }

      bucketCreated = true;
      bucketMessage = `Bucket '${bucketName}' created successfully as PRIVATE bucket.`;
    } else {
      bucketMessage = `Bucket '${bucketName}' already exists and is configured.`;

      // Update bucket to ensure it is PRIVATE
      if (bucket.public) {
        await supabaseAdmin.storage.updateBucket(bucketName, {
          public: false,
          fileSizeLimit: 10 * 1024 * 1024,
        });
        bucketMessage += " (Updated to PRIVATE)";
      }
    }

    return NextResponse.json({
      success: true,
      bucketName,
      bucketCreated,
      message: bucketMessage,
    });
  } catch (err: any) {
    console.error("Setup storage API error:", err);
    return NextResponse.json({ error: err.message || "Failed to setup storage bucket." }, { status: 500 });
  }
}
