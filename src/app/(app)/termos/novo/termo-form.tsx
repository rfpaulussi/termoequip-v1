'use client'

import { useEffect, useMemo, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { createClient } from '@/lib/supabase/client'
import { DELIVERY_STATE_OPTIONS } from './form-options'

const fieldClassName =
  'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-100 disabled:text-slate-400'

function onlyDigits(value: string) {
  return value.replace(/\D/g, '').slice(0, 11)
}

function maskCpf(value: string) {
  const digits = onlyDigits(value)
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`
}

function isValidCPF(value: string) {
  const cpf = onlyDigits(value)
  if (cpf.length !== 11) return false
  if (/^(\d)\1{10}$/.test(cpf)) return false
  let sum = 0
  for (let i = 0; i < 9; i++) sum += Number(cpf[i]) * (10 - i)
  let remainder = (sum * 10) % 11
  if (remainder === 10) remainder = 0
  if (remainder !== Number(cpf[9])) return false
  sum = 0
  for (let i = 0; i < 10; i++) sum += Number(cpf[i]) * (11 - i)
  remainder = (sum * 10) % 11
  if (remainder === 10) remainder = 0
  return remainder === Number(cpf[10])
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? 'Salvando...' : label}
    </button>
  )
}

function ProgressBar() {
  const { pending } = useFormStatus()
  if (!pending) return null
  return (
    <div className="mb-4 overflow-hidden rounded-full border border-indigo-100 bg-white">
      <div className="h-2 w-full bg-indigo-100">
        <div className="h-2 w-1/3 animate-[pulse_1.1s_ease-in-out_infinite] rounded-full bg-indigo-600" />
      </div>
      <div className="px-3 py-2 text-xs font-medium text-indigo-600">
        Processando salvamento do rascunho...
      </div>
    </div>
  )
}

type EquipmentRow = { tipo: string; marca: string; modelo: string }
type ContractRow = { centro_custo: string; contrato: string }
type FunctionRow = { nome: string }

type FormValues = {
  id?: string
  centro_custo?: string
  contrato?: string
  supervisor?: string
  encarregado?: string
  data_entrega?: string
  funcionario_nome?: string
  matricula?: string
  cpf?: string
  funcao?: string
  tipo_equipamento?: string
  marca?: string
  modelo?: string
  numero_serie?: string
  patrimonio?: string
  estado_entrega?: string
  acessorios?: string
  observacoes?: string
}

export default function TermoForm({
  today,
  serverError,
  initialValues,
  submitLabel,
  cancelHref,
  formAction,
  centrosCusto,
}: {
  today: string
  serverError?: string
  initialValues?: FormValues
  submitLabel: string
  cancelHref: string
  formAction: (formData: FormData) => void | Promise<void>
  centrosCusto?: string[] | null
}) {
  const supabase = createClient()
  const [equipmentOptions, setEquipmentOptions] = useState<EquipmentRow[]>([])
  const [contractOptions, setContractOptions] = useState<ContractRow[]>([])
  const [functionOptions, setFunctionOptions] = useState<FunctionRow[]>([])
  const [loadingEquip, setLoadingEquip] = useState(true)

  const [selectedCentroCusto, setSelectedCentroCusto] = useState(initialValues?.centro_custo ?? '')
  const [selectedContrato, setSelectedContrato] = useState(initialValues?.contrato ?? '')
  const [selectedTipo, setSelectedTipo] = useState(initialValues?.tipo_equipamento ?? '')
  const [selectedMarca, setSelectedMarca] = useState(initialValues?.marca ?? '')
  const [selectedModelo, setSelectedModelo] = useState(initialValues?.modelo ?? '')
  const [cpf, setCpf] = useState(maskCpf(initialValues?.cpf ?? ''))
  const [clientError, setClientError] = useState('')

  const effectiveError = clientError || serverError || ''

  useEffect(() => {
    Promise.all([
      supabase.from('equipment_types').select('tipo, marca, modelo').eq('ativo', true).order('tipo').order('marca').order('modelo'),
      centrosCusto
        ? supabase.from('contracts').select('centro_custo, contrato').eq('ativo', true).in('centro_custo', centrosCusto).order('centro_custo')
        : supabase.from('contracts').select('centro_custo, contrato').eq('ativo', true).order('centro_custo'),
      supabase.from('job_functions').select('nome').eq('ativo', true).order('nome'),
    ]).then(([equip, contracts, functions]) => {
      if (equip.data) setEquipmentOptions(equip.data)
      if (contracts.data) setContractOptions(contracts.data)
      if (functions.data) setFunctionOptions(functions.data)
      setLoadingEquip(false)
    })
  }, [])

  useEffect(() => {
    if (effectiveError) window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [effectiveError])

  const equipmentTypes = useMemo(
    () => [...new Set(equipmentOptions.map(i => i.tipo))].sort((a, b) => a.localeCompare(b)),
    [equipmentOptions]
  )

  const availableBrands = useMemo(
    () => [...new Set(equipmentOptions.filter(i => i.tipo === selectedTipo).map(i => i.marca))].sort((a, b) => a.localeCompare(b)),
    [equipmentOptions, selectedTipo]
  )

  const availableModels = useMemo(
    () => equipmentOptions.filter(i => i.tipo === selectedTipo && i.marca === selectedMarca).map(i => i.modelo).sort((a, b) => a.localeCompare(b)),
    [equipmentOptions, selectedTipo, selectedMarca]
  )

  function handleCentroCustoChange(value: string) {
    setSelectedCentroCusto(value)
    const pair = contractOptions.find(i => i.centro_custo === value)
    setSelectedContrato(pair?.contrato ?? '')
  }

  function handleContratoChange(value: string) {
    setSelectedContrato(value)
    const pair = contractOptions.find(i => i.contrato === value)
    setSelectedCentroCusto(pair?.centro_custo ?? '')
  }

  function handleTipoChange(value: string) {
    setSelectedTipo(value)
    setSelectedMarca('')
    setSelectedModelo('')
  }

  function handleMarcaChange(value: string) {
    setSelectedMarca(value)
    setSelectedModelo('')
  }

  function validateForm(form: HTMLFormElement) {
    const formData = new FormData(form)
    const requiredFields = [
      { key: 'centro_custo', label: 'Centro de custo' },
      { key: 'contrato', label: 'Contrato' },
      { key: 'supervisor', label: 'Supervisor responsável' },
      { key: 'funcionario_nome', label: 'Nome do funcionário' },
      { key: 'matricula', label: 'Matrícula / Registro' },
      { key: 'cpf', label: 'CPF' },
      { key: 'funcao', label: 'Função' },
      { key: 'tipo_equipamento', label: 'Tipo do equipamento' },
      { key: 'marca', label: 'Marca' },
      { key: 'modelo', label: 'Modelo' },
      { key: 'patrimonio', label: 'Patrimônio' },
      { key: 'estado_entrega', label: 'Estado na entrega' },
    ]
    const missing = requiredFields.find(({ key }) => !String(formData.get(key) ?? '').trim())
    if (missing) return `Preencha o campo obrigatório: ${missing.label}.`
    const rawCpf = String(formData.get('cpf') ?? '').trim()
    if (!isValidCPF(rawCpf)) return 'Informe um CPF válido no formato 000.000.000-00.'
    return ''
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const form = e.currentTarget
    const error = validateForm(form)
    if (error) {
      e.preventDefault()
      setClientError(error)
      return
    }
    setClientError('')
  }

  return (
    <form action={formAction} onSubmit={handleSubmit} noValidate className="space-y-8">
      {initialValues?.id ? <input type="hidden" name="id" value={initialValues.id} /> : null}

      <ProgressBar />

      {effectiveError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {effectiveError}
        </div>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Dados operacionais</h2>
        <p className="mt-2 text-sm text-slate-500">
          Rascunhos podem ser revisados e finalizados depois. Neste estágio, o sistema ainda exige os campos estruturais mínimos.
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Centro de custo *</label>
            <select name="centro_custo" value={selectedCentroCusto} onChange={e => handleCentroCustoChange(e.target.value)} className={fieldClassName}>
              <option value="">Selecione o centro de custo</option>
              {contractOptions.map(item => (
                <option key={item.centro_custo} value={item.centro_custo}>{item.centro_custo}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Contrato *</label>
            <select name="contrato" value={selectedContrato} onChange={e => handleContratoChange(e.target.value)} className={fieldClassName}>
              <option value="">Selecione o contrato</option>
              {contractOptions.map(item => (
                <option key={item.contrato} value={item.contrato}>{item.contrato}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Supervisor responsável *</label>
            <input name="supervisor" defaultValue={initialValues?.supervisor ?? ''} className={fieldClassName} placeholder="Nome do supervisor" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Encarregado responsável</label>
            <input name="encarregado" defaultValue={initialValues?.encarregado ?? ''} className={fieldClassName} placeholder="Nome do encarregado" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Data da entrega</label>
            <input type="date" name="data_entrega" defaultValue={initialValues?.data_entrega ?? today} className={fieldClassName} />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Dados do colaborador</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Nome do funcionário *</label>
            <input name="funcionario_nome" defaultValue={initialValues?.funcionario_nome ?? ''} className={fieldClassName} placeholder="Nome completo" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Matrícula / Registro *</label>
            <input name="matricula" defaultValue={initialValues?.matricula ?? ''} className={fieldClassName} placeholder="Número de registro" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">CPF *</label>
            <input name="cpf" value={cpf} onChange={e => setCpf(maskCpf(e.target.value))} className={fieldClassName} placeholder="000.000.000-00" inputMode="numeric" maxLength={14} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Função *</label>
            <select name="funcao" className={fieldClassName} defaultValue={initialValues?.funcao ?? ''}>
              <option value="">Selecione a função</option>
              {functionOptions.map(item => (
                <option key={item.nome} value={item.nome}>{item.nome}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Dados do equipamento</h2>
        <p className="mt-2 text-sm text-slate-500">
          Tipo, marca e modelo ficam encadeados para evitar combinação inválida.
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Tipo do equipamento *</label>
            <select name="tipo_equipamento" value={selectedTipo} onChange={e => handleTipoChange(e.target.value)} className={fieldClassName} disabled={loadingEquip}>
              <option value="">{loadingEquip ? 'Carregando...' : 'Selecione o tipo'}</option>
              {equipmentTypes.map(item => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Marca *</label>
            <select name="marca" value={selectedMarca} onChange={e => handleMarcaChange(e.target.value)} className={fieldClassName} disabled={!selectedTipo || loadingEquip}>
              <option value="">Selecione a marca</option>
              {availableBrands.map(item => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Modelo *</label>
            <select name="modelo" value={selectedModelo} onChange={e => setSelectedModelo(e.target.value)} className={fieldClassName} disabled={!selectedMarca || loadingEquip}>
              <option value="">Selecione o modelo</option>
              {availableModels.map(item => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Número de série</label>
            <input name="numero_serie" defaultValue={initialValues?.numero_serie ?? ''} className={fieldClassName} placeholder="Número de série" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Patrimônio *</label>
            <input name="patrimonio" defaultValue={initialValues?.patrimonio ?? ''} className={fieldClassName} placeholder="Número do patrimônio" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Estado na entrega *</label>
            <select name="estado_entrega" className={fieldClassName} defaultValue={initialValues?.estado_entrega ?? 'Bom estado'}>
              {DELIVERY_STATE_OPTIONS.map(item => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-3">
            <label className="mb-1 block text-sm font-medium text-slate-700">Acessórios</label>
            <input name="acessorios" defaultValue={initialValues?.acessorios ?? ''} className={fieldClassName} placeholder="Carregador, bateria, maleta..." />
          </div>
          <div className="md:col-span-3">
            <label className="mb-1 block text-sm font-medium text-slate-700">Observações</label>
            <textarea name="observacoes" rows={4} defaultValue={initialValues?.observacoes ?? ''} className={fieldClassName} placeholder="Observações adicionais" />
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <SubmitButton label={submitLabel} />
        <a href={cancelHref} className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50">
          Cancelar
        </a>
      </div>
    </form>
  )
}
