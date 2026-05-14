import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/lib/auth/profile'
import AuditoriaFilters from './auditoria-filters'
import ExportAuditoriaPdfButton from './export-auditoria-pdf-button'
import { formatDisplayLabel } from '@/lib/format-display'

type SearchParams = Promise<{
  inicio?: string
  fim?: string
  tipo_evento?: string
  contratos?: string
  centros_custo?: string
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
  return [...new Set(values.filter((row): row is NonNullable<typeof row> => row !== null))].sort((a, b) => a.localeCompare(b))
}

function formatDateTime(value: string) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('pt-BR')
}

function parseMulti(value?: string) {
  return (value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function getTerm(event: AuditEvent): AuditTerm | null {
  const term = event.equipment_terms
  if (Array.isArray(term)) return term[0] ?? null
  return term ?? null
}

function eventMeta(eventType: string) {
  switch (eventType) {
    case 'TERM_CREATED':
      return {
        label: 'Termo criado',
        badge: 'bg-blue-100 text-blue-700',
      }
    case 'DELIVERY_REGISTERED':
      return {
        label: 'Entrega registrada',
        badge: 'bg-emerald-100 text-emerald-700',
      }
    case 'MAINTENANCE_ON':
      return {
        label: 'Entrou em manutenção',
        badge: 'bg-amber-100 text-amber-700',
      }
    case 'MAINTENANCE_OFF':
      return {
        label: 'Saiu de manutenção',
        badge: 'bg-slate-200 text-slate-700',
      }
    case 'RETURN_REGISTERED':
      return {
        label: 'Devolução registrada',
        badge: 'bg-gray-200 text-gray-700',
      }
    default:
      return {
        label: eventType,
        badge: 'bg-slate-100 text-slate-700',
      }
  }
}

function statusMeta(status: string, em_manutencao: boolean) {
  const base =
    status === 'DEVOLVIDO'
      ? {
          label: 'DEVOLVIDO À SEDE',
          className: 'bg-gray-200 text-gray-700',
        }
      : {
          label: 'ENTREGUE',
          className: 'bg-emerald-100 text-emerald-700',
        }

  return {
    base,
    manutencao: em_manutencao
      ? {
          label: 'EM MANUTENÇÃO',
          className: 'bg-amber-100 text-amber-700',
        }
      : null,
  }
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
  const contratos = parseMulti(params.contratos)
  const centros_custo = parseMulti(params.centros_custo)
  const supervisor = params.supervisor ?? 'todos'
  const status = params.status ?? 'todos'
  const manutencao = params.manutencao ?? 'todos'
  const q = (params.q ?? '').trim().toLowerCase()

  const supabase = await createClient()
  const profile = await getCurrentProfile()
  const isAdmin = profile?.role === 'superadmin' || profile?.role === 'admin'
  const centros = profile?.centros_custo ?? []

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

  if (!isAdmin && centros.length > 0) {
    query = query.in('equipment_terms.centro_custo', centros)
  }

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

  const baseEvents = (data ?? []) as AuditEvent[]

  const pairMap = new Map<string, { contrato: string; centro_custo: string }>()
  baseEvents.forEach((event) => {
    const term = getTerm(event)
    if (!term) return
    const key = `${term.contrato}__${term.centro_custo}`
    if (!pairMap.has(key)) {
      pairMap.set(key, {
        contrato: term.contrato,
        centro_custo: term.centro_custo,
      })
    }
  })

  const pairs = Array.from(pairMap.values())

  const contratoOptions = uniqueSorted(pairs.map((pair) => pair.contrato)).map((item) => ({
    value: item,
    label: formatDisplayLabel(item),
  }))

  const centroCustoOptions = uniqueSorted(pairs.map((pair) => pair.centro_custo)).map((item) => ({
    value: item,
    label: formatDisplayLabel(item),
  }))

  const supervisorOptions = uniqueSorted(
    baseEvents
      .map(getTerm)
      .filter((term): term is AuditTerm => !!term)
      .map((term) => term.supervisor)
  )

  const filteredEvents = baseEvents.filter((event) => {
    const term = getTerm(event)
    if (!term) return false

    const matchesContrato =
      contratos.length === 0 ? true : contratos.includes(term.contrato)

    const matchesCentro =
      centros_custo.length === 0 ? true : centros_custo.includes(term.centro_custo)

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
      matchesCentro &&
      matchesSupervisor &&
      matchesStatus &&
      matchesMaintenance &&
      matchesSearch
    )
  })

  const totalEventos = filteredEvents.length
  const totalTermosAfetados = new Set(filteredEvents.map((event) => event.term_id)).size
  const totalManutencao = filteredEvents.filter((event) => event.event_type === 'MAINTENANCE_ON').length
  const totalDevolucoes = filteredEvents.filter((event) => event.event_type === 'RETURN_REGISTERED').length

  const pdfRows = filteredEvents.reduce<
    {
      data_hora: string
      evento: string
      descricao: string
      numero_termo: string
      funcionario_nome: string
      matricula: string
      equipamento: string
      patrimonio: string
      contrato: string
      centro_custo: string
      supervisor: string
      status: string
      em_manutencao: boolean
    }[]
  >((acc, event) => {
    const term = getTerm(event)
    if (!term) return acc

    acc.push({
      data_hora: formatDateTime(event.created_at),
      evento: eventMeta(event.event_type).label,
      descricao: event.description ?? '',
      numero_termo: term.numero_termo,
      funcionario_nome: term.funcionario_nome,
      matricula: term.matricula,
      equipamento: term.tipo_equipamento,
      patrimonio: term.patrimonio,
      contrato: term.contrato,
      centro_custo: term.centro_custo,
      supervisor: term.supervisor,
      status: term.status,
      em_manutencao: term.em_manutencao,
    })

    return acc
  }, [])

  return (
    <main className="p-0">
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Administração</p>
            <h1 className="mt-1 text-3xl font-black text-slate-900">Auditoria</h1>
            <p className="mt-1 text-sm text-slate-500">Eventos reais do sistema com filtros operacionais e exportação em PDF.</p>
          </div>
          <ExportAuditoriaPdfButton
            rows={pdfRows}
            filters={{
              inicio,
              fim,
              tipo_evento,
              contratos,
              centros_custo,
              supervisor,
              status,
              manutencao,
              q: params.q ?? '',
            }}
          />
        </div>

        <AuditoriaFilters
          initial={{
            inicio,
            fim,
            tipo_evento,
            contratos,
            centros_custo,
            supervisor,
            status,
            manutencao,
            q: params.q ?? '',
          }}
          contratoOptions={contratoOptions}
          centroCustoOptions={centroCustoOptions}
          supervisorOptions={supervisorOptions}
          pairs={pairs}
        />

        <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-black">
          <span>
            Total de eventos: <strong>{totalEventos}</strong>
          </span>

          {contratos.length > 0 ? (
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
              Contratos: {contratos.length}
            </span>
          ) : null}

          {centros_custo.length > 0 ? (
            <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
              Centros de custo: {centros_custo.length}
            </span>
          ) : null}

          {status !== 'todos' ? (
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
              Status: {status === 'DEVOLVIDO' ? 'Devolvido à sede' : status}
            </span>
          ) : null}

          {manutencao !== 'todos' ? (
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
              {manutencao === 'em_manutencao' ? 'Em manutenção' : 'Sem manutenção'}
            </span>
          ) : null}
        </div>

        <div className="grid gap-5 md:grid-cols-4">
          <div className="rounded-2xl bg-white p-5 shadow-sm border-t-4 border-indigo-500">
            <div className="text-xs font-semibold uppercase tracking-widest text-slate-400">Eventos</div>
            <div className="mt-2 text-4xl font-black text-indigo-600">{totalEventos}</div>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm border-t-4 border-emerald-400">
            <div className="text-xs font-semibold uppercase tracking-widest text-slate-400">Termos afetados</div>
            <div className="mt-2 text-4xl font-black text-emerald-600">{totalTermosAfetados}</div>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm border-t-4 border-amber-400">
            <div className="text-xs font-semibold uppercase tracking-widest text-slate-400">Entradas em manutenção</div>
            <div className="mt-2 text-4xl font-black text-amber-500">{totalManutencao}</div>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm border-t-4 border-slate-400">
            <div className="text-xs font-semibold uppercase tracking-widest text-slate-400">Devoluções</div>
            <div className="mt-2 text-4xl font-black text-slate-600">{totalDevolucoes}</div>
          </div>
        </div>

        <div className="mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="grid grid-cols-8 gap-4 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 border-b border-slate-200">
            <div>Data/Hora</div>
            <div>Evento</div>
            <div>Termo</div>
            <div>Funcionário</div>
            <div>Equipamento</div>
            <div>Contrato / CC</div>
            <div>Situação</div>
            <div>Ação</div>
          </div>

          {filteredEvents.length === 0 ? (
            <div className="px-4 py-10 text-sm text-black">
              Nenhum evento encontrado para os filtros atuais.
            </div>
          ) : (
            filteredEvents.map((event) => {
              const term = getTerm(event)
              if (!term) return null

              const eventInfo = eventMeta(event.event_type)
              const statusInfo = statusMeta(term.status, term.em_manutencao)

              return (
                <div
                  key={event.id}
                  className="grid grid-cols-8 gap-4 border-t border-slate-100 px-4 py-4 text-sm text-slate-800"
                >
                  <div>{formatDateTime(event.created_at)}</div>

                  <div>
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${eventInfo.badge}`}>
                      {eventInfo.label}
                    </span>
                    <div className="mt-2 text-xs text-slate-600">
                      {event.description || '-'}
                    </div>
                  </div>

                  <div className="font-semibold text-indigo-600">
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
                    <div>{formatDisplayLabel(term.contrato)}</div>
                    <div className="text-xs text-gray-500">
                      CC: {term.centro_custo}
                    </div>
                    <div className="text-xs text-gray-500">
                      Supervisor: {term.supervisor}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusInfo.base.className}`}>
                      {statusInfo.base.label}
                    </span>

                    {statusInfo.manutencao ? (
                      <div>
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusInfo.manutencao.className}`}>
                          {statusInfo.manutencao.label}
                        </span>
                      </div>
                    ) : null}
                  </div>

                  <div>
                    <Link
                      href={`/termos/${term.id}`}
                      className="text-xs font-semibold text-indigo-600 hover:underline"
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
