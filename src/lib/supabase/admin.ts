import { createClient } from '@supabase/supabase-js';

// SERVER-ONLY ADMIN CLIENT
// Uses SUPABASE_SERVICE_ROLE_KEY for trusted elevated backend operations.
// WARNING: NEVER IMPORT THIS FILE IN CLIENT COMPONENTS OR BROWSER CODE!

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-role-key';

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
