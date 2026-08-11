import { supabase } from "./supabase/client";

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  usn?: string;
  branch?: string;
  semester?: string;
  role: "student" | "judge" | "admin";
}

export interface ThemeTrack {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
}

export interface Team {
  id: string;
  team_code: string;
  team_name: string;
  leader_id: string;
  theme_id?: string;
  status: string;
  created_at?: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  member_role: "leader" | "member";
  profile?: Profile;
}

export interface HackathonSettings {
  registration_open: boolean;
  registration_deadline: string;
  min_team_size: number;
  max_team_size: number;
}

// Default 6 Theme Tracks
export const THEME_TRACKS: ThemeTrack[] = [
  {
    id: "track-1",
    name: "01 — RETAIL & REAL ESTATE",
    slug: "retail-real-estate",
    description: "Augmented Shopping & Spatial Commerce",
    image_url: "/New_images/Retail.png",
  },
  {
    id: "track-2",
    name: "02 — FINANCE & INVESTMENTS",
    slug: "finance-investments",
    description: "Decentralized Wealth & Smart Fintech",
    image_url: "/New_images/finance.png",
  },
  {
    id: "track-3",
    name: "03 — HEALTH & WELLNESS",
    slug: "health-wellness",
    description: "Biotech Signals & Preventive Care",
    image_url: "/New_images/health.png",
  },
  {
    id: "track-4",
    name: "04 — TRAVEL & FOOD",
    slug: "travel-food",
    description: "Autonomous Expeditions & Ghost Kitchens",
    image_url: "/New_images/travel.png",
  },
  {
    id: "track-5",
    name: "05 — SPORTS & FITNESS",
    slug: "sports-fitness",
    description: "Kinetic Performance & Fan Immersion",
    image_url: "/New_images/sports.png",
  },
  {
    id: "track-6",
    name: "06 — MUSIC & OTT",
    slug: "music-ott",
    description: "Sonic Generative Media & Streaming",
    image_url: "/New_images/music.png",
  },
];

// Helper: Generate unique team code (e.g. MIRA26-A7K9)
export function generateTeamCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "MIRA26-";
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// 1. Fetch Hackathon Settings from Remote Supabase Database
export async function getHackathonSettings(): Promise<HackathonSettings> {
  try {
    const { data, error } = await supabase
      .from("hackathon_settings")
      .select("*")
      .limit(1)
      .single();

    if (data && !error) {
      return {
        registration_open: data.registration_open ?? true,
        registration_deadline: data.registration_deadline || new Date(Date.now() + 30 * 86400000).toISOString(),
        min_team_size: data.min_team_size || 1,
        max_team_size: data.max_team_size || 4,
      };
    }
  } catch (err) {
    // Return default if table not yet initialized
  }

  return {
    registration_open: true,
    registration_deadline: new Date(Date.now() + 30 * 86400000).toISOString(),
    min_team_size: 1,
    max_team_size: 4,
  };
}

// 2. REAL Supabase Student Sign Up (NO email verification required)
export async function signUpStudent(
  fullName: string,
  email: string,
  pass: string
): Promise<{ user: any; profile: Profile | null; error?: string }> {
  try {
    // Server-side / Database check: verify registration is open
    const settings = await getHackathonSettings();
    if (!settings.registration_open) {
      return { user: null, profile: null, error: "Registrations for Miraethon 2026 are closed." };
    }

    // REAL Supabase Auth SignUp Call
    const { data: authData, error: authErr } = await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: { full_name: fullName },
      },
    });

    if (authErr) {
      return { user: null, profile: null, error: authErr.message };
    }

    const user = authData.user;
    if (!user) {
      return { user: null, profile: null, error: "Failed to create account in Supabase Auth." };
    }

    const newProfile: Profile = {
      id: user.id,
      full_name: fullName,
      email,
      role: "student", // Strictly enforced student role
    };

    // Upsert into remote public.profiles table
    const { error: profErr } = await supabase.from("profiles").upsert(newProfile);
    if (profErr) {
      console.warn("Profile table insert notice:", profErr.message);
    }

    // Check if we got a session (email confirmation must be OFF for immediate login)
    if (!authData.session) {
      // Account was created but email confirmation is still enabled in Supabase.
      // The user is in auth.users but cannot log in until they verify email.
      return {
        user: null,
        profile: null,
        error:
          "Your account was created, but email confirmation is currently enabled on the platform. " +
          "Please ask your organizer to disable 'Confirm email' in the Supabase Dashboard " +
          "(Authentication → Providers → Email → toggle OFF 'Confirm email'). " +
          "Once disabled, try registering again with a new email.",
      };
    }

    return { user, profile: newProfile };
  } catch (err: any) {
    return { user: null, profile: null, error: err.message || "An unexpected error occurred during signup." };
  }
}

