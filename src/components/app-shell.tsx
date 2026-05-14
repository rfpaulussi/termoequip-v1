import { getCurrentProfile } from '@/lib/auth/profile'
import Sidebar from './sidebar'

export default async function AppShell({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile()

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      <Sidebar role={profile?.role ?? undefined} fullName={profile?.full_name ?? undefined} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
