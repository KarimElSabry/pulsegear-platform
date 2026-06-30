import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// ✅ Client-side — للـ Browser Components
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ✅ Server-side — للـ Server Components و API Routes فقط
// بيستخدم Service Role Key = يعدي على RLS
export const createServerClient = () =>
  createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })