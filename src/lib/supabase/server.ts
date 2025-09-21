import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url) {
  console.warn('[supabase] Missing NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL)');
}
if (!serviceRole) {
  console.warn('[supabase] Missing SUPABASE_SERVICE_ROLE (or SUPABASE_SERVICE_ROLE_KEY)');
}

export const supabaseAdmin = url && serviceRole
  ? createClient(url, serviceRole, { auth: { persistSession: false } })
  : null as unknown as ReturnType<typeof createClient>;
