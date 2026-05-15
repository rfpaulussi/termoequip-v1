'use client'

import { useState, useCallback } from 'react'
import { getUnitByPatrimonio } from '@/app/actions/equipment-units'

interface Props {
  onResolve?: (data: {
    numero_patrimonio: string
    numero_serie: string
    equipment_type_id: string
    tipo: string
    marca: string
    modelo: string
  } | null) => void
}

export function PatrimonioInput({ onResolve }: Props) {
  const [patrimonio, setPatrimonio] = useState('')
  const [serie, setSerie] = useState('')
  const [equipamento, setEquipamento] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'found' | 'notfound'>('idle')

  const lookup = useCallback(async (value: string) => {
    if (value.length < 3) {
      setSerie('')
      setEquipamento('')
      setStatus('idle')
      onResolve?.(null)
      return
    }

    setStatus('loading')
    const unit = await getUnitByPatrimonio(value)

    if (unit) {
      setSerie(unit.numero_serie)
      setEquipamento(`${unit.equipment_types?.tipo} — ${unit.equipment_types?.marca} ${unit.equipment_types?.modelo}`)
      setStatus('found')
      onResolve?.({
        numero_patrimonio: unit.numero_patrimonio,
        numero_serie: unit.numero_serie,
        equipment_type_id: unit.equipment_type_id,
        tipo: unit.equipment_types?.tipo ?? '',
        marca: unit.equipment_types?.marca ?? '',
        modelo: unit.equipment_types?.modelo ?? ''
      })
    } else {
      setSerie('')
      setEquipamento('')
      setStatus('notfound')
      onResolve?.(null)
    }
  }, [onResolve])

  return (
    <div className="space-y-3">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Nº Patrimônio <span className="text-red-500">*</span>
        </label>
        <input
          value={patrimonio}
          onChange={e => {
            setPatrimonio(e.target.value)
            lookup(e.target.value)
          }}
          placeholder="Digite o número do patrimônio"
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <p className="mt-1 text-xs text-slate-400">
          O número de série será preenchido automaticamente ao digitar o patrimônio.
        </p>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Nº Série
        </label>
        <input
          value={status === 'loading' ? 'Buscando...' : serie}
          readOnly
          placeholder="Preenchido automaticamente"
          className={`w-full rounded-lg border px-3 py-2 text-sm bg-slate-50 cursor-not-allowed
            ${status === 'found' ? 'border-emerald-300 text-emerald-700' : ''}
            ${status === 'notfound' ? 'border-red-200 text-red-400' : ''}
            ${status === 'idle' || status === 'loading' ? 'border-slate-200 text-slate-400' : ''}
          `}
        />
        {status === 'notfound' && (
          <p className="mt-1 text-xs text-red-400">
            Patrimônio não encontrado. Verifique o número ou cadastre a unidade no admin.
          </p>
        )}
        {status === 'found' && equipamento && (
          <p className="mt-1 text-xs text-emerald-600">{equipamento}</p>
        )}
      </div>
    </div>
  )
}
