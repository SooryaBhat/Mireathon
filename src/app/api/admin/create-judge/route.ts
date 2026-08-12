import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, fullName } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters long." }, { status: 400 });
    }

    const judgeEmail = email.trim().toLowerCase();
    const judgeName = fullName?.trim() || "Miraethon Judge";

    // 1. Check if user already exists in auth.users
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find((u) => u.email?.toLowerCase() === judgeEmail);

    let userId: string;

    if (existingUser) {
      userId = existingUser.id;
      // Update password & metadata
      const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        password: password,
        user_metadata: { full_name: judgeName },
      });

      if (updateErr) {
        return NextResponse.json({ error: updateErr.message }, { status: 500 });
      }
    } else {
      // Create new user in Auth
      const { data: newUser, error: createErr } = await supabaseAdmin.auth.admin.createUser({
        email: judgeEmail,
        password: password,
        email_confirm: true, // Auto-confirm judge email
        user_metadata: { full_name: judgeName },
      });

      if (createErr || !newUser.user) {
        return NextResponse.json({ error: createErr?.message || "Failed to create judge auth user." }, { status: 500 });
      }

      userId = newUser.user.id;
    }

    // 2. Ensure role = 'judge' in public.profiles table
    const { error: profErr } = await supabaseAdmin
      .from("profiles")
      .upsert({
        id: userId,
        full_name: judgeName,
        email: judgeEmail,
        role: "judge",
        updated_at: new Date().toISOString(),
      });

    if (profErr) {
      return NextResponse.json({ error: profErr.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        email: judgeEmail,
        full_name: judgeName,
        role: "judge",
      },
    });
  } catch (err: any) {
    console.error("API /api/admin/create-judge error:", err);
    return NextResponse.json({ error: err.message || "Server error while creating judge." }, { status: 500 });
  }
}
