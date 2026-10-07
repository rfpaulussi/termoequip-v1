'use client'

import { useMemo, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { transferBatchAction } from './actions'
import NewEmployeeInline from '@/components/new-employee-inline'
import { displayName, plural } from '@/lib/display-name'

const fieldClass = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'
const activeField = 'border-indigo-400 bg-indigo-50/60'
const labelClass = 'mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500'

export type PanelTerm = {
  id: string
  patrimonio: string
  tipo_equipamento: string
  funcionario_nome: string
  matricula: string
  funcao: string
  centro_custo: string
  em_manutencao: boolean
  marca_modelo: string
  data_entrega: string | null
}
export type PanelEmployee = { id: string; nome_completo: string; re: string; funcao: string }

function formatDate(value: string | null) {
  if (!value) return null
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d.toLocaleDateString('pt-BR')
}

const STEP_COLORS = {
  indigo: { badge: 'bg-indigo-600', top: 'border-t-indigo-500', sub: 'text-indigo-600' },
  violet: { badge: 'bg-violet-600', top: 'border-t-violet-500', sub: 'text-violet-600' },
  emerald: { badge: 'bg-emerald-600', top: 'border-t-emerald-500', sub: 'text-emerald-600' },
} as const

function StepHeader({ n, title, hint, color }: { n: number; title: string; hint: string; color: keyof typeof STEP_COLORS }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <span className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${STEP_COLORS[color].badge}`}>
        {n}
      </span>
      <div>
        <h2 className="text-lg font-bold leading-tight text-slate-800">{title}</h2>
        <p className={`text-xs font-medium ${STEP_COLORS[color].sub}`}>{hint}</p>
      </div>
    </div>
  )
}

function SubmitButton({ count }: { count: number }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending || count === 0}
      className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 transition disabled:bg-slate-300 disabled:text-slate-500"
    >
      {pending ? 'Transferindo…' : count === 0 ? 'Selecione ao menos um patrimônio' : `Transferir ${plural(count, 'patrimônio', 'patrimônios')}`}
    </button>
  )
}

type Props = {
  terms: PanelTerm[]
  employees: PanelEmployee[]
  funcoes: { nome: string }[]
  preselectEmployee: string
  preselectOwner?: string
}

export default function TransferPanel({ terms, employees, funcoes, preselectEmployee, preselectOwner = '' }: Props) {
  const [search, setSearch] = useState('')
  const [origem, setOrigem] = useState(preselectOwner)
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(terms.filter(t => t.matricula === preselectOwner).map(t => t.id)),
  )

  const [centro, setCentro] = useState('')
  const [tipo, setTipo] = useState('')
  const [manutencao, setManutencao] = useState(false)

  const centros = useMemo(() => [...new Set(terms.map(t => t.centro_custo))].sort(), [terms])
  const tipos = useMemo(() => [...new Set(terms.map(t => t.tipo_equipamento))].sort(), [terms])
  const filteredTerms = useMemo(
    () => terms.filter(t =>
      (!centro || t.centro_custo === centro) &&
      (!tipo || t.tipo_equipamento === tipo) &&
      (!manutencao || t.em_manutencao)),
    [terms, centro, tipo, manutencao],
  )
  const hasFilters = !!(centro || tipo || manutencao)

  const owners = useMemo(() => {
    const map = new Map<string, { matricula: string; nome: string; funcao: string; terms: PanelTerm[] }>()
    for (const t of filteredTerms) {
      const o = map.get(t.matricula) ?? { matricula: t.matricula, nome: displayName(t.funcionario_nome), funcao: t.funcao, terms: [] }
      o.terms.push(t)
      map.set(t.matricula, o)
    }
    return [...map.values()].sort((a, b) => a.nome.localeCompare(b.nome))
  }, [filteredTerms])

  const q = search.trim().toLowerCase()
  const visibleOwners = q
    ? owners.filter(o =>
        o.nome.toLowerCase().includes(q) ||
        o.matricula.toLowerCase().includes(q) ||
        o.terms.some(t => t.patrimonio.toLowerCase().includes(q)))
    : owners

  const owner = owners.find(o => o.matricula === origem) ?? null
  const selectedCount = owner ? owner.terms.filter(t => selected.has(t.id)).length : 0
  const destinos = employees.filter(e => e.re !== origem)

  function pickOwner(matricula: string) {
    setOrigem(matricula)
    const o = owners.find(x => x.matricula === matricula)
    setSelected(new Set(o ? o.terms.map(t => t.id) : []))
  }

  function toggle(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="space-y-6">
      <div className={`rounded-2xl border border-t-4 border-slate-200 bg-white p-6 shadow-sm ${STEP_COLORS.indigo.top}`}>
        <StepHeader n={1} title="De quem?" hint="Quem entrega os patrimônios" color="indigo" />
        <div className="mb-3 grid gap-3 md:grid-cols-4">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={`${fieldClass} md:col-span-4 ${search ? activeField : ''}`}
            placeholder="Buscar por nome, RE ou patrimônio"
          />
          <select value={centro} onChange={e => setCentro(e.target.value)} className={`${fieldClass} ${centro ? activeField : ''}`} aria-label="Centro de custo">
            <option value="">Todos os centros de custo</option>
            {centros.map(c => <option key={c} value={c}>CC {c}</option>)}
          </select>
          <select value={tipo} onChange={e => setTipo(e.target.value)} className={`${fieldClass} ${tipo ? activeField : ''}`} aria-label="Tipo de equipamento">
            <option value="">Todos os equipamentos</option>
            {tipos.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <label className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm ${manutencao ? 'border-amber-300 bg-amber-50 font-semibold text-amber-800' : 'border-slate-200 bg-slate-50 text-slate-700'}`}>
            <input type="checkbox" checked={manutencao} onChange={e => setManutencao(e.target.checked)} className="h-4 w-4" />
            Só em manutenção
          </label>
          {hasFilters && (
            <button
              type="button"
              onClick={() => { setCentro(''); setTipo(''); setManutencao(false) }}
              className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600 hover:bg-rose-100"
            >
              Limpar filtros
            </button>
          )}
        </div>
        <p className="mb-2 rounded-lg bg-indigo-50 px-3 py-2 text-xs font-medium text-indigo-700">
          {plural(visibleOwners.length, 'responsável', 'responsáveis')} com{' '}
          {plural(visibleOwners.reduce((n, o) => n + o.terms.length, 0), 'patrimônio', 'patrimônios')} em campo
          {hasFilters || q ? ' (com filtros aplicados)' : ''}. Clique para escolher.
        </p>
        <ul className="max-h-80 divide-y divide-slate-100 overflow-auto rounded-xl border border-slate-100">
          {visibleOwners.length === 0 && (
            <li className="px-4 py-6 text-center text-sm text-slate-400">Nenhum responsável encontrado com esses filtros.</li>
          )}
          {visibleOwners.map(o => (
            <li key={o.matricula}>
              <button
                type="button"
                onClick={() => pickOwner(o.matricula)}
                className={`flex w-full items-start gap-3 border-l-4 px-4 py-3 text-left text-sm transition ${
                  o.matricula === origem
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-transparent hover:border-indigo-200 hover:bg-slate-50'
                }`}
              >
                <span className={`mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  o.matricula === origem ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-700'
                }`}>
                  {o.nome.split(' ').filter(Boolean).slice(0, 2).map(p => p[0]).join('').toUpperCase()}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="font-semibold text-slate-900">{o.nome}</span>
                    <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-600">RE {o.matricula}</span>
                    <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-xs font-medium text-emerald-700">{o.funcao}</span>
                    <span className="rounded-md bg-sky-50 px-1.5 py-0.5 text-xs font-medium text-sky-700">
                      CC {[...new Set(o.terms.map(t => t.centro_custo))].join(', ')}
                    </span>
                  </span>
                  <span className="mt-1.5 flex flex-wrap gap-1.5">
                    {o.terms.map(t => (
                      <span
                        key={t.id}
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          t.em_manutencao ? 'bg-amber-100 text-amber-800' : 'bg-violet-100 text-violet-700'
                        }`}
                        title={t.em_manutencao ? `${t.tipo_equipamento} (em manutenção)` : t.tipo_equipamento}
                      >
                        {t.patrimonio}
                      </span>
                    ))}
                  </span>
                </span>
                <span className="flex-shrink-0 rounded-full bg-indigo-600 px-2.5 py-0.5 text-xs font-bold text-white">
                  {plural(o.terms.length, 'patrimônio', 'patrimônios')}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <NewEmployeeInline returnTo="/transferencias" centroCusto={owner?.terms[0].centro_custo ?? ''} funcoes={funcoes} />

      {owner && (
        <form action={transferBatchAction} className="space-y-6">
          <div className={`rounded-2xl border border-t-4 border-slate-200 bg-white p-6 shadow-sm ${STEP_COLORS.violet.top}`}>
            <div className="flex items-start justify-between">
              <StepHeader n={2} title="Quais patrimônios?" hint={`${selectedCount} de ${owner.terms.length} marcado(s) de ${owner.nome}`} color="violet" />
              <button
                type="button"
                onClick={() => setSelected(selectedCount === owner.terms.length ? new Set() : new Set(owner.terms.map(t => t.id)))}
                className="rounded-lg bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700 hover:bg-violet-100"
              >
                {selectedCount === owner.terms.length ? 'Desmarcar todos' : 'Marcar todos'}
              </button>
            </div>
            <ul className="divide-y divide-slate-100 rounded-xl border border-slate-100">
              {owner.terms.map(t => (
                <li key={t.id}>
                  <label className={`flex cursor-pointer items-center gap-3 border-l-4 px-4 py-3 text-sm transition ${selected.has(t.id) ? 'border-violet-500 bg-violet-50' : 'border-transparent hover:bg-slate-50'}`}>
                    <input
                      type="checkbox"
                      name="term_ids"
                      value={t.id}
                      checked={selected.has(t.id)}
                      onChange={() => toggle(t.id)}
                      className="h-4 w-4 accent-violet-600"
                    />
                    <span className="rounded-full bg-violet-100 px-2.5 py-0.5 font-bold text-violet-700">{t.patrimonio}</span>
                    <span className="font-medium text-slate-700">{t.tipo_equipamento}</span>
                    {t.marca_modelo && <span className="text-xs text-slate-400">{t.marca_modelo}</span>}
                    <span className="ml-auto text-xs text-slate-500">
                      {formatDate(t.data_entrega) ? `com ele desde ${formatDate(t.data_entrega)} · ` : ''}CC {t.centro_custo}
                    </span>
                    {t.em_manutencao && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">EM MANUTENÇÃO</span>
                    )}
                  </label>
                </li>
              ))}
            </ul>
          </div>

          <div className={`rounded-2xl border border-t-4 border-slate-200 bg-white p-6 shadow-sm ${STEP_COLORS.emerald.top}`}>
            <StepHeader n={3} title="Para quem?" hint="Quem passa a ser o responsável" color="emerald" />
            <div className="grid gap-3 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className={labelClass}>Novo responsável *</label>
                <select name="employee_id" defaultValue={preselectEmployee} required className={fieldClass}>
                  <option value="">Selecione</option>
                  {destinos.map(e => (
                    <option key={e.id} value={e.id}>{displayName(e.nome_completo)} — RE {e.re} · {e.funcao}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Data da transferência *</label>
                <input type="date" name="data_transferencia" defaultValue={new Date().toISOString().slice(0, 10)} required className={fieldClass} />
              </div>
              <div>
                <label className={labelClass}>Condição dos equipamentos *</label>
                <select name="condicao" defaultValue="EM_PERFEITO_ESTADO" required className={fieldClass}>
                  <option value="EM_PERFEITO_ESTADO">Em perfeito estado</option>
                  <option value="COM_DEFEITO">Com defeito</option>
                  <option value="FALTANDO_PECAS">Faltando peças</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Observações</label>
                <textarea name="observacoes" rows={2} className={fieldClass} />
              </div>
            </div>
            <div className="mt-4">
              <SubmitButton count={selectedCount} />
            </div>
          </div>
        </form>
      )}
    </div>
  )
}
