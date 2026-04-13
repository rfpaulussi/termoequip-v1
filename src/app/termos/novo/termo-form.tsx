'use client'

import { useMemo, useState } from 'react'
import { createTermAction } from './actions'
import {
  CONTRACT_OPTIONS,
  DELIVERY_STATE_OPTIONS,
  EQUIPMENT_OPTIONS,
  FUNCTION_OPTIONS,
} from './form-options'

const fieldClassName =
  'w-full rounded-xl border border-green-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100'

export default function TermoForm({ today }: { today: string }) {
  const [selectedCentroCusto, setSelectedCentroCusto] = useState('')
  const [selectedContrato, setSelectedContrato] = useState('')

  const [selectedTipo, setSelectedTipo] = useState('')
  const [selectedMarca, setSelectedMarca] = useState('')
  const [selectedModelo, setSelectedModelo] = useState('')

  const equipmentTypes = useMemo(
    () => [...new Set(EQUIPMENT_OPTIONS.map((item) => item.tipo))].sort((a, b) => a.localeCompare(b)),
    []
  )

  const availableBrands = useMemo(
    () =>
      [...new Set(
        EQUIPMENT_OPTIONS
          .filter((item) => item.tipo === selectedTipo)
          .map((item) => item.marca)
      )].sort((a, b) => a.localeCompare(b)),
    [selectedTipo]
  )

  const availableModels = useMemo(
    () =>
      EQUIPMENT_OPTIONS
        .filter((item) => item.tipo === selectedTipo && item.marca === selectedMarca)
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

  return (
    <form action={createTermAction} className="space-y-8">
      <section className="rounded-3xl border border-green-100 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">
          Dados operacionais
        </h2>

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
              required
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
              required
            >
              <option value="">Selecione o contrato</option>
              {CONTRACT_OPTIONS.map((item) => (
                <option key={item.contrato} value={item.contrato}>
                  {item.contrato}
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
              required
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
        <h2 className="text-xl font-semibold text-slate-900">
          Dados do colaborador
        </h2>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="md:col-span-1">
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Nome do funcionário *
            </label>
            <input
              name="funcionario_nome"
              className={fieldClassName}
              placeholder="Nome completo"
              required
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
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Função *
            </label>
            <select
              name="funcao"
              className={fieldClassName}
              required
              defaultValue=""
            >
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
        <h2 className="text-xl font-semibold text-slate-900">
          Dados do equipamento
        </h2>

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
              required
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
              required
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
              required
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
              required
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
              required
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
        <button
          type="submit"
          className="rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white hover:bg-green-700"
        >
          Salvar termo
        </button>

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
