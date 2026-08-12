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
    // Query submissions joined with teams, themes, and evaluations
    const { data: rawSubmissions, error: subErr } = await supabase
      .from("submissions")
      .select(`
        id,
        team_id,
        file_name,
        file_path,
        file_size,
        submitted_at,
        teams (
          id,
          team_name,
          team_code,
          theme_id,
          themes (
            id,
            name,
            slug
          )
        )
      `)
      .order("submitted_at", { ascending: false });

    if (subErr) {
      console.error("Judge submissions fetch error:", subErr);
      return { submissions: [], error: subErr.message };
    }

    if (!rawSubmissions || rawSubmissions.length === 0) {
      return { submissions: [] };
    }

    // Fetch existing evaluations by this judge
    const { data: evaluations } = await supabase
      .from("evaluations")
      .select("*")
      .eq("judge_id", judgeId);

    const evalMap = new Map<string, Evaluation>();
    (evaluations || []).forEach((e: any) => {
      evalMap.set(e.submission_id, e as Evaluation);
    });

    // Fetch team members for context
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
      const team = sub.teams as any;
      if (!team) continue;

      const themeName = team.themes?.name || "General Track";
      const themeSlug = team.themes?.slug || "";
      const themeId = team.theme_id || "";

      // Apply Track Filter
      if (trackFilter !== "all") {
        if (themeId !== trackFilter && themeSlug !== trackFilter && !themeName.toLowerCase().includes(trackFilter.toLowerCase())) {
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
        file_name: sub.file_name,
        file_path: sub.file_path,
        file_size: Number(sub.file_size || 0),
        submitted_at: sub.submitted_at,
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

// 2. Save Draft or Submit Final Evaluation
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
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("evaluations")
      .upsert(payload, { onConflict: "submission_id,judge_id" })
      .select()
      .single();

    if (error) {
      console.error("Evaluation save error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, evaluation: data as Evaluation };
  } catch (err: any) {
    console.error("saveJudgeEvaluation error:", err);
    return { success: false, error: err.message || "Failed to save evaluation." };
  }
}
