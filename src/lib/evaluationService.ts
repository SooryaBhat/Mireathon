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

// 1. Fetch All Submissions for Judge Evaluation via Server API
export async function getSubmissionsForJudge(
  judgeId: string,
  trackFilter: string = "all",
  statusFilter: string = "all"
): Promise<{ submissions: JudgeSubmissionView[]; error?: string }> {
  try {
    const query = new URLSearchParams({
      judgeId,
      track: trackFilter,
      status: statusFilter,
    });

    const resp = await fetch(`/api/judge/submissions?${query.toString()}`, {
      method: "GET",
    });

    if (resp.ok) {
      const data = await resp.json();
      return { submissions: data.submissions || [] };
    } else {
      const errData = await resp.json();
      return { submissions: [], error: errData.error || "Server error fetching judge submissions" };
    }
  } catch (err: any) {
    console.error("getSubmissionsForJudge fetch error:", err);
    return { submissions: [], error: err.message || "Network error fetching judge submissions" };
  }
}

// 2. Save Draft or Submit Final Evaluation to round1_evaluations via Server API
export async function saveJudgeEvaluation(
  evaluation: Evaluation
): Promise<{ success: boolean; evaluation?: Evaluation; error?: string }> {
  try {
    const resp = await fetch("/api/judge/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(evaluation),
    });

    const resData = await resp.json();

    if (!resp.ok || !resData.success) {
      return {
        success: false,
        error: resData.error || "Failed to save evaluation to server.",
      };
    }

    return { success: true, evaluation: resData.evaluation as Evaluation };
  } catch (err: any) {
    console.error("saveJudgeEvaluation network error:", err);
    return { success: false, error: err.message || "Failed to submit evaluation." };
  }
}
