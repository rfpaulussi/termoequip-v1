import { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { getCurrentProfile } from '@/lib/auth/profile'

export default async function AuditoriaLayout({
  children,
}: {
  children: ReactNode
}) {
  const profile = await getCurrentProfile()

  if (!profile || profile.role !== 'admin') {
    redirect('/dashboard')
  }

  return <>{children}</>
}
