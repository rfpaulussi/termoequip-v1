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
  centro_custo: string
  em_manutencao: boolean
}
export type PanelEmployee = { id: string; nome_completo: string; re: string }

function SubmitButton({ count }: { count: number }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending || count === 0}
      className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white hover:bg-indigo-700 transition disabled:opacity-50"
    >
      {pending ? 'Transferindo…' : `Transferir ${count} patrimônio(s)`}
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

  const owners = useMemo(() => {
    const map = new Map<string, { matricula: string; nome: string; terms: PanelTerm[] }>()
    for (const t of terms) {
      const o = map.get(t.matricula) ?? { matricula: t.matricula, nome: t.funcionario_nome, terms: [] }
      o.terms.push(t)
      map.set(t.matricula, o)
    }
    return [...map.values()].sort((a, b) => a.nome.localeCompare(b.nome))
  }, [terms])

  const q = search.trim().toLowerCase()
  const visibleOwners = q
    ? owners.filter(o =>
        o.nome.toLowerCase().includes(q) ||
        o.matricula.toLowerCase().includes(q) ||
        o.terms.some(t => t.patrimonio.toLowerCase().includes(q)))
    : owners

  const owner = owners.find(o => o.matricula === origem) ?? null
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
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          className={`${fieldClass} mb-3`}
          placeholder="Buscar por nome, RE ou patrimônio"
        />
        <select value={origem} onChange={e => pickOwner(e.target.value)} className={fieldClass}>
          <option value="">Selecione o responsável atual ({visibleOwners.length})</option>
          {visibleOwners.map(o => (
            <option key={o.matricula} value={o.matricula}>
              {o.nome} — RE: {o.matricula} ({o.terms.length} patrimônio(s))
            </option>
          ))}
        </select>
      </div>

      <NewEmployeeInline returnTo="/transferencias" centroCusto={owner?.terms[0].centro_custo ?? ''} funcoes={funcoes} />

      {owner && (
        <form action={transferBatchAction} className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">2. Quais patrimônios?</h2>
              <button
                type="button"
                onClick={() => setSelected(selected.size === owner.terms.length ? new Set() : new Set(owner.terms.map(t => t.id)))}
                className="text-xs font-semibold text-indigo-600 hover:underline"
              >
                {selected.size === owner.terms.length ? 'Desmarcar todos' : 'Marcar todos'}
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
                    <span className="text-slate-500">{t.tipo_equipamento}</span>
                    <span className="ml-auto text-xs text-slate-400">CC {t.centro_custo}</span>
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
                    <option key={e.id} value={e.id}>{e.nome_completo} — RE: {e.re}</option>
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
              <SubmitButton count={selected.size} />
            </div>
          </div>
        </form>
      )}
    </div>
  )
}
