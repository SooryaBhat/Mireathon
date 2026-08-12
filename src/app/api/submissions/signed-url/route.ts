import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { filePath } = body;

    if (!filePath) {
      return NextResponse.json({ error: "Missing filePath parameter." }, { status: 400 });
    }

    // Generate signed URL valid for 1 hour (3600 seconds)
    const { data, error } = await supabaseAdmin.storage
      .from("round1-submissions")
      .createSignedUrl(filePath, 3600);

    if (error || !data?.signedUrl) {
      return NextResponse.json({ error: error?.message || "Failed to generate signed URL." }, { status: 500 });
    }

    return NextResponse.json({ signedUrl: data.signedUrl });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
