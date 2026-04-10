import Link from 'next/link'
import LogoutButton from '@/components/logout-button'

export default function TermosPage() {
  return (
    <main className="min-h-screen bg-green-50 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-green-700">
              Histórico de Termos
            </h1>
            <p className="mt-2 text-black">
              Área de consulta e acompanhamento dos termos cadastrados.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/dashboard"
              className="rounded-xl border border-green-200 bg-white px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-100"
            >
              Dashboard
            </Link>

            <Link
              href="/termos/novo"
              className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
            >
              Novo termo
            </Link>

            <LogoutButton />
          </div>
        </div>

        <div className="rounded-2xl border border-green-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-green-700">
            Estrutura do histórico
          </h2>
          <p className="mt-2 text-black">
            Esta página já está preparada para ser o histórico oficial dos termos.
            Na próxima etapa, ela será ligada ao Supabase para exibir a listagem real.
          </p>

          <div className="mt-6 overflow-hidden rounded-2xl border border-green-100">
            <div className="grid grid-cols-4 bg-green-100 px-4 py-3 text-sm font-semibold text-green-800">
              <div>Número / ID</div>
              <div>Colaborador</div>
              <div>Status</div>
              <div>Ações</div>
            </div>

            <div className="px-4 py-8 text-sm text-black">
              Nenhum termo listado ainda nesta tela.
              Assim que conectarmos a página ao Supabase, os registros aparecerão aqui.
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
