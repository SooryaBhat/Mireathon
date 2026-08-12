import { supabase } from "./supabase/client";

export interface Evaluation {
  id?: string;
  submission_id: string;
  team_id: string;
  judge_id: string;
  creativity_score: number; // Max 35
  business_problem_score: number; // Max 15
  technology_score: number; // Max 15
  feasibility_score: number; // Max 10
  impact_score: number; // Max 10
  track_relevance_score: number; // Max 10
  presentation_score: number; // Max 5
  total_score: number; // Max 100
  comments: string;
  status: "draft" | "submitted";
  created_at?: string;
  updated_at?: string;
}

export interface JudgeSubmissionView {
  submission_id: string;
  team_id: string;
  team_name: string;
  team_code: string;
  theme_id: string;
  theme_name: string;
  file_name: string;
  file_path: string;
  file_size: number;
  submitted_at: string;
  members_count: number;
  members: Array<{ full_name: string; email: string; role: string }>;
  evaluation: Evaluation | null;
}

// Criteria Max Marks Reference
export const JUDGING_CRITERIA = {
  creativity: { label: "1. Creativity & Innovation", max: 35, tieBreakerRank: 1 },
  businessProblem: { label: "2. Business Problem & Relevance", max: 15, tieBreakerRank: 0 },
  technology: { label: "3. AI / Technology Application", max: 15, tieBreakerRank: 0 },
  feasibility: { label: "4. Feasibility & Execution Potential", max: 10, tieBreakerRank: 0 },
  impact: { label: "5. Business Impact & Scalability", max: 10, tieBreakerRank: 2 },
  trackRelevance: { label: "6. Track Relevance", max: 10, tieBreakerRank: 3 },
  presentation: { label: "7. Presentation & Clarity", max: 5, tieBreakerRank: 0 },
};

