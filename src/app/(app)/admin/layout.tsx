import { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { getCurrentProfile } from '@/lib/auth/profile'

export default async function AdminLayout({
  children,
}: {
  children: ReactNode
}) {
  const profile = await getCurrentProfile()

  if (!profile || (profile.role !== 'superadmin' && profile.role !== 'admin')) {
    redirect('/dashboard')
  }

  return <>{children}</>
}
