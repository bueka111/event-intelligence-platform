import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser-Client fuer Client Components. Nutzt nur den public anon key.
 */
export function getSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
