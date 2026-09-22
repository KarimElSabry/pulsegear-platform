// src/app/auth/callback/page.tsx

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/supabase'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createBrowserSupabaseClient()

    async function handleAuth() {
      try {
        await supabase.auth.getSession()
      } finally {
        router.replace('/account')
      }
    }

    handleAuth()
  }, [router])

  return (
    <main className="min-h-screen bg-zinc-950 flex items-center justify-center px-6">
      <div className="text-center">
        <h1 className="text-2xl font-black text-white">Signing you in...</h1>
        <p className="text-zinc-400 mt-3 text-sm">
          Please wait while we confirm your account.
        </p>
      </div>
    </main>
  )
}