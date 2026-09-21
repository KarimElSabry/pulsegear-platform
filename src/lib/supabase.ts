// src/lib/supabase.ts

import { cookies } from 'next/headers'
import { createServerClient as createSSRServerClient, type CookieOptions } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set')
}

if (!supabaseAnonKey) {
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set')
}

export function createBrowserSupabaseClient() {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey)
}

export async function createServerSupabaseClient() {
  const cookieStore = await cookies()

  return createSSRServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(_name: string, _value: string, _options: CookieOptions) {
        // no-op here
      },
      remove(_name: string, _options: CookieOptions) {
        // no-op here
      },
    },
  })
}

export function createAdminSupabaseClient() {
  if (!supabaseServiceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')
  }

  return createSupabaseClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}