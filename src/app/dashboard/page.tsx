import Link from 'next/link'
import LogoutButton from '@/components/logout-button'
import { getCurrentProfile } from '@/lib/auth/profile'

function roleLabel(role: string | null | undefined) {
  switch (role) {
    case 'admin':
      return 'Admin'
    case 'supervisor':
      return 'Supervisor'
    case 'encarregado':
      return 'Encarregado'
    default:
      return 'Sem perfil'
  }
}

export default async function DashboardPage() {
  const profile = await getCurrentProfile()

  return (
    <main className="min-h-screen bg-green-50 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-green-700">Dashboard</h1>
            <p className="mt-2 text-black">
              Painel principal para acesso rápido às áreas mais importantes do TermoEquip.
            </p>
            <div className="mt-3 inline-flex rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800">
              Perfil: {roleLabel(profile?.role)}
            </div>
          </div>

          <LogoutButton />
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <Link
            href="/termos/novo"
            className="rounded-2xl border border-green-200 bg-white p-6 shadow-sm transition hover:border-green-400 hover:shadow-md"
          >
            <div className="mb-3 text-3xl">📝</div>
            <h2 className="text-xl font-semibold text-green-700">Novo termo</h2>
            <p className="mt-2 text-sm text-black">
              Cadastrar um novo termo de responsabilidade.
            </p>
          </Link>

          <Link
            href="/termos"
            className="rounded-2xl border border-green-200 bg-white p-6 shadow-sm transition hover:border-green-400 hover:shadow-md"
          >
            <div className="mb-3 text-3xl">📚</div>
            <h2 className="text-xl font-semibold text-green-700">Histórico</h2>
            <p className="mt-2 text-sm text-black">
              Consultar os termos já registrados no sistema.
            </p>
          </Link>

          <div className="rounded-2xl border border-green-200 bg-white p-6 shadow-sm">
            <div className="mb-3 text-3xl">🔐</div>
            <h2 className="text-xl font-semibold text-green-700">Permissões</h2>
            <p className="mt-2 text-sm text-black">
              Usuário de campo pode cadastrar, registrar devolução e manutenção.
              Admin também pode excluir termos.
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-green-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-green-700">Status atual</h3>
          <p className="mt-2 text-black">
            O app já possui login, proteção de rotas, perfis, cadastro, histórico e
            base para manutenção e devolução pelo Supabase.
          </p>
        </div>
      </div>
    </main>
  )
}
