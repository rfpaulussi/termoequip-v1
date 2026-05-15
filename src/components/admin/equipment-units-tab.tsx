'use client'

import { useState, useTransition } from 'react'
import { addEquipmentUnit, importEquipmentUnits, deactivateEquipmentUnit } from '@/app/actions/equipment-units'

interface EquipmentType {
  id: string
  tipo: string
  marca: string
  modelo: string
}

interface EquipmentUnit {
  id: string
  numero_serie: string
  numero_patrimonio: string
  equipment_types?: {
    tipo: string
    marca: string
    modelo: string
  }
}

interface Props {
  units: EquipmentUnit[]
  types: EquipmentType[]
}

export function EquipmentUnitsTab({ units, types }: Props) {
  const [isPending, startTransition] = useTransition()
  const [selectedTypeId, setSelectedTypeId] = useState('')
  const [serie, setSerie] = useState('')
  const [patrimonio, setPatrimonio] = useState('')
  const [importError, setImportError] = useState('')
  const [importSuccess, setImportSuccess] = useState('')

  function handleAdd() {
    if (!selectedTypeId || !serie || !patrimonio) return
    startTransition(async () => {
      await addEquipmentUnit({
        equipment_type_id: selectedTypeId,
        numero_serie: serie,
        numero_patrimonio: patrimonio
      })
      setSelectedTypeId('')
      setSerie('')
      setPatrimonio('')
    })
  }

  function handleCSV(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImportError('')
    setImportSuccess('')

    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
      const header = lines[0].toLowerCase()

      if (!header.includes('tipo') || !header.includes('serie') || !header.includes('patrimonio')) {
        setImportError('CSV inválido. Cabeçalho esperado: Tipo, Marca, Modelo, Nº Serie, Nº Patrimonio')
        return
      }

      const rows = lines.slice(1).map(line => {
        const cols = line.split(',').map(c => c.trim())
        return {
          tipo: cols[0],
          marca: cols[1],
          modelo: cols[2],
          numero_serie: cols[3],
          numero_patrimonio: cols[4]
        }
      }).filter(r => r.tipo && r.numero_serie && r.numero_patrimonio)

      if (rows.length === 0) {
        setImportError('Nenhuma linha válida encontrada no CSV.')
        return
      }

      startTransition(async () => {
        await importEquipmentUnits(rows)
        setImportSuccess(`${rows.length} unidade(s) importada(s) com sucesso.`)
        e.target.value = ''
      })
    }
    reader.readAsText(file)
  }

  function handleDeactivate(id: string) {
    startTransition(async () => {
      await deactivateEquipmentUnit(id)
    })
  }

  return (
    <div className="space-y-8">

      {/* Cadastro manual */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 font-semibold text-slate-800">Adicionar unidade</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <select
            value={selectedTypeId}
            onChange={e => setSelectedTypeId(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="">Selecione o equipamento</option>
            {types.map(t => (
              <option key={t.id} value={t.id}>
                {t.tipo} — {t.marca} {t.modelo}
              </option>
            ))}
          </select>
          <input
            value={patrimonio}
            onChange={e => setPatrimonio(e.target.value)}
            placeholder="Nº Patrimônio *"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <input
            value={serie}
            onChange={e => setSerie(e.target.value)}
            placeholder="Nº Série *"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
        <button
          onClick={handleAdd}
          disabled={isPending || !selectedTypeId || !serie || !patrimonio}
          className="mt-4 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-40"
        >
          {isPending ? 'Salvando...' : 'Adicionar'}
        </button>
      </div>

      {/* Importação CSV */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-1 font-semibold text-slate-800">Importar via CSV</h3>
        <p className="mb-4 text-xs text-slate-500">
          Colunas obrigatórias na ordem: <span className="font-mono">Tipo, Marca, Modelo, Nº Serie, Nº Patrimonio</span>
        </p>
        <input
          type="file"
          accept=".csv"
          onChange={handleCSV}
          className="text-sm text-slate-600"
        />
        {importError && <p className="mt-2 text-xs text-red-500">{importError}</p>}
        {importSuccess && <p className="mt-2 text-xs text-emerald-600">{importSuccess}</p>}
      </div>

      {/* Lista de unidades ativas */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 font-semibold text-slate-800">
          Unidades ativas <span className="text-slate-400">({units.length})</span>
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs font-medium text-slate-500">
                <th className="pb-2 pr-4">Equipamento</th>
                <th className="pb-2 pr-4">Patrimônio</th>
                <th className="pb-2 pr-4">Série</th>
                <th className="pb-2"></th>
              </tr>
            </thead>
            <tbody>
              {units.map(u => (
                <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="py-2 pr-4 text-slate-700">
                    {u.equipment_types?.tipo} — {u.equipment_types?.marca} {u.equipment_types?.modelo}
                  </td>
                  <td className="py-2 pr-4 font-mono text-slate-700">{u.numero_patrimonio}</td>
                  <td className="py-2 pr-4 font-mono text-slate-500">{u.numero_serie}</td>
                  <td className="py-2 text-right">
                    <button
                      onClick={() => handleDeactivate(u.id)}
                      disabled={isPending}
                      className="text-xs text-red-400 hover:text-red-600 disabled:opacity-40"
                    >
                      Desativar
                    </button>
                  </td>
                </tr>
              ))}
              {units.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-sm text-slate-400">
                    Nenhuma unidade cadastrada ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
