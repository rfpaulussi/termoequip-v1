import Link from 'next/link'
import LogoutButton from '@/components/logout-button'
import { listTerms } from '@/lib/terms-supabase'

function formatDate(value: string) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('pt-BR')
}

export default async function TermosPage() {
  const terms = await listTerms()

  return (
    <main className="min-h-screen bg-green-50 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-green-700">
              Histórico de Termos
            </h1>
            <p className="mt-2 text-black">
              Consulte os termos cadastrados no Supabase.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
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

        <div className="mb-4 text-sm text-black">
          Total de registros: <strong>{terms.length}</strong>
        </div>

        <div className="overflow-hidden rounded-2xl border border-green-200 bg-white shadow-sm">
          <div className="grid grid-cols-5 gap-4 bg-green-100 px-4 py-3 text-sm font-semibold text-green-800">
            <div>Nº Termo</div>
            <div>Funcionário</div>
            <div>Equipamento</div>
            <div>Status</div>
            <div>Entrega</div>
          </div>

          {terms.length === 0 ? (
            <div className="px-4 py-10 text-sm text-black">
              Nenhum termo encontrado.
            </div>
          ) : (
            terms.map((term) => (
              <Link
                key={term.id}
                href={`/termos/${term.id}`}
                className="grid grid-cols-5 gap-4 border-t border-green-100 px-4 py-4 text-sm text-black hover:bg-green-50"
              >
                <div className="font-semibold text-green-700">
                  {term.numero_termo}
                </div>
                <div>{term.funcionario_nome}</div>
                <div>
                  <div>{term.tipo_equipamento}</div>
                  <div className="text-xs text-gray-500">
                    Patrimônio: {term.patrimonio}
                  </div>
                </div>
                <div className="space-y-2">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      term.status === 'DEVOLVIDO'
                        ? 'bg-gray-200 text-gray-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {term.status}
                  </span>

                  {term.em_manutencao ? (
                    <div>
                      <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                        EM MANUTENÇÃO
                      </span>
                    </div>
                  ) : null}
                </div>
                <div>{formatDate(term.data_entrega)}</div>
              </Link>
            ))
          )}
        </div>
      </div>
    </main>
  )
}
