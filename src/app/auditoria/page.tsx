import Link from 'next/link'
import LogoutButton from '@/components/logout-button'
import { createClient } from '@/lib/supabase/server'

type SearchParams = Promise<{
  inicio?: string
  fim?: string
  tipo_evento?: string
  contrato?: string
  centro_custo?: string
  supervisor?: string
  status?: string
  manutencao?: string
  q?: string
}>

type AuditTerm = {
  id: string
  numero_termo: string
  funcionario_nome: string
  matricula: string
  contrato: string
  centro_custo: string
  supervisor: string
  status: string
  em_manutencao: boolean
  patrimonio: string
  tipo_equipamento: string
}

type AuditEvent = {
  id: string
  term_id: string
  event_type: string
  title: string
  description: string | null
  created_at: string
  equipment_terms: AuditTerm | AuditTerm[] | null
}

function uniqueSorted(values: string[]) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b))
}

function formatDateTime(value: string) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('pt-BR')
}

function eventLabel(value: string) {
  switch (value) {
    case 'TERM_CREATED':
      return 'Termo criado'
    case 'DELIVERY_REGISTERED':
      return 'Entrega registrada'
    case 'MAINTENANCE_ON':
      return 'Entrou em manutenção'
    case 'MAINTENANCE_OFF':
      return 'Saiu de manutenção'
    case 'RETURN_REGISTERED':
      return 'Devolução registrada'
    default:
      return value
  }
}

function getTerm(event: AuditEvent): AuditTerm | null {
  const term = event.equipment_terms
  if (Array.isArray(term)) return term[0] ?? null
  return term ?? null
}

