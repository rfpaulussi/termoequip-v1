'use client'

import { useState } from 'react'
import { createEmployeeInlineAction } from '@/app/actions/employee-inline'

const fieldClass = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'
const labelClass = 'mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500'

function maskCpf(value: string) {
  const d = value.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 3) return d
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
}

type Props = {
  /** Página para onde voltar após cadastrar (recebe ?novo=<id> do funcionário criado). */
  returnTo: string
  centroCusto: string
  funcoes: { nome: string }[]
}

export default function NewEmployeeInline({ returnTo, centroCusto, funcoes }: Props) {
  const [cpf, setCpf] = useState('')

  return (
    <details className="mb-3 rounded-xl border border-slate-200 bg-white">
      <summary className="cursor-pointer select-none px-4 py-2.5 text-sm font-semibold text-indigo-600">
        + Cadastrar novo operador
      </summary>
      <form action={createEmployeeInlineAction} className="grid gap-3 border-t border-slate-100 p-4 md:grid-cols-2">
        <input type="hidden" name="return_to" value={returnTo} />
        <input type="hidden" name="centro_custo" value={centroCusto} />
        <div className="md:col-span-2">
          <label className={labelClass}>Nome completo *</label>
          <input name="nome_completo" required className={fieldClass} />
        </div>
        <div>
          <label className={labelClass}>RE *</label>
          <input name="re" required className={fieldClass} />
        </div>
        <div>
          <label className={labelClass}>CPF *</label>
          <input
            name="cpf"
            required
            value={cpf}
            onChange={e => setCpf(maskCpf(e.target.value))}
            className={fieldClass}
            placeholder="000.000.000-00"
            inputMode="numeric"
            maxLength={14}
          />
        </div>
        <div className="md:col-span-2">
          <label className={labelClass}>Função *</label>
          <select name="funcao" required defaultValue="" className={fieldClass}>
            <option value="">Selecione</option>
            {funcoes.map(f => (
              <option key={f.nome} value={f.nome}>{f.nome}</option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2 flex items-center gap-3">
          <button type="submit" className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 transition">
            Cadastrar e selecionar
          </button>
          {centroCusto && <span className="text-xs text-slate-400">Centro de custo: {centroCusto}</span>}
        </div>
      </form>
    </details>
  )
}
