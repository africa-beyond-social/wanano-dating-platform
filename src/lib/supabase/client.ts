import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error("WANANO authentication is not configured yet. Add the Supabase URL and publishable key to the Vercel environment variables.");
  }

  return createBrowserClient(url, key);
}
