import { createClient } from "@supabase/supabase-js";

// Server-only client using the service-role key. The guests table has RLS
// enabled with no anon policies, so this is the only way in or out of the DB.
// Never import this file from a client component.
export function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local"
    );
  }
  return createClient(url, key, { auth: { persistSession: false } });
}
