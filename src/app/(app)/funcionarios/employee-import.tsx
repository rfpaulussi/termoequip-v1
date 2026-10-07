'use client'

import { useState, useTransition } from 'react'
import { parseEmployeeCsv, isValidCpf, type ImportRow } from '@/lib/employee-import'
import { importEmployeesAction, type ImportResult } from './actions'

export default function EmployeeImport() {
  const [open, setOpen] = useState(false)
  const [rows, setRows] = useState<ImportRow[]>([])
  const [fileName, setFileName] = useState('')
  const [parseError, setParseError] = useState('')
  const [result, setResult] = useState<ImportResult | null>(null)
  const [pending, startTransition] = useTransition()

  async function onFile(file: File | undefined) {
    setResult(null)
    if (!file) return
    const parsed = parseEmployeeCsv(await file.text())
    setFileName(file.name)
    setParseError(parsed.error ?? '')
    setRows(parsed.rows)
  }

  function submit() {
    startTransition(async () => {
      try {
        setResult(await importEmployeesAction(rows))
      } catch {
        setResult({ ok: false, created: 0, errors: [], message: 'Falha na importação. Tente novamente.' })
      }
    })
  }

  const invalidCpf = rows.filter(r => !isValidCpf(r.cpf)).length

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Importar funcionários (CSV)</h2>
          <p className="text-sm text-slate-500">
            Colunas: nome_completo, re, cpf, funcao, centro_custo. Aceita separador vírgula ou ponto e vírgula.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          {open ? 'Fechar' : 'Importar'}
        </button>
      </div>

      {open && (
        <div className="mt-4 space-y-4">
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={e => onFile(e.target.files?.[0])}
            className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-indigo-700"
          />

          {parseError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{parseError}</div>
          )}

          {rows.length > 0 && !result && (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                <strong>{fileName}</strong>: {rows.length} linha(s) lida(s)
                {invalidCpf > 0 && <span className="text-amber-700"> — {invalidCpf} com CPF inválido (serão recusadas)</span>}.
              </p>
              <div className="max-h-56 overflow-auto rounded-xl border border-slate-100">
                <table className="w-full text-xs">
                  <tbody className="divide-y divide-slate-100">
                    {rows.slice(0, 50).map((r, i) => (
                      <tr key={i}>
                        <td className="px-3 py-2 font-medium text-slate-800">{r.nome_completo}</td>
                        <td className="px-3 py-2 text-slate-600">{r.re}</td>
                        <td className="px-3 py-2 text-slate-600">{r.cpf}</td>
                        <td className="px-3 py-2 text-slate-600">{r.funcao}</td>
                        <td className="px-3 py-2 text-slate-500">{r.centro_custo ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button
                type="button"
                disabled={pending}
                onClick={submit}
                className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {pending ? 'Importando…' : `Importar ${rows.length} funcionário(s)`}
              </button>
            </div>
          )}

          {result && (
            <div className="space-y-2">
              {result.message && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{result.message}</div>
              )}
              {!result.message && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                  {result.created} cadastrado(s){result.errors.length > 0 && `, ${result.errors.length} recusado(s)`}.
                </div>
              )}
              {result.errors.length > 0 && (
                <ul className="max-h-48 overflow-auto rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900 space-y-1">
                  {result.errors.map((e, i) => (
                    <li key={i}>Linha {e.line} — {e.nome}: {e.motivo}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
