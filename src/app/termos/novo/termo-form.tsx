'use client'

import { useEffect, useMemo, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { createTermAction } from './actions'
import {
  CONTRACT_OPTIONS,
  DELIVERY_STATE_OPTIONS,
  EQUIPMENT_OPTIONS,
  FUNCTION_OPTIONS,
} from './form-options'
import { formatDisplayLabel } from '@/lib/format-display'

const fieldClassName =
  'w-full rounded-xl border border-green-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 disabled:bg-slate-100 disabled:text-slate-400'

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? 'Salvando termo...' : 'Salvar termo'}
    </button>
  )
}

function ProgressBar() {
  const { pending } = useFormStatus()

  if (!pending) return null

  return (
    <div className="mb-4 overflow-hidden rounded-full border border-green-200 bg-white">
      <div className="h-2 w-full bg-green-100">
        <div className="h-2 w-1/3 animate-[pulse_1.1s_ease-in-out_infinite] rounded-full bg-green-600" />
      </div>
      <div className="px-3 py-2 text-xs font-medium text-green-700">
        Processando cadastro do termo...
      </div>
    </div>
  )
}

export default function TermoForm({
  today,
  serverError,
}: {
  today: string
  serverError?: string
}) {
  const [selectedCentroCusto, setSelectedCentroCusto] = useState('')
  const [selectedContrato, setSelectedContrato] = useState('')
  const [selectedTipo, setSelectedTipo] = useState('')
  const [selectedMarca, setSelectedMarca] = useState('')
  const [selectedModelo, setSelectedModelo] = useState('')
  const [clientError, setClientError] = useState('')

  const effectiveError = clientError || serverError || ''

  useEffect(() => {
    if (effectiveError) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    }
  }, [effectiveError])

  const equipmentTypes = useMemo(
    () =>
      [...new Set(EQUIPMENT_OPTIONS.map((item) => item.tipo))].sort((a, b) =>
        a.localeCompare(b)
      ),
    []
  )

  const availableBrands = useMemo(
    () =>
      [
        ...new Set(
          EQUIPMENT_OPTIONS.filter((item) => item.tipo === selectedTipo).map(
            (item) => item.marca
          )
        ),
      ].sort((a, b) => a.localeCompare(b)),
    [selectedTipo]
  )

  const availableModels = useMemo(
    () =>
      EQUIPMENT_OPTIONS.filter(
        (item) => item.tipo === selectedTipo && item.marca === selectedMarca
      )
        .map((item) => item.modelo)
        .sort((a, b) => a.localeCompare(b)),
    [selectedTipo, selectedMarca]
  )

  function handleCentroCustoChange(value: string) {
    setSelectedCentroCusto(value)
    const pair = CONTRACT_OPTIONS.find((item) => item.centro_custo === value)
    setSelectedContrato(pair?.contrato ?? '')
  }

  function handleContratoChange(value: string) {
    setSelectedContrato(value)
    const pair = CONTRACT_OPTIONS.find((item) => item.contrato === value)
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
      { key: 'funcao', label: 'Função' },
      { key: 'tipo_equipamento', label: 'Tipo do equipamento' },
      { key: 'marca', label: 'Marca' },
      { key: 'modelo', label: 'Modelo' },
      { key: 'patrimonio', label: 'Patrimônio' },
      { key: 'estado_entrega', label: 'Estado na entrega' },
    ]

    const missing = requiredFields.find(({ key }) => {
      const value = String(formData.get(key) ?? '').trim()
      return !value
    })

    if (missing) {
      return `Preencha o campo obrigatório: ${missing.label}.`
    }

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
    <form action={createTermAction} onSubmit={handleSubmit} noValidate className="space-y-8">
      <ProgressBar />

      {effectiveError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {effectiveError}
        </div>
      ) : null}

      <section className="rounded-3xl border border-green-100 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Dados operacionais</h2>

        <p className="mt-2 text-sm text-slate-500">
          Centro de custo e contrato ficam vinculados para evitar combinação incorreta.
        </p>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Centro de custo *
            </label>
            <select
              name="centro_custo"
              value={selectedCentroCusto}
              onChange={(e) => handleCentroCustoChange(e.target.value)}
              className={fieldClassName}
            >
              <option value="">Selecione o centro de custo</option>
              {CONTRACT_OPTIONS.map((item) => (
                <option key={item.centro_custo} value={item.centro_custo}>
                  {item.centro_custo}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Contrato *
            </label>
            <select
              name="contrato"
              value={selectedContrato}
              onChange={(e) => handleContratoChange(e.target.value)}
              className={fieldClassName}
            >
              <option value="">Selecione o contrato</option>
              {CONTRACT_OPTIONS.map((item) => (
                <option key={formatDisplayLabel(item.contrato)} value={formatDisplayLabel(item.contrato)}>
                  {formatDisplayLabel(item.contrato)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Supervisor responsável *
            </label>
            <input
              name="supervisor"
              className={fieldClassName}
              placeholder="Nome do supervisor"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Encarregado responsável
            </label>
            <input
              name="encarregado"
              className={fieldClassName}
              placeholder="Nome do encarregado"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Data da entrega
            </label>
            <input
              type="date"
              name="data_entrega"
              defaultValue={today}
              className={fieldClassName}
            />
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-green-100 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Dados do colaborador</h2>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="md:col-span-1">
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Nome do funcionário *
            </label>
            <input
              name="funcionario_nome"
              className={fieldClassName}
              placeholder="Nome completo"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Matrícula / Registro *
            </label>
            <input
              name="matricula"
              className={fieldClassName}
              placeholder="Número de registro"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Função *
            </label>
            <select name="funcao" className={fieldClassName} defaultValue="">
              <option value="">Selecione a função</option>
              {FUNCTION_OPTIONS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-green-100 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Dados do equipamento</h2>

        <p className="mt-2 text-sm text-slate-500">
          Tipo, marca e modelo ficam encadeados para evitar combinação inválida.
        </p>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Tipo do equipamento *
            </label>
            <select
              name="tipo_equipamento"
              value={selectedTipo}
              onChange={(e) => handleTipoChange(e.target.value)}
              className={fieldClassName}
            >
              <option value="">Selecione o tipo</option>
              {equipmentTypes.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Marca *
            </label>
            <select
              name="marca"
              value={selectedMarca}
              onChange={(e) => handleMarcaChange(e.target.value)}
              className={fieldClassName}
              disabled={!selectedTipo}
            >
              <option value="">Selecione a marca</option>
              {availableBrands.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Modelo *
            </label>
            <select
              name="modelo"
              value={selectedModelo}
              onChange={(e) => setSelectedModelo(e.target.value)}
              className={fieldClassName}
              disabled={!selectedMarca}
            >
              <option value="">Selecione o modelo</option>
              {availableModels.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Número de série
            </label>
            <input
              name="numero_serie"
              className={fieldClassName}
              placeholder="Número de série"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Patrimônio *
            </label>
            <input
              name="patrimonio"
              className={fieldClassName}
              placeholder="Número do patrimônio"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Estado na entrega *
            </label>
            <select
              name="estado_entrega"
              className={fieldClassName}
              defaultValue="Bom estado"
            >
              {DELIVERY_STATE_OPTIONS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Acessórios
            </label>
            <input
              name="acessorios"
              className={fieldClassName}
              placeholder="Carregador, bateria, maleta..."
            />
          </div>

          <div className="md:col-span-3">
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Observações
            </label>
            <textarea
              name="observacoes"
              rows={4}
              className={fieldClassName}
              placeholder="Observações adicionais"
            />
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <SubmitButton />

        <a
          href="/termos"
          className="rounded-xl border border-green-200 bg-white px-5 py-3 text-sm font-semibold text-green-800 hover:bg-green-50"
        >
          Cancelar
        </a>
      </div>
    </form>
  )
}
