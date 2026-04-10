import Link from 'next/link'
import LogoutButton from '@/components/logout-button'

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-green-50 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-green-700">Dashboard</h1>
            <p className="mt-2 text-black">
              Painel principal do TermoEquip.
            </p>
          </div>

          <LogoutButton />
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <Link
            href="/termos/novo"
            className="rounded-2xl border border-green-200 bg-white p-6 shadow-sm transition hover:border-green-400 hover:shadow-md"
          >
            <h2 className="text-xl font-semibold text-green-700">Novo termo</h2>
            <p className="mt-2 text-sm text-black">
              Cadastrar um novo termo de responsabilidade.
            </p>
          </Link>

          <Link
            href="/termos"
            className="rounded-2xl border border-green-200 bg-white p-6 shadow-sm transition hover:border-green-400 hover:shadow-md"
          >
            <h2 className="text-xl font-semibold text-green-700">Histórico</h2>
            <p className="mt-2 text-sm text-black">
              Consultar os termos registrados no sistema.
            </p>
          </Link>

          <div className="rounded-2xl border border-green-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-green-700">Sessão</h2>
            <p className="mt-2 text-sm text-black">
              Você está em uma área protegida do sistema.
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-green-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-green-700">
            Próxima etapa
          </h3>
          <p className="mt-2 text-black">
            Integrar definitivamente o cadastro, o histórico e o detalhe dos termos ao Supabase,
            substituindo de vez qualquer dependência local.
          </p>
        </div>
      </div>
    </main>
  )
}
