import Link from 'next/link'
import LogoutButton from '@/components/logout-button'
import { listTerms } from '@/lib/terms-supabase'

type SearchParams = Promise<{
  q?: string
  status?: string
  manutencao?: string
}>

function formatDate(value: string) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('pt-BR')
}

export default async function TermosPage({
  searchParams,
}: {
  searchParams?: SearchParams
}) {
  const params = (await searchParams) ?? {}
  const q = (params.q ?? '').trim().toLowerCase()
  const status = params.status ?? 'todos'
  const manutencao = params.manutencao ?? 'todos'

  const terms = await listTerms()

  const filteredTerms = terms.filter((term) => {
    const matchesSearch =
      !q ||
      term.numero_termo.toLowerCase().includes(q) ||
      term.funcionario_nome.toLowerCase().includes(q) ||
      term.tipo_equipamento.toLowerCase().includes(q) ||
      term.patrimonio.toLowerCase().includes(q) ||
      term.supervisor.toLowerCase().includes(q) ||
      (term.matricula ?? '').toLowerCase().includes(q)

    const matchesStatus =
      status === 'todos' ? true : term.status === status

    const matchesMaintenance =
      manutencao === 'todos'
        ? true
        : manutencao === 'em_manutencao'
        ? term.em_manutencao === true
        : term.em_manutencao === false

    return matchesSearch && matchesStatus && matchesMaintenance
  })

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

        <form className="mb-6 rounded-2xl border border-green-200 bg-white p-4 shadow-sm">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-semibold text-green-700">
                Buscar
              </label>
              <input
                type="text"
                name="q"
                defaultValue={params.q ?? ''}
                placeholder="Número do termo, funcionário, matrícula, supervisor, patrimônio..."
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-black placeholder:text-gray-400 outline-none focus:border-green-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-green-700">
                Status
              </label>
              <select
                name="status"
                defaultValue={status}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-black outline-none focus:border-green-500"
              >
                <option value="todos">Todos</option>
                <option value="ENTREGUE">Entregue</option>
                <option value="DEVOLVIDO">Devolvido</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-green-700">
                Manutenção
              </label>
              <select
                name="manutencao"
                defaultValue={manutencao}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-black outline-none focus:border-green-500"
              >
                <option value="todos">Todos</option>
                <option value="em_manutencao">Em manutenção</option>
                <option value="sem_manutencao">Sem manutenção</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="submit"
              className="rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white hover:bg-green-700"
            >
              Aplicar filtros
            </button>

            <Link
              href="/termos"
              className="rounded-xl border border-green-200 bg-white px-5 py-3 text-sm font-semibold text-green-700 hover:bg-green-100"
            >
              Limpar filtros
            </Link>
          </div>
        </form>

        <div className="mb-4 text-sm text-black">
          Total de registros encontrados: <strong>{filteredTerms.length}</strong>
        </div>

        <div className="overflow-hidden rounded-2xl border border-green-200 bg-white shadow-sm">
          <div className="grid grid-cols-6 gap-4 bg-green-100 px-4 py-3 text-sm font-semibold text-green-800">
            <div>Nº Termo</div>
            <div>Funcionário</div>
            <div>Equipamento</div>
            <div>Supervisor</div>
            <div>Status</div>
            <div>Entrega</div>
          </div>

          {filteredTerms.length === 0 ? (
            <div className="px-4 py-10 text-sm text-black">
              Nenhum termo encontrado com os filtros atuais.
            </div>
          ) : (
            filteredTerms.map((term) => (
              <Link
                key={term.id}
                href={`/termos/${term.id}`}
                className="grid grid-cols-6 gap-4 border-t border-green-100 px-4 py-4 text-sm text-black hover:bg-green-50"
              >
                <div className="font-semibold text-green-700">
                  {term.numero_termo}
                </div>

                <div>
                  <div>{term.funcionario_nome}</div>
                  <div className="text-xs text-gray-500">
                    Matrícula: {term.matricula}
                  </div>
                </div>

                <div>
                  <div>{term.tipo_equipamento}</div>
                  <div className="text-xs text-gray-500">
                    Patrimônio: {term.patrimonio}
                  </div>
                </div>

                <div>{term.supervisor}</div>

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