// 3. REAL Supabase Student Sign In
export async function signInStudent(
  email: string,
  pass: string
): Promise<{ user: any; profile: Profile | null; error?: string }> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });

    if (error) {
      return { user: null, profile: null, error: "Incorrect email or password." };
    }

    const user = data.user;
    if (!user) return { user: null, profile: null, error: "User session not found." };

    // Fetch profile from remote Supabase table
    const { data: profData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    const profile: Profile = profData || {
      id: user.id,
      full_name: user.user_metadata?.full_name || email.split("@")[0],
      email: user.email || email,
      role: "student",
    };

    return { user, profile };
  } catch (err: any) {
    return { user: null, profile: null, error: err.message || "Login failed." };
  }
}

// 4. REAL Supabase Create Team
export async function createTeam(
  leaderId: string,
  teamName: string,
  themeId: string
): Promise<{ team: Team | null; error?: string }> {
  try {
    // Check registration deadline
    const settings = await getHackathonSettings();
    if (!settings.registration_open) {
      return { team: null, error: "Registrations are closed. New teams cannot be created." };
    }

    // Check if user is already in a team
    const { data: existingMember } = await supabase
      .from("team_members")
      .select("team_id")
      .eq("user_id", leaderId)
      .single();

    if (existingMember) {
      return { team: null, error: "You are already part of a team." };
    }

    const teamCode = generateTeamCode();

    const { data: teamData, error: teamErr } = await supabase
      .from("teams")
      .insert({
        team_code: teamCode,
        team_name: teamName,
        leader_id: leaderId,
        theme_id: themeId,
        status: "registered",
      })
      .select()
      .single();

    if (teamErr) {
      if (teamErr.message.includes("team_name") || teamErr.code === "23505") {
        return { team: null, error: "Team name already taken. Please choose another." };
      }
      return { team: null, error: teamErr.message };
    }

    // Insert Leader as first member with member_role = 'leader'
    await supabase.from("team_members").insert({
      team_id: teamData.id,
      user_id: leaderId,
      member_role: "leader",
    });

    return { team: teamData };
  } catch (err: any) {
    return { team: null, error: err.message || "Failed to create team in Supabase." };
  }
}

// 5. REAL Supabase Join Team by Team Code
export async function joinTeamByCode(
  userId: string,
  code: string
): Promise<{ team: Team | null; memberCount: number; error?: string }> {
  try {
    const cleanCode = code.trim().toUpperCase();

    // Check registration deadline
    const settings = await getHackathonSettings();
    if (!settings.registration_open) {
      return { team: null, memberCount: 0, error: "Registrations are closed." };
    }

    // Check if user is already in a team
    const { data: existingMember } = await supabase
      .from("team_members")
      .select("team_id")
      .eq("user_id", userId)
      .single();

    if (existingMember) {
      return { team: null, memberCount: 0, error: "You are already part of a team." };
    }

    // Find team by code
    const { data: team, error: teamErr } = await supabase
      .from("teams")
      .select("*")
      .eq("team_code", cleanCode)
      .single();

    if (teamErr || !team) {
      return { team: null, memberCount: 0, error: "Team not found. Check the code and try again." };
    }

    // Check current member count
    const { data: members } = await supabase
      .from("team_members")
      .select("id")
      .eq("team_id", team.id);

    const count = members?.length || 0;
    if (count >= 4) {
      return { team: null, memberCount: count, error: "This team has reached the maximum team size (4 members)." };
    }

    // Join team
    const { error: joinErr } = await supabase.from("team_members").insert({
      team_id: team.id,
      user_id: userId,
      member_role: "member",
    });

    if (joinErr) {
      return { team: null, memberCount: count, error: joinErr.message };
    }

    return { team, memberCount: count + 1 };
  } catch (err: any) {
    return { team: null, memberCount: 0, error: err.message || "Failed to join team in Supabase." };
  }
}

// 6. REAL Supabase Get Team Details for User
export async function getUserTeam(userId: string): Promise<{
  team: Team | null;
  members: (TeamMember & { profile: Profile })[];
  theme?: ThemeTrack;
  error?: string;
}> {
  try {
    const { data: membership } = await supabase
      .from("team_members")
      .select("team_id")
      .eq("user_id", userId)
      .single();

    if (!membership) {
      return { team: null, members: [] };
    }

    const { data: team } = await supabase
      .from("teams")
      .select("*")
      .eq("id", membership.team_id)
      .single();

    if (!team) return { team: null, members: [] };

    const { data: membersData } = await supabase
      .from("team_members")
      .select("*, profiles(*)")
      .eq("team_id", team.id);

    const members = (membersData || []).map((m: any) => ({
      id: m.id,
      team_id: m.team_id,
      user_id: m.user_id,
      member_role: m.member_role,
      profile: m.profiles || {
        id: m.user_id,
        full_name: "Team Member",
        email: "member@miraethon.com",
        role: "student",
      },
    }));

    const theme = THEME_TRACKS.find((t) => t.id === team.theme_id || t.slug === team.theme_id);

    return { team, members, theme };
  } catch (err: any) {
    return { team: null, members: [], error: err.message };
  }
}
