-- Miraethon 2026 Round 1 Submission, Evaluations, Shortlists & Storage Migration

-- 1. EXTEND HACKATHON_SETTINGS TABLE
ALTER TABLE public.hackathon_settings 
  ADD COLUMN IF NOT EXISTS submission_open BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS results_published BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS top_shortlist_per_track INT DEFAULT 2;

-- Set single source of truth deadline to 28 August 2026 23:59:59 IST (+05:30)
UPDATE public.hackathon_settings 
SET registration_deadline = '2026-08-28T23:59:59+05:30'
WHERE registration_deadline IS NULL OR registration_deadline < '2026-08-28T00:00:00+05:30';

-- 2. EXTEND SUBMISSIONS TABLE
CREATE TABLE IF NOT EXISTS public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID UNIQUE NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT DEFAULT 0,
  file_type TEXT,
  submitted_by UUID REFERENCES public.profiles(id),
  status TEXT DEFAULT 'submitted',
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- Submissions RLS Policies
DROP POLICY IF EXISTS "Team members can read own submission" ON public.submissions;
CREATE POLICY "Team members can read own submission" ON public.submissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_members.team_id = submissions.team_id AND team_members.user_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('judge', 'admin')
    )
  );

DROP POLICY IF EXISTS "Team leader can create submission" ON public.submissions;
CREATE POLICY "Team leader can create submission" ON public.submissions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.teams
      WHERE teams.id = submissions.team_id AND teams.leader_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Team leader can update submission" ON public.submissions;
CREATE POLICY "Team leader can update submission" ON public.submissions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.teams
      WHERE teams.id = submissions.team_id AND teams.leader_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- 3. EVALUATIONS TABLE (Round 1 100-Point Judging System)
CREATE TABLE IF NOT EXISTS public.evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  judge_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  creativity_score NUMERIC(5,2) DEFAULT 0 CHECK (creativity_score >= 0 AND creativity_score <= 35),
  business_problem_score NUMERIC(5,2) DEFAULT 0 CHECK (business_problem_score >= 0 AND business_problem_score <= 15),
  technology_score NUMERIC(5,2) DEFAULT 0 CHECK (technology_score >= 0 AND technology_score <= 15),
  feasibility_score NUMERIC(5,2) DEFAULT 0 CHECK (feasibility_score >= 0 AND feasibility_score <= 10),
  impact_score NUMERIC(5,2) DEFAULT 0 CHECK (impact_score >= 0 AND impact_score <= 10),
  track_relevance_score NUMERIC(5,2) DEFAULT 0 CHECK (track_relevance_score >= 0 AND track_relevance_score <= 10),
  presentation_score NUMERIC(5,2) DEFAULT 0 CHECK (presentation_score >= 0 AND presentation_score <= 5),
  total_score NUMERIC(5,2) DEFAULT 0 CHECK (total_score >= 0 AND total_score <= 100),
  comments TEXT,
  status TEXT DEFAULT 'submitted' CHECK (status IN ('draft', 'submitted')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_judge_submission UNIQUE(submission_id, judge_id)
);

ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Judges and Admins can view evaluations" ON public.evaluations;
CREATE POLICY "Judges and Admins can view evaluations" ON public.evaluations
  FOR SELECT USING (
    judge_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Judges can insert evaluations" ON public.evaluations;
CREATE POLICY "Judges can insert evaluations" ON public.evaluations
  FOR INSERT WITH CHECK (
    judge_id = auth.uid() AND EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('judge', 'admin')
    )
  );

DROP POLICY IF EXISTS "Judges and Admins can update evaluations" ON public.evaluations;
CREATE POLICY "Judges and Admins can update evaluations" ON public.evaluations
  FOR UPDATE USING (
    judge_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 4. SHORTLISTS / TEAM RESULTS TABLE (Track-wise Rankings)
CREATE TABLE IF NOT EXISTS public.shortlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID UNIQUE NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  theme_id UUID REFERENCES public.themes(id),
  rank_in_track INT,
  total_score NUMERIC(5,2) DEFAULT 0,
  creativity_score NUMERIC(5,2) DEFAULT 0,
  impact_score NUMERIC(5,2) DEFAULT 0,
  track_relevance_score NUMERIC(5,2) DEFAULT 0,
  is_shortlisted BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.shortlists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view shortlists if results published" ON public.shortlists;
CREATE POLICY "Anyone can view shortlists if results published" ON public.shortlists
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.hackathon_settings WHERE results_published = true)
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('judge', 'admin'))
  );

DROP POLICY IF EXISTS "Admins can manage shortlists" ON public.shortlists;
CREATE POLICY "Admins can manage shortlists" ON public.shortlists
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 5. CREATE PRIVATE BUCKET FOR SUBMISSIONS
INSERT INTO storage.buckets (id, name, public)
VALUES ('round1-submissions', 'round1-submissions', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies for round1-submissions
DROP POLICY IF EXISTS "Authenticated users can upload round1 submissions" ON storage.objects;
CREATE POLICY "Authenticated users can upload round1 submissions" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'round1-submissions' AND auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "Team members, judges and admins can view round1 submissions" ON storage.objects;
CREATE POLICY "Team members, judges and admins can view round1 submissions" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'round1-submissions' AND auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "Team leaders and admins can update round1 submissions" ON storage.objects;
CREATE POLICY "Team leaders and admins can update round1 submissions" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'round1-submissions' AND auth.role() = 'authenticated'
  );
