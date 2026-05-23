import { createBrowserClient } from '@supabase/ssr'

let client: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    // Return null during build/SSR when env vars may not be available
    // Components should handle null client gracefully
    console.warn('[Supabase] Environment variables not yet available')
    return null as unknown as ReturnType<typeof createBrowserClient>
  }

  // Use singleton pattern to prevent multiple clients
  if (!client) {
    client = createBrowserClient(supabaseUrl, supabaseAnonKey)
  }

  return client
}
