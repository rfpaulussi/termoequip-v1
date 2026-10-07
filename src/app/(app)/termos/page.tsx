import Link from 'next/link'
import { listTerms } from '@/lib/terms-supabase'
import { getCurrentProfile } from '@/lib/auth/profile'
import ExportPdfButton from './export-pdf-button'
import { formatDisplayLabel } from '@/lib/format-display'
import { displayName, initials, plural } from '@/lib/display-name'
import {
  finalizeDraftFromListAction,
  maintenanceOffFromListAction,
  maintenanceOnFromListAction,
  returnFromListAction,
} from './history-actions'

type SearchParams = Promise<{
  q?: string
  foco?: string
  visao?: string
  contrato?: string
  centro_custo?: string
  supervisor?: string
  draft_saved?: string
  draft_updated?: string
  draft_finalized?: string
  draft_finalize_error?: string
  acao_ok?: string
  acao_erro?: string
}>

type Term = Awaited<ReturnType<typeof listTerms>>[number]
type Foco = 'todos' | 'campo' | 'multi' | 'manutencao' | 'devolvidos' | 'rascunhos'

const FOCOS: Foco[] = ['todos', 'campo', 'multi', 'manutencao', 'devolvidos', 'rascunhos']

function formatDate(value: string) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('pt-BR')
}

function uniqueSorted(values: string[]) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b))
}

const isActive = (t: Term) => t.status === 'ENTREGUE' && !t.is_draft

const fieldClass = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'
const labelClass = 'mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500'

function StatusBadges({ term }: { term: Term }) {
  return (
    <span className="flex flex-wrap gap-1">
      {term.is_draft ? (
        <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-bold text-sky-700">RASCUNHO</span>
      ) : term.status === 'DEVOLVIDO' ? (
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-500">DEVOLVIDO</span>
      ) : (
        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">EM CAMPO</span>
      )}
      {term.em_manutencao && (
        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">MANUTENÇÃO</span>
      )}
      {term.is_reserva && (
        <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-bold text-violet-700">RESERVA</span>
      )}
    </span>
  )
}

const popoverSummary = 'cursor-pointer select-none list-none rounded-lg border px-3 py-1.5 text-xs font-semibold transition [&::-webkit-details-marker]:hidden'
const popoverPanel = 'absolute right-0 z-30 mt-2 w-72 space-y-2.5 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-xl'
const miniField = 'w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-sm text-slate-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'
const miniLabel = 'mb-0.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500'

function TermActions({ term, userName, today }: { term: Term; userName: string; today: string }) {
  const active = isActive(term)
  const canTransfer = active && !term.is_reserva
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Link href={`/termos/${term.id}`} className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-700 transition">
        Abrir
      </Link>
      {term.is_draft ? (
        <>
          <Link href={`/termos/${term.id}/editar`} className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-100 transition">
            Editar
          </Link>
          <form action={finalizeDraftFromListAction}>
            <input type="hidden" name="term_id" value={term.id} />
            <button type="submit" className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-700 hover:bg-sky-100 transition">
              Finalizar
            </button>
          </form>
        </>
      ) : (
        <Link href={`/termos/${term.id}/imprimir`} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition">
          Imprimir
        </Link>
      )}
      {active && (
        <details className="relative">
          <summary className={`${popoverSummary} border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100`}>Devolver</summary>
          <form action={returnFromListAction} className={popoverPanel}>
            <p className="text-sm font-bold text-slate-800">Devolver ao estoque</p>
            <p className="-mt-1 text-xs text-slate-400">{term.tipo_equipamento} · {term.patrimonio}</p>
            <input type="hidden" name="term_id" value={term.id} />
            <div>
              <label className={miniLabel}>Data da devolução *</label>
              <input type="date" name="data_devolucao" defaultValue={today} required className={miniField} />
            </div>
            <div>
              <label className={miniLabel}>Condição *</label>
              <select name="condicao" defaultValue="EM_PERFEITO_ESTADO" className={miniField}>
                <option value="EM_PERFEITO_ESTADO">Em perfeito estado</option>
                <option value="COM_DEFEITO">Com defeito</option>
                <option value="FALTANDO_PECAS">Faltando peças</option>
              </select>
            </div>
            <div>
              <label className={miniLabel}>Quem recebeu *</label>
              <input name="responsavel_recebimento" defaultValue={userName} required className={miniField} />
            </div>
            <div>
              <label className={miniLabel}>Observações</label>
              <input name="observacoes" className={miniField} />
            </div>
            <button type="submit" className="w-full rounded-lg bg-rose-600 px-3 py-2 text-xs font-bold text-white hover:bg-rose-700 transition">
              Confirmar devolução
            </button>
          </form>
        </details>
      )}
      {active && !term.em_manutencao && (
        <details className="relative">
          <summary className={`${popoverSummary} border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100`}>Manutenção</summary>
          <form action={maintenanceOnFromListAction} className={popoverPanel}>
            <p className="text-sm font-bold text-slate-800">Enviar para manutenção</p>
            <p className="-mt-1 text-xs text-slate-400">{term.tipo_equipamento} · {term.patrimonio}</p>
            <input type="hidden" name="term_id" value={term.id} />
            <div>
              <label className={miniLabel}>Data de entrada *</label>
              <input type="date" name="data_manutencao" defaultValue={today} required className={miniField} />
            </div>
            <div>
              <label className={miniLabel}>Motivo</label>
              <input name="observacao_manutencao" placeholder="Ex.: motor falhando" className={miniField} />
            </div>
            <button type="submit" className="w-full rounded-lg bg-amber-500 px-3 py-2 text-xs font-bold text-white hover:bg-amber-600 transition">
              Confirmar manutenção
            </button>
          </form>
        </details>
      )}
      {active && term.em_manutencao && (
        <form action={maintenanceOffFromListAction}>
          <input type="hidden" name="term_id" value={term.id} />
          <button type="submit" className={`${popoverSummary} border-amber-300 bg-amber-100 text-amber-900 hover:bg-amber-200`}>
            Sair da manutenção
          </button>
        </form>
      )}
      {canTransfer && (
        <Link href={`/transferencias?de=${encodeURIComponent(term.matricula)}`} className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition">
          Transferir
        </Link>
      )}
    </div>
  )
}