export default async function AuditoriaPage({
  searchParams,
}: {
  searchParams?: SearchParams
}) {
  const params = (await searchParams) ?? {}

  const inicio = params.inicio ?? ''
  const fim = params.fim ?? ''
  const tipo_evento = params.tipo_evento ?? 'todos'
  const contrato = params.contrato ?? 'todos'
  const centro_custo = params.centro_custo ?? 'todos'
  const supervisor = params.supervisor ?? 'todos'
  const status = params.status ?? 'todos'
  const manutencao = params.manutencao ?? 'todos'
  const q = (params.q ?? '').trim().toLowerCase()

  const supabase = await createClient()

  let query = supabase
    .from('term_events')
    .select(`
      id,
      term_id,
      event_type,
      title,
      description,
      created_at,
      equipment_terms!inner(
        id,
        numero_termo,
        funcionario_nome,
        matricula,
        contrato,
        centro_custo,
        supervisor,
        status,
        em_manutencao,
        patrimonio,
        tipo_equipamento
      )
    `)
    .order('created_at', { ascending: false })

  if (inicio) {
    query = query.gte('created_at', `${inicio}T00:00:00`)
  }

  if (fim) {
    query = query.lte('created_at', `${fim}T23:59:59`)
  }

  if (tipo_evento !== 'todos') {
    query = query.eq('event_type', tipo_evento)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Erro ao carregar auditoria: ${error.message}`)
  }

  const events = ((data ?? []) as AuditEvent[]).filter((event) => {
    const term = getTerm(event)
    if (!term) return false

    const matchesContrato =
      contrato === 'todos' ? true : term.contrato === contrato

    const matchesCentroCusto =
      centro_custo === 'todos' ? true : term.centro_custo === centro_custo

    const matchesSupervisor =
      supervisor === 'todos' ? true : term.supervisor === supervisor

    const matchesStatus =
      status === 'todos' ? true : term.status === status

    const matchesMaintenance =
      manutencao === 'todos'
        ? true
        : manutencao === 'em_manutencao'
        ? term.em_manutencao === true
        : term.em_manutencao === false

    const haystack = [
      term.numero_termo,
      term.funcionario_nome,
      term.matricula,
      term.patrimonio,
      term.tipo_equipamento,
      term.contrato,
      term.centro_custo,
      term.supervisor,
      event.title,
      event.description ?? '',
    ]
      .join(' ')
      .toLowerCase()

    const matchesSearch = !q || haystack.includes(q)

    return (
      matchesContrato &&
      matchesCentroCusto &&
      matchesSupervisor &&
      matchesStatus &&
      matchesMaintenance &&
      matchesSearch
    )
  })

  const allTerms = events
    .map(getTerm)
    .filter((term): term is AuditTerm => !!term)

  const contratos = uniqueSorted(allTerms.map((term) => term.contrato))
  const centrosCusto = uniqueSorted(allTerms.map((term) => term.centro_custo))
  const supervisores = uniqueSorted(allTerms.map((term) => term.supervisor))

  const totalEventos = events.length
  const totalTermosAfetados = new Set(events.map((event) => event.term_id)).size
  const totalManutencao = events.filter((event) => event.event_type === 'MAINTENANCE_ON').length
  const totalDevolucoes = events.filter((event) => event.event_type === 'RETURN_REGISTERED').length

  return (
    <main className="min-h-screen bg-green-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800">
              Auditoria operacional
            </span>
            <h1 className="mt-3 text-3xl font-bold text-green-700">
              Auditoria por período
            </h1>
            <p className="mt-2 text-black">
              Consulte eventos reais do sistema com filtros operacionais.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin"
              className="rounded-xl border border-green-200 bg-white px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-100"
            >
              Painel do admin
            </Link>

            <LogoutButton />
          </div>
        </div>

        <form className="mb-6 rounded-2xl border border-green-200 bg-white p-4 shadow-sm">
          <div className="grid gap-4 md:grid-cols-5">
            <div>
              <label className="mb-1 block text-sm font-semibold text-green-700">
                Data inicial
              </label>
              <input
                type="date"
                name="inicio"
                defaultValue={inicio}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-black outline-none focus:border-green-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-green-700">
                Data final
              </label>
              <input
                type="date"
                name="fim"
                defaultValue={fim}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-black outline-none focus:border-green-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-green-700">
                Tipo de evento
              </label>
              <select
                name="tipo_evento"
                defaultValue={tipo_evento}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-black outline-none focus:border-green-500"
              >
                <option value="todos">Todos</option>
                <option value="TERM_CREATED">Termo criado</option>
                <option value="DELIVERY_REGISTERED">Entrega registrada</option>
                <option value="MAINTENANCE_ON">Entrou em manutenção</option>
                <option value="MAINTENANCE_OFF">Saiu de manutenção</option>
                <option value="RETURN_REGISTERED">Devolução registrada</option>
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
                  <option key={item} value={item}>
                    {item}
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
                  <option key={item} value={item}>
                    {item}
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
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-green-700">
                Status do termo
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

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-semibold text-green-700">
                Busca livre
              </label>
              <input
                type="text"
                name="q"
                defaultValue={params.q ?? ''}
                placeholder="Termo, funcionário, matrícula, patrimônio, contrato..."
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-black placeholder:text-gray-400 outline-none focus:border-green-500"
              />
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
              href="/auditoria"
              className="rounded-xl border border-green-200 bg-white px-5 py-3 text-sm font-semibold text-green-700 hover:bg-green-100"
            >
              Limpar filtros
            </Link>
          </div>
        </form>

        <div className="grid gap-5 md:grid-cols-4">
          <div className="rounded-2xl border border-green-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-green-700">Eventos</h2>
            <p className="mt-2 text-3xl font-bold text-black">{totalEventos}</p>
          </div>

          <div className="rounded-2xl border border-green-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-green-700">Termos afetados</h2>
            <p className="mt-2 text-3xl font-bold text-black">{totalTermosAfetados}</p>
          </div>

          <div className="rounded-2xl border border-green-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-green-700">Entradas em manutenção</h2>
            <p className="mt-2 text-3xl font-bold text-black">{totalManutencao}</p>
          </div>

          <div className="rounded-2xl border border-green-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-green-700">Devoluções</h2>
            <p className="mt-2 text-3xl font-bold text-black">{totalDevolucoes}</p>
          </div>
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border border-green-200 bg-white shadow-sm">
          <div className="grid grid-cols-7 gap-4 bg-green-100 px-4 py-3 text-sm font-semibold text-green-800">
            <div>Data/Hora</div>
            <div>Evento</div>
            <div>Termo</div>
            <div>Funcionário</div>
            <div>Contrato</div>
            <div>Supervisor</div>
            <div>Ação</div>
          </div>

          {events.length === 0 ? (
            <div className="px-4 py-10 text-sm text-black">
              Nenhum evento encontrado para os filtros atuais.
            </div>
          ) : (
            events.map((event) => {
              const term = getTerm(event)
              if (!term) return null

              return (
                <div
                  key={event.id}
                  className="grid grid-cols-7 gap-4 border-t border-green-100 px-4 py-4 text-sm text-black"
                >
                  <div>{formatDateTime(event.created_at)}</div>
                  <div>
                    <div className="font-semibold text-green-700">
                      {eventLabel(event.event_type)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {event.description || '-'}
                    </div>
                  </div>
                  <div>{term.numero_termo}</div>
                  <div>
                    <div>{term.funcionario_nome}</div>
                    <div className="text-xs text-gray-500">
                      Matrícula: {term.matricula}
                    </div>
                  </div>
                  <div>
                    <div>{term.contrato}</div>
                    <div className="text-xs text-gray-500">
                      CC: {term.centro_custo}
                    </div>
                  </div>
                  <div>{term.supervisor}</div>
                  <div>
                    <Link
                      href={`/termos/${term.id}`}
                      className="text-sm font-semibold text-green-700 hover:underline"
                    >
                      Abrir termo
                    </Link>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </main>
  )
}
