// src/app/admin-login/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const router = useRouter()

  const handleLogin = async () => {
    const res = await fetch('/api/admin-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    if (res.ok) {
      router.push('/admin')
    } else {
      setError(true)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-8 w-full max-w-sm">
        <h1 className="text-white text-2xl font-bold mb-6 text-center">
          🔒 Admin Access
        </h1>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          placeholder="Enter password..."
          className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 
                     text-white placeholder-zinc-500 focus:outline-none 
                     focus:border-purple-500 mb-4"
        />

        {error && (
          <p className="text-red-400 text-sm mb-4 text-center">
            ❌ Wrong password!
          </p>
        )}

        <button
          onClick={handleLogin}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white 
                     font-bold py-3 rounded-xl transition"
        >
          Login
        </button>
      </div>
    </div>
  )
}