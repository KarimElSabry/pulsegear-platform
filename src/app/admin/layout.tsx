// src/app/admin/layout.tsx

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import AdminNav from './AdminNav'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_token')?.value
  if (token !== process.env.ADMIN_SECRET) redirect('/admin-login')

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <AdminNav />
      {children}
    </div>
  )
}