export default async function TermosPage({ searchParams }: { searchParams?: SearchParams }) {
  const params = (await searchParams) ?? {}
  const q = (params.q ?? '').trim().toLowerCase()
  const foco: Foco = FOCOS.includes(params.foco as Foco) ? (params.foco as Foco) : 'todos'
  const visao = params.visao === 'lista' ? 'lista' : 'operador'
  const contrato = params.contrato ?? 'todos'
  const centro_custo = params.centro_custo ?? 'todos'
  const supervisor = params.supervisor ?? 'todos'

  const profile = await getCurrentProfile()
  const isAdmin = profile?.role === 'superadmin' || profile?.role === 'admin'
  const terms = await listTerms(isAdmin ? undefined : profile?.centros_custo)

  const contratos = uniqueSorted(terms.map(t => t.contrato))
  const centrosCusto = uniqueSorted(terms.map(t => t.centro_custo))
  const supervisores = uniqueSorted(terms.map(t => t.supervisor))

  // patrimônios em campo por operador (considera todos os termos, não só os filtrados)
  const activeByOperator = new Map<string, number>()
  for (const t of terms) {
    if (isActive(t) && !t.is_reserva) {
      activeByOperator.set(t.matricula, (activeByOperator.get(t.matricula) ?? 0) + 1)
    }
  }
  const multiOperators = [...activeByOperator.values()].filter(n => n > 1).length

  const base = terms.filter(term => {
    const matchesSearch = !q || [
      term.numero_termo, term.funcionario_nome, term.tipo_equipamento, term.patrimonio,
      term.supervisor, term.contrato, term.centro_custo, term.matricula ?? '',
    ].some(v => v.toLowerCase().includes(q))
    return matchesSearch &&
      (contrato === 'todos' || term.contrato === contrato) &&
      (centro_custo === 'todos' || term.centro_custo === centro_custo) &&
      (supervisor === 'todos' || term.supervisor === supervisor)
  })

  const matchesFoco = (t: Term, f: Foco) => {
    switch (f) {
      case 'campo': return isActive(t)
      case 'multi': return isActive(t) && !t.is_reserva && (activeByOperator.get(t.matricula) ?? 0) > 1
      case 'manutencao': return t.em_manutencao === true
      case 'devolvidos': return t.status === 'DEVOLVIDO' && !t.is_draft
      case 'rascunhos': return t.is_draft === true
      default: return true
    }
  }
  const counts = Object.fromEntries(FOCOS.map(f => [f, base.filter(t => matchesFoco(t, f)).length])) as Record<Foco, number>
  const filteredTerms = base.filter(t => matchesFoco(t, foco))

  // agrupa por operador
  type Group = { key: string; nome: string; matricula: string; funcao: string; centro: string; reserva: boolean; terms: Term[] }
  const groupsMap = new Map<string, Group>()
  for (const t of filteredTerms) {
    const key = t.is_reserva ? `reserva-${t.centro_custo}` : t.matricula
    const g = groupsMap.get(key) ?? {
      key,
      nome: t.is_reserva ? `Reserva (stand-by) · CC ${t.centro_custo}` : displayName(t.funcionario_nome),
      matricula: t.matricula,
      funcao: t.is_reserva ? 'Equipamentos de reserva' : t.funcao,
      centro: t.centro_custo,
      reserva: !!t.is_reserva,
      terms: [],
    }
    g.terms.push(t)
    groupsMap.set(key, g)
  }
  const groups = [...groupsMap.values()].sort((a, b) => {
    const diff = (activeByOperator.get(b.matricula) ?? 0) - (activeByOperator.get(a.matricula) ?? 0)
    return foco === 'multi' && diff !== 0 ? diff : a.nome.localeCompare(b.nome)
  })

  const pdfStatus = foco === 'campo' ? 'ENTREGUE' : foco === 'devolvidos' ? 'DEVOLVIDO' : 'todos'
  const pdfManutencao = foco === 'manutencao' ? 'em_manutencao' : 'todos'
  const pdfTerms = filteredTerms.map(term => ({
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
    is_draft: term.is_draft,
  }))

  const userName = profile?.full_name ?? ''
  const today = new Date().toISOString().slice(0, 10)

  const bannerMessage =
    params.acao_ok === 'devolvido' ? 'Devolução registrada. O equipamento voltou ao estoque.' :
    params.acao_ok === 'manutencao_on' ? 'Equipamento enviado para manutenção.' :
    params.acao_ok === 'manutencao_off' ? 'Equipamento retirado de manutenção.' :
    params.acao_erro === 'devolucao_campos' ? 'Preencha data, condição e quem recebeu para devolver.' :
    params.acao_erro === 'devolucao_indisponivel' ? 'Este termo não pode mais ser devolvido (já devolvido ou em rascunho).' :
    params.acao_erro ? 'Não foi possível concluir a ação. Tente novamente.' :
    params.draft_saved ? 'Rascunho salvo com sucesso.' :
    params.draft_updated ? 'Rascunho atualizado com sucesso.' :
    params.draft_finalized ? 'Rascunho finalizado com sucesso.' :
    params.draft_finalize_error ? 'Não foi possível finalizar o rascunho.' : ''

  const href = (over: Record<string, string | undefined>) => {
    const sp = new URLSearchParams()
    const cur: Record<string, string | undefined> = {
      q: params.q, foco: foco === 'todos' ? undefined : foco, visao: visao === 'operador' ? undefined : visao,
      contrato: contrato === 'todos' ? undefined : contrato,
      centro_custo: centro_custo === 'todos' ? undefined : centro_custo,
      supervisor: supervisor === 'todos' ? undefined : supervisor,
      ...over,
    }
    for (const [k, v] of Object.entries(cur)) if (v) sp.set(k, v)
    const qs = sp.toString()
    return qs ? `/termos?${qs}` : '/termos'
  }

  const kpis: { foco: Foco; label: string; value: number; hint: string; tone: string }[] = [
    { foco: 'campo', label: 'Em campo', value: counts.campo, hint: 'termos ativos', tone: 'border-emerald-400 text-emerald-700' },
    { foco: 'multi', label: '+1 patrimônio', value: multiOperators, hint: 'operadores com mais de um', tone: 'border-amber-400 text-amber-700' },
    { foco: 'manutencao', label: 'Manutenção', value: counts.manutencao, hint: 'equipamentos parados', tone: 'border-orange-400 text-orange-700' },
    { foco: 'devolvidos', label: 'Devolvidos', value: counts.devolvidos, hint: 'no estoque', tone: 'border-slate-300 text-slate-600' },
    { foco: 'rascunhos', label: 'Rascunhos', value: counts.rascunhos, hint: 'aguardando finalizar', tone: 'border-sky-400 text-sky-700' },
  ]

  const tabLabel: Record<Foco, string> = {
    todos: 'Todos', campo: 'Em campo', multi: 'Operadores com +1', manutencao: 'Manutenção',
    devolvidos: 'Devolvidos', rascunhos: 'Rascunhos',
  }

  const hasExtraFilters = contrato !== 'todos' || centro_custo !== 'todos' || supervisor !== 'todos'

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500">Gestão</p>
          <h1 className="mt-1 text-3xl font-black text-slate-900">Termos</h1>
          <p className="mt-1 text-sm text-slate-500">Quem está com cada equipamento, em um só lugar.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isAdmin && (
            <ExportPdfButton
              terms={pdfTerms}
              filters={{ q: params.q ?? '', status: pdfStatus, manutencao: pdfManutencao, contrato, centro_custo, supervisor }}
            />
          )}
          <Link href="/transferencias" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700 hover:bg-emerald-100 transition">
            Transferir
          </Link>
          <Link href="/termos/novo" className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700 transition">
            + Novo termo
          </Link>
        </div>
      </div>

      {bannerMessage && (
        <div className={`rounded-xl px-4 py-3 text-sm font-medium ${
          params.draft_finalize_error || params.acao_erro
            ? 'bg-red-50 border border-red-200 text-red-700'
            : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
        }`}>
          {bannerMessage}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {kpis.map(k => (
          <Link
            key={k.foco}
            href={href({ foco: foco === k.foco ? undefined : k.foco })}
            className={`rounded-2xl border-t-4 bg-white p-4 shadow-sm transition hover:shadow-md ${k.tone.split(' ')[0]} ${foco === k.foco ? 'ring-2 ring-indigo-300' : ''}`}
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{k.label}</p>
            <p className={`mt-1 text-3xl font-black ${k.tone.split(' ')[1]}`}>{k.value}</p>
            <p className="text-xs text-slate-400">{k.hint}</p>
          </Link>
        ))}
      </div>

      <form className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        {foco !== 'todos' && <input type="hidden" name="foco" value={foco} />}
        {visao !== 'operador' && <input type="hidden" name="visao" value={visao} />}
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            name="q"
            defaultValue={params.q ?? ''}
            placeholder="Buscar por operador, RE, patrimônio ou nº do termo"
            className={`${fieldClass} min-w-64 flex-1`}
          />
          <button type="submit" className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700 transition">
            Buscar
          </button>
          {(params.q || hasExtraFilters || foco !== 'todos') && (
            <Link href="/termos" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-100 transition">
              Limpar
            </Link>
          )}
        </div>
        <details className="group mt-3" open={hasExtraFilters}>
          <summary className="cursor-pointer select-none text-xs font-semibold text-indigo-600">
            Mais filtros{hasExtraFilters ? ' (ativos)' : ''}
          </summary>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <div>
              <label className={labelClass}>Contrato</label>
              <select name="contrato" defaultValue={contrato} className={fieldClass}>
                <option value="todos">Todos</option>
                {contratos.map(item => <option key={item} value={item}>{formatDisplayLabel(item)}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Centro de custo</label>
              <select name="centro_custo" defaultValue={centro_custo} className={fieldClass}>
                <option value="todos">Todos</option>
                {centrosCusto.map(item => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Supervisor</label>
              <select name="supervisor" defaultValue={supervisor} className={fieldClass}>
                <option value="todos">Todos</option>
                {supervisores.map(item => <option key={item} value={item}>{displayName(item)}</option>)}
              </select>
            </div>
          </div>
        </details>
      </form>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {FOCOS.map(f => (
            <Link
              key={f}
              href={href({ foco: f === 'todos' ? undefined : f })}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                foco === f ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
              }`}
            >
              {tabLabel[f]} <span className={foco === f ? 'text-indigo-200' : 'text-slate-400'}>{counts[f]}</span>
            </Link>
          ))}
        </div>
        <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-bold">
          {([['operador', 'Por operador'], ['lista', 'Lista']] as const).map(([v, label]) => (
            <Link
              key={v}
              href={href({ visao: v === 'operador' ? undefined : v })}
              className={`rounded-lg px-3 py-1.5 transition ${visao === v ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      {filteredTerms.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-12 text-center text-sm text-slate-400 shadow-sm">
          Nenhum termo encontrado com os filtros atuais.
        </div>
      ) : visao === 'operador' ? (
        <div className="space-y-3">
          <p className="text-sm text-slate-500">
            <span className="font-bold text-slate-800">{plural(groups.length, 'operador', 'operadores')}</span> · {plural(filteredTerms.length, 'termo', 'termos')}
          </p>
          {groups.map(g => {
            const active = g.terms.filter(isActive)
            const total = g.reserva ? active.length : (activeByOperator.get(g.matricula) ?? 0)
            const open = !!q || foco === 'multi'
            return (
              <details key={g.key} open={open} className="group rounded-2xl border border-slate-200 bg-white shadow-sm open:shadow-md">
                <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
                  <span className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                    g.reserva ? 'bg-violet-100 text-violet-700' : total > 1 ? 'bg-amber-100 text-amber-800' : 'bg-indigo-100 text-indigo-700'
                  }`}>
                    {g.reserva ? 'R' : initials(g.nome)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="font-semibold text-slate-900">{g.nome}</span>
                      {!g.reserva && <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-600">RE {g.matricula}</span>}
                      <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-xs font-medium text-emerald-700">{g.funcao}</span>
                      <span className="rounded-md bg-sky-50 px-1.5 py-0.5 text-xs font-medium text-sky-700">CC {g.centro}</span>
                    </span>
                    <span className="mt-1.5 flex flex-wrap gap-1.5">
                      {g.terms.map(t => (
                        <span
                          key={t.id}
                          title={`${t.tipo_equipamento}${t.status === 'DEVOLVIDO' ? ' (devolvido)' : ''}`}
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                            t.status === 'DEVOLVIDO' ? 'bg-slate-100 text-slate-400 line-through'
                            : t.em_manutencao ? 'bg-amber-100 text-amber-800'
                            : 'bg-violet-100 text-violet-700'
                          }`}
                        >
                          {t.patrimonio}
                        </span>
                      ))}
                    </span>
                  </span>
                  {total > 1 && (
                    <span className="flex-shrink-0 rounded-full bg-amber-500 px-2.5 py-1 text-xs font-bold text-white">
                      {total} em campo
                    </span>
                  )}
                  <span className="flex-shrink-0 text-slate-400 transition group-open:rotate-90">▶</span>
                </summary>
                <div className="divide-y divide-slate-100 border-t border-slate-100">
                  {g.terms.map(t => (
                    <div key={t.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 pl-[4.25rem] text-sm">
                      <div className="min-w-48 flex-1">
                        <p className="font-semibold text-slate-800">
                          {t.tipo_equipamento} <span className="ml-1 rounded-full bg-violet-100 px-2 py-0.5 text-xs font-bold text-violet-700">{t.patrimonio}</span>
                        </p>
                        <Link href={`/termos/${t.id}`} className="text-xs text-slate-400 hover:text-indigo-600 hover:underline">{t.numero_termo}</Link>
                      </div>
                      <span className="text-xs text-slate-500">desde {formatDate(t.data_entrega)}</span>
                      <StatusBadges term={t} />
                      <TermActions term={t} userName={userName} today={today} />
                    </div>
                  ))}
                </div>
              </details>
            )
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="hidden grid-cols-[1.4fr_1.2fr_1fr_0.8fr_1.6fr] gap-4 rounded-t-2xl border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 md:grid">
            <div>Operador</div>
            <div>Equipamento</div>
            <div>Situação</div>
            <div>Entrega</div>
            <div>Ações</div>
          </div>
          <div className="divide-y divide-slate-100">
            {filteredTerms.map(t => {
              const n = t.is_reserva ? 0 : (activeByOperator.get(t.matricula) ?? 0)
              return (
                <div key={t.id} className="grid items-center gap-x-4 gap-y-2 px-4 py-3 text-sm transition hover:bg-slate-50 md:grid-cols-[1.4fr_1.2fr_1fr_0.8fr_1.6fr]">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {t.is_reserva ? `Reserva · CC ${t.centro_custo}` : displayName(t.funcionario_nome)}
                      {n > 1 && <span className="ml-2 rounded-full bg-amber-500 px-2 py-0.5 text-xs font-bold text-white">{n} em campo</span>}
                    </p>
                    <p className="text-xs text-slate-400">{t.is_reserva ? t.supervisor : `RE ${t.matricula} · CC ${t.centro_custo}`}</p>
                  </div>
                  <div>
                    <p className="text-slate-800">
                      {t.tipo_equipamento} <span className="ml-1 rounded-full bg-violet-100 px-2 py-0.5 text-xs font-bold text-violet-700">{t.patrimonio}</span>
                    </p>
                    <Link href={`/termos/${t.id}`} className="text-xs text-slate-400 hover:text-indigo-600 hover:underline">{t.numero_termo}</Link>
                  </div>
                  <StatusBadges term={t} />
                  <div className="text-slate-600">{formatDate(t.data_entrega)}</div>
                  <TermActions term={t} userName={userName} today={today} />
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
