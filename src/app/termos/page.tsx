import Link from 'next/link'
import LogoutButton from '@/components/logout-button'
import { listTerms } from '@/lib/terms-supabase'
import { getCurrentProfile } from '@/lib/auth/profile'
import ExportPdfButton from './export-pdf-button'
import { formatDisplayLabel } from '@/lib/format-display'

type SearchParams = Promise<{
  q?: string
  status?: string
  manutencao?: string
  contrato?: string
  centro_custo?: string
  supervisor?: string
}>

function formatDate(value: string) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('pt-BR')
}

function uniqueSorted(values: string[]) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b))
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
  const contrato = params.contrato ?? 'todos'
  const centro_custo = params.centro_custo ?? 'todos'
  const supervisor = params.supervisor ?? 'todos'

  const profile = await getCurrentProfile()
  const isAdmin = profile?.role === 'admin'

  const terms = await listTerms()

  const contratos = uniqueSorted(terms.map((term) => term.contrato))
  const centrosCusto = uniqueSorted(terms.map((term) => term.centro_custo))
  const supervisores = uniqueSorted(terms.map((term) => term.supervisor))

  const filteredTerms = terms.filter((term) => {
    const matchesSearch =
      !q ||
      term.numero_termo.toLowerCase().includes(q) ||
      term.funcionario_nome.toLowerCase().includes(q) ||
      term.tipo_equipamento.toLowerCase().includes(q) ||
      term.patrimonio.toLowerCase().includes(q) ||
      term.supervisor.toLowerCase().includes(q) ||
      term.contrato.toLowerCase().includes(q) ||
      term.centro_custo.toLowerCase().includes(q) ||
      (term.matricula ?? '').toLowerCase().includes(q)

    const matchesStatus =
      status === 'todos' ? true : term.status === status

    const matchesMaintenance =
      manutencao === 'todos'
        ? true
        : manutencao === 'em_manutencao'
        ? term.em_manutencao === true
        : term.em_manutencao === false

    const matchesContrato =
      contrato === 'todos' ? true : term.contrato === contrato

    const matchesCentroCusto =
      centro_custo === 'todos' ? true : term.centro_custo === centro_custo

    const matchesSupervisor =
      supervisor === 'todos' ? true : term.supervisor === supervisor

    return (
      matchesSearch &&
      matchesStatus &&
      matchesMaintenance &&
      matchesContrato &&
      matchesCentroCusto &&
      matchesSupervisor
    )
  })

  const pdfTerms = filteredTerms.map((term) => ({
    numero_termo: term.numero_termo,
    funcionario_nome: term.funcionario_nome,
    matricula: term.matricula,
    tipo_equipamento: term.tipo_equipamento,
    patrimonio: term.patrimonio,
    supervisor: term.supervisor,
    contrato: term.contrato,
    centro_custo: term.centro_custo,
    status: term.status,
    em_manutencao: term.em_manutencao,
    data_entrega: term.data_entrega,
  }))

  return (
    <main className="min-h-screen bg-green-50 p-6">
      <div className="mx-auto max-w-7xl">
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

            {isAdmin ? (
              <ExportPdfButton
                terms={pdfTerms}
                filters={{
                  q: params.q ?? '',
                  status,
                  manutencao,
                  contrato,
                  centro_custo,
                  supervisor,
                }}
              />
            ) : null}

            <LogoutButton />
          </div>
        </div>

        <form className="mb-6 rounded-2xl border border-green-200 bg-white p-4 shadow-sm">
          <div className="grid gap-4 md:grid-cols-6">
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-semibold text-green-700">
                Buscar
              </label>
              <input
                type="text"
                name="q"
                defaultValue={params.q ?? ''}
                placeholder="Número, funcionário, patrimônio, supervisor..."
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
                <option value="DEVOLVIDO">Devolvido à sede</option>
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

            <div>
              <label className="mb-1 block text-sm font-semibold text-green-700">
                Contrato
              </label>
              <select
                name="contrato"
                defaultValue={contrato}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-black outline-none focus:border-green-500"
              >
                <option value="todos">Todos</option>
                {contratos.map((item) => (
                  <option key={formatDisplayLabel(item)} value={formatDisplayLabel(item)}>
                    {formatDisplayLabel(item)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-green-700">
                Centro de custo
              </label>
              <select
                name="centro_custo"
                defaultValue={centro_custo}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-black outline-none focus:border-green-500"
              >
                <option value="todos">Todos</option>
                {centrosCusto.map((item) => (
                  <option key={formatDisplayLabel(item)} value={formatDisplayLabel(item)}>
                    {formatDisplayLabel(item)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-green-700">
                Supervisor
              </label>
              <select
                name="supervisor"
                defaultValue={supervisor}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-black outline-none focus:border-green-500"
              >
                <option value="todos">Todos</option>
                {supervisores.map((item) => (
                  <option key={formatDisplayLabel(item)} value={formatDisplayLabel(item)}>
                    {formatDisplayLabel(item)}
                  </option>
                ))}
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

        <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-black">
          <span>
            Total de registros encontrados: <strong>{filteredTerms.length}</strong>
          </span>

          {status !== 'todos' ? (
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
              Status: {status === 'DEVOLVIDO' ? 'Devolvido à sede' : status}
            </span>
          ) : null}

          {manutencao !== 'todos' ? (
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
              {manutencao === 'em_manutencao' ? 'Somente em manutenção' : 'Sem manutenção'}
            </span>
          ) : null}

          {contrato !== 'todos' ? (
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
              Contrato: {formatDisplayLabel(contrato)}
            </span>
          ) : null}

          {centro_custo !== 'todos' ? (
            <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
              Centro de custo: {centro_custo}
            </span>
          ) : null}

          {supervisor !== 'todos' ? (
            <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
              Supervisor: {supervisor}
            </span>
          ) : null}
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

                <div>
                  <div>{term.supervisor}</div>
                  <div className="text-xs text-gray-500">{term.centro_custo}</div>
                </div>

                <div className="space-y-2">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      term.status === 'DEVOLVIDO'
                        ? 'bg-gray-200 text-gray-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {term.status === 'DEVOLVIDO' ? 'DEVOLVIDO À SEDE' : term.status}
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
