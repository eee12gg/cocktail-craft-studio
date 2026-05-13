/**
 * Public (read-only) Supabase client.
 *
 * Created without auth persistence / session locks — used for all
 * public data reads to avoid the GoTrue auth lock that can stall
 * `from().select()` calls when the auth client is initializing.
 *
 * Use the regular `client.ts` only for auth flows and admin writes.
 */
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabasePublic = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});