// 1. Fetch All Submissions for Judge Evaluation with Filter by Track & Status
export async function getSubmissionsForJudge(
  judgeId: string,
  trackFilter: string = "all",
  statusFilter: string = "all"
): Promise<{ submissions: JudgeSubmissionView[]; error?: string }> {
  try {
    // 1. Flat query for all submissions
    const { data: rawSubmissions, error: subErr } = await supabase
      .from("submissions")
      .select("*")
      .order("submitted_at", { ascending: false });

    if (subErr) {
      console.error("Judge submissions fetch error:", subErr);
      return { submissions: [], error: `Failed to fetch submissions: ${subErr.message}` };
    }

    if (!rawSubmissions || rawSubmissions.length === 0) {
      return { submissions: [] };
    }

    // 2. Flat query for teams
    const { data: teamsData, error: teamErr } = await supabase
      .from("teams")
      .select("id, team_name, team_code, theme_id");

    if (teamErr) {
      console.warn("Teams fetch notice:", teamErr.message);
    }

    const teamMap = new Map<string, any>();
    (teamsData || []).forEach((t: any) => teamMap.set(t.id, t));

    // 3. Flat query for themes
    const { data: themesData } = await supabase
      .from("themes")
      .select("id, name, slug");

    const themeMap = new Map<string, any>();
    (themesData || []).forEach((th: any) => {
      themeMap.set(th.id, th);
      if (th.slug) themeMap.set(th.slug, th);
    });

    // 4. Fetch evaluations from round1_evaluations (with fallback to evaluations)
    let evaluations: any[] = [];
    const { data: r1Evals, error: r1Err } = await supabase
      .from("round1_evaluations")
      .select("*")
      .eq("judge_id", judgeId);

    if (!r1Err && r1Evals) {
      evaluations = r1Evals;
    } else {
      const { data: legacyEvals } = await supabase
        .from("evaluations")
        .select("*")
        .eq("judge_id", judgeId);
      evaluations = legacyEvals || [];
    }

    const evalMap = new Map<string, Evaluation>();
    evaluations.forEach((e: any) => {
      const mappedEval: Evaluation = {
        id: e.id,
        submission_id: e.submission_id,
        team_id: e.team_id,
        judge_id: e.judge_id,
        creativity_score: Number(e.creativity_innovation ?? e.creativity_score ?? 0),
        business_problem_score: Number(e.business_relevance ?? e.business_problem_score ?? 0),
        technology_score: Number(e.ai_technology ?? e.technology_score ?? 0),
        feasibility_score: Number(e.feasibility_execution ?? e.feasibility_score ?? 0),
        impact_score: Number(e.business_impact_scalability ?? e.impact_score ?? 0),
        track_relevance_score: Number(e.track_relevance ?? e.track_relevance_score ?? 0),
        presentation_score: Number(e.presentation_clarity ?? e.presentation_score ?? 0),
        total_score: Number(e.total_score ?? 0),
        comments: e.feedback || e.comments || "",
        status: e.status || "submitted",
        created_at: e.created_at,
        updated_at: e.updated_at,
      };
      evalMap.set(e.submission_id, mappedEval);
    });

    // 5. Fetch team members for context
    const { data: allMembers } = await supabase
      .from("team_members")
      .select("team_id, profiles(full_name, email, role)");

    const membersMap = new Map<string, Array<{ full_name: string; email: string; role: string }>>();
    (allMembers || []).forEach((m: any) => {
      const list = membersMap.get(m.team_id) || [];
      if (m.profiles) {
        list.push({
          full_name: m.profiles.full_name,
          email: m.profiles.email,
          role: m.profiles.role,
        });
      }
      membersMap.set(m.team_id, list);
    });

    const result: JudgeSubmissionView[] = [];

    for (const sub of rawSubmissions) {
      const team = teamMap.get(sub.team_id) || {
        id: sub.team_id,
        team_name: "Squad #" + sub.team_id.slice(0, 8),
        team_code: "N/A",
        theme_id: "general",
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

      const existingEval = evalMap.get(sub.id) || null;
      const isEvaluated = existingEval && existingEval.status === "submitted";

      // Apply Status Filter
      if (statusFilter === "pending" && isEvaluated) continue;
      if (statusFilter === "evaluated" && !isEvaluated) continue;

      const teamMembers = membersMap.get(team.id) || [];

      result.push({
        submission_id: sub.id,
        team_id: team.id,
        team_name: team.team_name,
        team_code: team.team_code,
        theme_id: themeId,
        theme_name: themeName,
        file_name: sub.file_name || sub.original_filename || "Round1_Submission.pptx",
        file_path: sub.file_path,
        file_size: Number(sub.file_size || 0),
        submitted_at: sub.submitted_at || new Date().toISOString(),
        members_count: teamMembers.length,
        members: teamMembers,
        evaluation: existingEval,
      });
    }

    return { submissions: result };
  } catch (err: any) {
    console.error("getSubmissionsForJudge unexpected error:", err);
    return { submissions: [], error: err.message || "Failed to load submissions for evaluation." };
  }
}

// 2. Save Draft or Submit Final Evaluation to round1_evaluations
export async function saveJudgeEvaluation(
  evaluation: Evaluation
): Promise<{ success: boolean; evaluation?: Evaluation; error?: string }> {
  try {
    // Clamp scores safely to criteria maximums
    const creativity = Math.min(35, Math.max(0, Number(evaluation.creativity_score || 0)));
    const businessProblem = Math.min(15, Math.max(0, Number(evaluation.business_problem_score || 0)));
    const technology = Math.min(15, Math.max(0, Number(evaluation.technology_score || 0)));
    const feasibility = Math.min(10, Math.max(0, Number(evaluation.feasibility_score || 0)));
    const impact = Math.min(10, Math.max(0, Number(evaluation.impact_score || 0)));
    const trackRelevance = Math.min(10, Math.max(0, Number(evaluation.track_relevance_score || 0)));
    const presentation = Math.min(5, Math.max(0, Number(evaluation.presentation_score || 0)));

    const calculatedTotal = Number(
      (creativity + businessProblem + technology + feasibility + impact + trackRelevance + presentation).toFixed(2)
    );

    const payload = {
      submission_id: evaluation.submission_id,
      team_id: evaluation.team_id,
      judge_id: evaluation.judge_id,
      creativity_innovation: creativity,
      creativity_score: creativity,
      business_relevance: businessProblem,
      business_problem_score: businessProblem,
      ai_technology: technology,
      technology_score: technology,
      feasibility_execution: feasibility,
      feasibility_score: feasibility,
      business_impact_scalability: impact,
      impact_score: impact,
      track_relevance: trackRelevance,
      track_relevance_score: trackRelevance,
      presentation_clarity: presentation,
      presentation_score: presentation,
      total_score: calculatedTotal,
      feedback: evaluation.comments || "",
      comments: evaluation.comments || "",
      status: evaluation.status || "submitted",
      updated_at: new Date().toISOString(),
    };

    // Primary upsert to round1_evaluations
    let { data, error } = await supabase
      .from("round1_evaluations")
      .upsert(payload, { onConflict: "submission_id,judge_id" })
      .select()
      .maybeSingle();

    if (error) {
      console.warn("round1_evaluations upsert warning (trying legacy evaluations table):", error.message);
      // Fallback to legacy evaluations table
      const fallback = await supabase
        .from("evaluations")
        .upsert(payload, { onConflict: "submission_id,judge_id" })
        .select()
        .maybeSingle();

      data = fallback.data;
      error = fallback.error;
    }

    if (error) {
      console.error("Evaluation save error:", error);
      return { success: false, error: error.message };
    }

    const savedEval: Evaluation = {
      id: data?.id,
      submission_id: evaluation.submission_id,
      team_id: evaluation.team_id,
      judge_id: evaluation.judge_id,
      creativity_score: creativity,
      business_problem_score: businessProblem,
      technology_score: technology,
      feasibility_score: feasibility,
      impact_score: impact,
      track_relevance_score: trackRelevance,
      presentation_score: presentation,
      total_score: calculatedTotal,
      comments: evaluation.comments || "",
      status: evaluation.status || "submitted",
    };

    return { success: true, evaluation: savedEval };
  } catch (err: any) {
    console.error("saveJudgeEvaluation error:", err);
    return { success: false, error: err.message || "Failed to save evaluation." };
  }
}
