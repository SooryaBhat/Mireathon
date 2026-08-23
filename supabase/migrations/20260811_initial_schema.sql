-- Miraethon 2026 Initial Supabase Database Migration Schema

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  usn TEXT,
  branch TEXT,
  semester TEXT,
  role TEXT DEFAULT 'student' CHECK (role IN ('student', 'judge', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read profiles" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id AND role = 'student');

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. AUTOMATIC PROFILE TRIGGER ON AUTH SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Student User'),
    NEW.email,
    'student' -- Mandatory role student
  )
  ON CONFLICT (id) DO UPDATE
  SET full_name = EXCLUDED.full_name,
      email = EXCLUDED.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. THEMES TABLE (6 Tracks)
CREATE TABLE IF NOT EXISTS public.themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.themes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active themes" ON public.themes
  FOR SELECT USING (is_active = true);

-- Seed Data for 6 Tracks
INSERT INTO public.themes (name, slug, description, image_url) VALUES
('01 — RETAIL & REAL ESTATE', 'retail-real-estate', 'Augmented Shopping & Spatial Commerce', '/New_images/Retail.png'),
('02 — FINANCIAL & INVESTMENTS', 'financial-investments', 'Decentralized Wealth & Smart Fintech', '/New_images/finance.png'),
('03 — HEALTH & WELLNESS', 'health-wellness', 'Biotech Signals & Preventive Care', '/New_images/health.png'),
('04 — TRAVEL & FOOD', 'travel-food', 'Autonomous Expeditions & Ghost Kitchens', '/New_images/travel.png'),
('05 — SPORTS & FITNESS', 'sports-fitness', 'Kinetic Performance & Fan Immersion', '/New_images/sports.png'),
('06 — MUSIC & OTT', 'music-ott', 'Sonic Generative Media & Streaming', '/New_images/music.png')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    description = EXCLUDED.description,
    image_url = EXCLUDED.image_url;

-- 4. TEAMS TABLE
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_code TEXT UNIQUE NOT NULL,
  team_name TEXT UNIQUE NOT NULL,
  leader_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  theme_id UUID REFERENCES public.themes(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'registered',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read teams" ON public.teams
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create teams" ON public.teams
  FOR INSERT WITH CHECK (auth.uid() = leader_id);

CREATE POLICY "Team leader can update team" ON public.teams
  FOR UPDATE USING (auth.uid() = leader_id);

-- 5. TEAM MEMBERS TABLE (A student belongs to at most ONE team)
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  member_role TEXT DEFAULT 'member' CHECK (member_role IN ('leader', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read team members" ON public.team_members
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can join team" ON public.team_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Team leader can delete team members" ON public.team_members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.teams
      WHERE teams.id = team_members.team_id AND teams.leader_id = auth.uid()
    ) OR auth.uid() = user_id
  );

-- 6. HACKATHON SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.hackathon_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_open BOOLEAN DEFAULT true,
  registration_deadline TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
  min_team_size INT DEFAULT 1,
  max_team_size INT DEFAULT 4,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.hackathon_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read hackathon settings" ON public.hackathon_settings
  FOR SELECT USING (true);

-- Insert Default Hackathon Setting Row if empty
INSERT INTO public.hackathon_settings (registration_open, min_team_size, max_team_size)
SELECT true, 1, 4
WHERE NOT EXISTS (SELECT 1 FROM public.hackathon_settings);

-- 7. SUBMISSIONS TABLE (Round 1 Submission Preparation)
CREATE TABLE IF NOT EXISTS public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID UNIQUE NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  title TEXT,
  problem_statement TEXT,
  solution TEXT,
  ai_usage TEXT,
  business_impact TEXT,
  file_path TEXT,
  file_name TEXT,
  file_size BIGINT,
  status TEXT DEFAULT 'draft',
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can read own submission" ON public.submissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_members.team_id = submissions.team_id AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Team leader can create/update submission" ON public.submissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.teams
      WHERE teams.id = submissions.team_id AND teams.leader_id = auth.uid()
    )
  );
