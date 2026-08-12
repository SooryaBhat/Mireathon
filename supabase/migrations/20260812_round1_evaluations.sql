-- Miraethon 2026 Round 1 Evaluations & RLS Security Migration

-- 1. CREATE ROUND1_EVALUATIONS TABLE
CREATE TABLE IF NOT EXISTS public.round1_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  judge_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  creativity_innovation INT NOT NULL DEFAULT 0 CHECK (creativity_innovation >= 0 AND creativity_innovation <= 35),
  business_relevance INT NOT NULL DEFAULT 0 CHECK (business_relevance >= 0 AND business_relevance <= 15),
  ai_technology INT NOT NULL DEFAULT 0 CHECK (ai_technology >= 0 AND ai_technology <= 15),
  feasibility_execution INT NOT NULL DEFAULT 0 CHECK (feasibility_execution >= 0 AND feasibility_execution <= 10),
  business_impact_scalability INT NOT NULL DEFAULT 0 CHECK (business_impact_scalability >= 0 AND business_impact_scalability <= 10),
  track_relevance INT NOT NULL DEFAULT 0 CHECK (track_relevance >= 0 AND track_relevance <= 10),
  presentation_clarity INT NOT NULL DEFAULT 0 CHECK (presentation_clarity >= 0 AND presentation_clarity <= 5),
  total_score INT NOT NULL DEFAULT 0 CHECK (total_score >= 0 AND total_score <= 100),
  feedback TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_judge_submission UNIQUE(submission_id, judge_id)
);

-- Enable RLS
ALTER TABLE public.round1_evaluations ENABLE ROW LEVEL SECURITY;

-- 2. ENSURE RLS POLICIES ON SUBMISSIONS FOR ADMIN & JUDGES
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Team members, judges and admins can view submissions" ON public.submissions;
CREATE POLICY "Team members, judges and admins can view submissions" ON public.submissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_members.team_id = submissions.team_id AND team_members.user_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('judge', 'admin')
    )
  );

DROP POLICY IF EXISTS "Team leaders and admins can insert submissions" ON public.submissions;
CREATE POLICY "Team leaders and admins can insert submissions" ON public.submissions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.teams
      WHERE teams.id = submissions.team_id AND teams.leader_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Team leaders and admins can update submissions" ON public.submissions;
CREATE POLICY "Team leaders and admins can update submissions" ON public.submissions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.teams
      WHERE teams.id = submissions.team_id AND teams.leader_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- RLS Policies on round1_evaluations
DROP POLICY IF EXISTS "Judges and admins can view evaluations" ON public.round1_evaluations;
CREATE POLICY "Judges and admins can view evaluations" ON public.round1_evaluations
  FOR SELECT USING (
    judge_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('judge', 'admin')
    )
  );

DROP POLICY IF EXISTS "Judges and admins can insert evaluations" ON public.round1_evaluations;
CREATE POLICY "Judges and admins can insert evaluations" ON public.round1_evaluations
  FOR INSERT WITH CHECK (
    judge_id = auth.uid() AND EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('judge', 'admin')
    )
  );

DROP POLICY IF EXISTS "Judges and admins can update evaluations" ON public.round1_evaluations;
CREATE POLICY "Judges and admins can update evaluations" ON public.round1_evaluations
  FOR UPDATE USING (
    judge_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('judge', 'admin')
    )
  );
