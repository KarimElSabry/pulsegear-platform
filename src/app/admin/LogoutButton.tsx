// src/app/admin/LogoutButton.tsx
'use client'

import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/admin-logout', { method: 'POST' })
    router.push('/admin-login')
  }

  return (
    <button
      onClick={handleLogout}
      className="text-red-400 hover:text-red-300 text-sm transition"
    >
      🚪 Logout
    </button>
  )
}