'use client'

import { useState } from 'react'
import { createEmployeeAction, updateEmployeeAction } from './actions'

const fieldClass = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'

function maskCpf(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`
}

type ContractOption = { centro_custo: string; contrato: string }
type FuncaoOption = { nome: string }
type EditingEmployee = {
  id: string
  nome_completo: string
  re: string
  cpf: string
  funcao: string
  centro_custo: string | null
} | null

type Props = {
  contratos: ContractOption[]
  funcoes: FuncaoOption[]
  editando: EditingEmployee
}

export default function EmployeeForm({ contratos, funcoes, editando }: Props) {
  const [cpf, setCpf] = useState(maskCpf(editando?.cpf ?? ''))
  const [clientError, setClientError] = useState('')

  function validate(form: HTMLFormElement) {
    const data = new FormData(form)
    const fields = [
      { key: 'nome_completo', label: 'Nome completo' },
      { key: 're', label: 'RE' },
      { key: 'cpf', label: 'CPF' },
      { key: 'funcao', label: 'Função' },
    ]
    for (const { key, label } of fields) {
      if (!String(data.get(key) ?? '').trim()) {
        return `Preencha o campo obrigatório: ${label}.`
      }
    }
    const rawCpf = String(data.get('cpf') ?? '').replace(/\D/g, '')
    if (rawCpf.length !== 11) return 'CPF deve conter 11 dígitos.'
    return ''
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const error = validate(e.currentTarget)
    if (error) {
      e.preventDefault()
      setClientError(error)
    } else {
      setClientError('')
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-slate-800 mb-4">
        {editando ? 'Editar funcionário' : 'Novo funcionário'}
      </h2>

      {clientError && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {clientError}
        </div>
      )}

      <form
        action={editando ? updateEmployeeAction : createEmployeeAction}
        onSubmit={handleSubmit}
        noValidate
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        {editando && <input type="hidden" name="id" value={editando.id} />}

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Nome completo *
          </label>
          <input
            name="nome_completo"
            defaultValue={editando?.nome_completo ?? ''}
            className={fieldClass}
            placeholder="Nome completo"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            RE (Registro de Empregado) *
          </label>
          <input
            name="re"
            defaultValue={editando?.re ?? ''}
            className={fieldClass}
            placeholder="Número de registro"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            CPF *
          </label>
          <input
            name="cpf"
            value={cpf}
            onChange={e => setCpf(maskCpf(e.target.value))}
            className={fieldClass}
            placeholder="000.000.000-00"
            inputMode="numeric"
            maxLength={14}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Função *
          </label>
          <select
            name="funcao"
            defaultValue={editando?.funcao ?? ''}
            className={fieldClass}
          >
            <option value="">Selecione</option>
            {funcoes.map(f => (
              <option key={f.nome} value={f.nome}>{f.nome}</option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Centro de custo
          </label>
          <select
            name="centro_custo"
            defaultValue={editando?.centro_custo ?? ''}
            className={fieldClass}
          >
            <option value="">Nenhum (geral)</option>
            {contratos.map(c => (
              <option key={c.centro_custo} value={c.centro_custo}>
                {c.centro_custo} — {c.contrato}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2 flex items-end gap-3">
          <button
            type="submit"
            className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-700 transition"
          >
            {editando ? 'Salvar alterações' : 'Cadastrar funcionário'}
          </button>
          {editando && (
            <a
              href="/funcionarios"
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancelar
            </a>
          )}
        </div>
      </form>
    </div>
  )
}
