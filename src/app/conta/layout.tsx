import { ReactNode } from 'react'
import { requireUser } from '@/lib/auth/require-user'

export default async function ContaLayout({
  children,
}: {
  children: ReactNode
}) {
  await requireUser()
  return <>{children}</>
}
