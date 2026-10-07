'use client'

import { useMemo, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { transferBatchAction } from './actions'
import NewEmployeeInline from '@/components/new-employee-inline'

const fieldClass = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'
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

/** Nomes vindos do GI/termos antigos chegam em CAIXA ALTA; exibe em Título. */
function displayName(name: string) {
  if (name !== name.toUpperCase()) return name
  return name
    .toLowerCase()
    .replace(/(^|\s)(\p{L})/gu, (_, sp: string, ch: string) => sp + ch.toUpperCase())
    .replace(/\b(Da|De|Do|Das|Dos|E)\b/g, m => m.toLowerCase())
}

function plural(n: number, one: string, many: string) {
  return `${n} ${n === 1 ? one : many}`
}

function formatDate(value: string | null) {
  if (!value) return null
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d.toLocaleDateString('pt-BR')
}

function SubmitButton({ count }: { count: number }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending || count === 0}
      className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white hover:bg-indigo-700 transition disabled:opacity-50"
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
}

export default function TransferPanel({ terms, employees, funcoes, preselectEmployee }: Props) {
  const [search, setSearch] = useState('')
  const [origem, setOrigem] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())

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
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-slate-800">1. De quem?</h2>
        <div className="mb-3 grid gap-3 md:grid-cols-4">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={`${fieldClass} md:col-span-4`}
            placeholder="Buscar por nome, RE ou patrimônio"
          />
          <select value={centro} onChange={e => setCentro(e.target.value)} className={fieldClass} aria-label="Centro de custo">
            <option value="">Todos os centros de custo</option>
            {centros.map(c => <option key={c} value={c}>CC {c}</option>)}
          </select>
          <select value={tipo} onChange={e => setTipo(e.target.value)} className={fieldClass} aria-label="Tipo de equipamento">
            <option value="">Todos os equipamentos</option>
            {tipos.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            <input type="checkbox" checked={manutencao} onChange={e => setManutencao(e.target.checked)} className="h-4 w-4" />
            Só em manutenção
          </label>
          {hasFilters && (
            <button
              type="button"
              onClick={() => { setCentro(''); setTipo(''); setManutencao(false) }}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Limpar filtros
            </button>
          )}
        </div>
        <p className="mb-2 text-xs text-slate-500">
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
                className={`flex w-full flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 text-left text-sm transition hover:bg-slate-50 ${
                  o.matricula === origem ? 'bg-indigo-50 ring-1 ring-inset ring-indigo-200' : ''
                }`}
              >
                <span className="font-semibold text-slate-800">{o.nome}</span>
                <span className="text-xs text-slate-500">RE {o.matricula}</span>
                <span className="text-xs text-slate-500">{o.funcao}</span>
                <span className="text-xs text-slate-400">CC {[...new Set(o.terms.map(t => t.centro_custo))].join(', ')}</span>
                <span className="ml-auto rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                  {plural(o.terms.length, 'patrimônio', 'patrimônios')}
                </span>
                <span className="basis-full text-xs text-slate-400">
                  {o.terms.map(t => t.patrimonio).join(' · ')}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <NewEmployeeInline returnTo="/transferencias" centroCusto={owner?.terms[0].centro_custo ?? ''} funcoes={funcoes} />

      {owner && (
        <form action={transferBatchAction} className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">2. Quais patrimônios?</h2>
              <button
                type="button"
                onClick={() => setSelected(selectedCount === owner.terms.length ? new Set() : new Set(owner.terms.map(t => t.id)))}
                className="text-xs font-semibold text-indigo-600 hover:underline"
              >
                {selectedCount === owner.terms.length ? 'Desmarcar todos' : 'Marcar todos'}
              </button>
            </div>
            <ul className="divide-y divide-slate-100 rounded-xl border border-slate-100">
              {owner.terms.map(t => (
                <li key={t.id}>
                  <label className="flex cursor-pointer items-center gap-3 px-4 py-3 text-sm hover:bg-slate-50">
                    <input
                      type="checkbox"
                      name="term_ids"
                      value={t.id}
                      checked={selected.has(t.id)}
                      onChange={() => toggle(t.id)}
                      className="h-4 w-4"
                    />
                    <span className="font-semibold text-slate-800">{t.patrimonio}</span>
                    <span className="text-slate-600">{t.tipo_equipamento}</span>
                    {t.marca_modelo && <span className="text-xs text-slate-400">{t.marca_modelo}</span>}
                    <span className="ml-auto text-xs text-slate-400">
                      {formatDate(t.data_entrega) ? `com ele desde ${formatDate(t.data_entrega)} · ` : ''}CC {t.centro_custo}
                    </span>
                    {t.em_manutencao && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">EM MANUTENÇÃO</span>
                    )}
                  </label>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-slate-800">3. Para quem?</h2>
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
