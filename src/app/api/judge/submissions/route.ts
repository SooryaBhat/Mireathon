import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const judgeId = searchParams.get("judgeId") || "";
    const trackFilter = searchParams.get("track") || "all";
    const statusFilter = searchParams.get("status") || "all";

    // 1. Fetch Submissions
    const { data: rawSubmissions, error: subErr } = await supabaseAdmin
      .from("submissions")
      .select("*")
      .order("submitted_at", { ascending: false });

    if (subErr) {
      console.error("Server API Submissions fetch error:", subErr);
      return NextResponse.json({ error: subErr.message }, { status: 500 });
    }

    if (!rawSubmissions || rawSubmissions.length === 0) {
      return NextResponse.json({ submissions: [] });
    }

    // 2. Fetch Teams
    const { data: teamsData } = await supabaseAdmin
      .from("teams")
      .select("id, team_name, team_code, theme_id");

    const teamMap = new Map<string, any>();
    (teamsData || []).forEach((t: any) => teamMap.set(t.id, t));

    // 3. Fetch Themes
    const { data: themesData } = await supabaseAdmin
      .from("themes")
      .select("id, name, slug");

    const themeMap = new Map<string, any>();
    (themesData || []).forEach((th: any) => {
      themeMap.set(th.id, th);
      if (th.slug) themeMap.set(th.slug, th);
    });

    // 4. Fetch Evaluations (round1_evaluations with fallback to evaluations)
    let evaluations: any[] = [];
    if (judgeId) {
      const { data: r1Evals, error: r1Err } = await supabaseAdmin
        .from("round1_evaluations")
        .select("*")
        .eq("judge_id", judgeId);

      if (!r1Err && r1Evals) {
        evaluations = r1Evals;
      } else {
        const { data: legacyEvals } = await supabaseAdmin
          .from("evaluations")
          .select("*")
          .eq("judge_id", judgeId);
        evaluations = legacyEvals || [];
      }
    }

    const evalMap = new Map<string, any>();
    evaluations.forEach((e: any) => evalMap.set(e.submission_id, e));

    // 5. Fetch Team Members
    const { data: allMembers } = await supabaseAdmin
      .from("team_members")
      .select("team_id, user_id, member_role, profiles(full_name, email, role)");

    const membersMap = new Map<string, any[]>();
    (allMembers || []).forEach((m: any) => {
      const list = membersMap.get(m.team_id) || [];
      list.push({
        full_name: m.profiles?.full_name || "Team Member",
        email: m.profiles?.email || "",
        role: m.member_role || "member",
      });
      membersMap.set(m.team_id, list);
    });

    const submissionsResult: any[] = [];

    for (const sub of rawSubmissions) {
      const team = teamMap.get(sub.team_id) || {
        id: sub.team_id,
        team_name: "Squad #" + sub.team_id.slice(0, 8),
        team_code: "N/A",
        theme_id: "",
      };

      const themeObj = themeMap.get(team.theme_id);
      const themeName = themeObj?.name || "General Track";
      const themeSlug = themeObj?.slug || "";
      const themeId = team.theme_id || "";

      // Apply Track Filter
      if (trackFilter !== "all") {
        if (
          themeId !== trackFilter &&
          themeSlug !== trackFilter &&
          !themeName.toLowerCase().includes(trackFilter.toLowerCase())
        ) {
          continue;
        }
      }

      const rawEval = evalMap.get(sub.id) || null;
      let mappedEval: any = null;
      if (rawEval) {
        mappedEval = {
          id: rawEval.id,
          submission_id: rawEval.submission_id,
          team_id: rawEval.team_id,
          judge_id: rawEval.judge_id,
          creativity_score: Number(rawEval.creativity_innovation ?? rawEval.creativity_score ?? 0),
          business_problem_score: Number(rawEval.business_relevance ?? rawEval.business_problem_score ?? 0),
          technology_score: Number(rawEval.ai_technology ?? rawEval.technology_score ?? 0),
          feasibility_score: Number(rawEval.feasibility_execution ?? rawEval.feasibility_score ?? 0),
          impact_score: Number(rawEval.business_impact_scalability ?? rawEval.impact_score ?? 0),
          track_relevance_score: Number(rawEval.track_relevance ?? rawEval.track_relevance_score ?? 0),
          presentation_score: Number(rawEval.presentation_clarity ?? rawEval.presentation_score ?? 0),
          total_score: Number(rawEval.total_score ?? 0),
          comments: rawEval.feedback || rawEval.comments || "",
          status: rawEval.status || "submitted",
        };
      }

      const isEvaluated = mappedEval && mappedEval.status === "submitted";

      // Apply Status Filter
      if (statusFilter === "pending" && isEvaluated) continue;
      if (statusFilter === "evaluated" && !isEvaluated) continue;

      const members = membersMap.get(team.id) || [];

      submissionsResult.push({
        submission_id: sub.id,
        team_id: team.id,
        team_name: team.team_name,
        team_code: team.team_code,
        theme_id: themeId,
        theme_name: themeName,
        file_name: sub.file_name || sub.original_filename || "Proposal.pptx",
        file_path: sub.file_path,
        file_size: Number(sub.file_size || 0),
        submitted_at: sub.submitted_at || new Date().toISOString(),
        members_count: members.length,
        members,
        evaluation: mappedEval,
      });
    }

    return NextResponse.json({ submissions: submissionsResult });
  } catch (err: any) {
    console.error("GET /api/judge/submissions error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch judge submissions" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      submission_id,
      team_id,
      judge_id,
      creativity_score,
      business_problem_score,
      technology_score,
      feasibility_score,
      impact_score,
      track_relevance_score,
      presentation_score,
      comments,
      status,
    } = body;

    if (!submission_id || !team_id || !judge_id) {
      return NextResponse.json(
        { error: "Missing required fields: submission_id, team_id, or judge_id" },
        { status: 400 }
      );
    }

    // Clamp scores safely
    const creativity = Math.min(35, Math.max(0, Number(creativity_score || 0)));
    const businessProblem = Math.min(15, Math.max(0, Number(business_problem_score || 0)));
    const technology = Math.min(15, Math.max(0, Number(technology_score || 0)));
    const feasibility = Math.min(10, Math.max(0, Number(feasibility_score || 0)));
    const impact = Math.min(10, Math.max(0, Number(impact_score || 0)));
    const trackRelevance = Math.min(10, Math.max(0, Number(track_relevance_score || 0)));
    const presentation = Math.min(5, Math.max(0, Number(presentation_score || 0)));

    const totalScore = Number(
      (creativity + businessProblem + technology + feasibility + impact + trackRelevance + presentation).toFixed(2)
    );

    const payload = {
      submission_id,
      team_id,
      judge_id,
      creativity_innovation: creativity,
      business_relevance: businessProblem,
      ai_technology: technology,
      feasibility_execution: feasibility,
      business_impact_scalability: impact,
      track_relevance: trackRelevance,
      presentation_clarity: presentation,
      total_score: totalScore,
      feedback: comments || "",
      status: status || "submitted",
      updated_at: new Date().toISOString(),
    };

    // Primary upsert to round1_evaluations
    let { data: savedData, error: saveErr } = await supabaseAdmin
      .from("round1_evaluations")
      .upsert(payload, { onConflict: "submission_id,judge_id" })
      .select()
      .maybeSingle();

    if (saveErr) {
      console.warn("round1_evaluations upsert notice:", saveErr.message);
      // Fallback: try legacy evaluations table
      const legacyPayload = {
        submission_id,
        team_id,
        judge_id,
        creativity_score: creativity,
        business_problem_score: businessProblem,
        technology_score: technology,
        feasibility_score: feasibility,
        impact_score: impact,
        track_relevance_score: trackRelevance,
        presentation_score: presentation,
        total_score: totalScore,
        comments: comments || "",
        status: status || "submitted",
        updated_at: new Date().toISOString(),
      };

      const fallback = await supabaseAdmin
        .from("evaluations")
        .upsert(legacyPayload, { onConflict: "submission_id,judge_id" })
        .select()
        .maybeSingle();

      savedData = fallback.data;
      saveErr = fallback.error;
    }

    if (saveErr) {
      return NextResponse.json(
        {
          error: `Failed to save evaluation to database. Please make sure the 'round1_evaluations' table has been created in your Supabase SQL Editor. Error: ${saveErr.message}`,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, evaluation: savedData });
  } catch (err: any) {
    console.error("POST /api/judge/submissions error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to save evaluation" },
      { status: 500 }
    );
  }
}
