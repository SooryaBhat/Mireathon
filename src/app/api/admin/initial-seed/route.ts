import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const adminPass = body.adminPassword || "MiraethonAdmin2026!";
    const judgePass = body.judgePassword || "MiraethonJudge2026!";

    // 1. Seed Admin: miraethon.admin@gmail.com
    const adminEmail = "miraethon.admin@gmail.com";
    const adminName = "Miraethon Admin";

    const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
    const existingAdmin = usersData?.users?.find((u) => u.email?.toLowerCase() === adminEmail);

    let adminId: string;
    if (existingAdmin) {
      adminId = existingAdmin.id;
      await supabaseAdmin.auth.admin.updateUserById(adminId, {
        password: adminPass,
        user_metadata: { full_name: adminName },
      });
    } else {
      const { data: newAdmin } = await supabaseAdmin.auth.admin.createUser({
        email: adminEmail,
        password: adminPass,
        email_confirm: true,
        user_metadata: { full_name: adminName },
      });
      adminId = newAdmin.user!.id;
    }

    await supabaseAdmin.from("profiles").upsert({
      id: adminId,
      full_name: adminName,
      email: adminEmail,
      role: "admin",
      updated_at: new Date().toISOString(),
    });

    // 2. Seed Judge: miraethon.judge@gmail.com
    const judgeEmail = "miraethon.judge@gmail.com";
    const judgeName = "Miraethon Judge";

    const existingJudge = usersData?.users?.find((u) => u.email?.toLowerCase() === judgeEmail);

    let judgeId: string;
    if (existingJudge) {
      judgeId = existingJudge.id;
      await supabaseAdmin.auth.admin.updateUserById(judgeId, {
        password: judgePass,
        user_metadata: { full_name: judgeName },
      });
    } else {
      const { data: newJudge } = await supabaseAdmin.auth.admin.createUser({
        email: judgeEmail,
        password: judgePass,
        email_confirm: true,
        user_metadata: { full_name: judgeName },
      });
      judgeId = newJudge.user!.id;
    }

    await supabaseAdmin.from("profiles").upsert({
      id: judgeId,
      full_name: judgeName,
      email: judgeEmail,
      role: "judge",
      updated_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      seeded: {
        admin: { email: adminEmail, role: "admin" },
        judge: { email: judgeEmail, role: "judge" },
      },
    });
  } catch (err: any) {
    console.error("Initial seed API error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
