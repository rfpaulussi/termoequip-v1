'use client'

import { useEffect, useMemo, useState } from 'react'

type Pair = {
  contrato: string
  centro_custo: string
}

type Option = {
  value: string
  label: string
}

type Props = {
  initial: {
    inicio: string
    fim: string
    tipo_evento: string
    contratos: string[]
    centros_custo: string[]
    supervisor: string
    status: string
    manutencao: string
    q: string
  }
  contratoOptions: Option[]
  centroCustoOptions: Option[]
  supervisorOptions: string[]
  pairs: Pair[]
}

function MultiSelectBox({
  label,
  options,
  selected,
  onChange,
  emptyText,
}: {
  label: string
  options: Option[]
  selected: string[]
  onChange: (next: string[]) => void
  emptyText: string
}) {
  function toggle(value: string) {
    if (selected.includes(value)) {
      onChange(selected.filter((item) => item !== value))
    } else {
      onChange([...selected, value])
    }
  }

  function clearAll() {
    onChange([])
  }

  const summaryText =
    selected.length === 0
      ? 'Todos'
      : selected.length === 1
      ? options.find((item) => item.value === selected[0])?.label ?? '1 selecionado'
      : `${selected.length} selecionados`

  return (
    <div>
      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </label>

      <details className="group relative">
        <summary className="flex cursor-pointer list-none items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none transition hover:border-indigo-400">
          <span className={selected.length === 0 ? 'text-black' : 'font-medium'}>
            {summaryText}
          </span>
          <span className="text-xs text-gray-500 group-open:rotate-180 transition">▼</span>
        </summary>

        <div className="absolute z-20 mt-2 max-h-72 w-full overflow-auto rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              {selected.length} selecionado(s)
            </span>
            <button
              type="button"
              onClick={clearAll}
              className="text-xs font-semibold text-indigo-600 hover:underline"
            >
              Limpar
            </button>
          </div>

          {options.length === 0 ? (
            <div className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-500">
              {emptyText}
            </div>
          ) : (
            <div className="space-y-2">
              {options.map((option) => (
                <label
                  key={option.value}
                  className="flex items-start gap-2 rounded-lg px-2 py-2 text-sm text-black hover:bg-slate-50"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(option.value)}
                    onChange={() => toggle(option.value)}
                    className="mt-1"
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </details>
    </div>
  )
}

export default function AuditoriaFilters({
  initial,
  contratoOptions,
  centroCustoOptions,
  supervisorOptions,
  pairs,
}: Props) {
  const [inicio, setInicio] = useState(initial.inicio)
  const [fim, setFim] = useState(initial.fim)
  const [tipoEvento, setTipoEvento] = useState(initial.tipo_evento)
  const [selectedContratos, setSelectedContratos] = useState<string[]>(initial.contratos)
  const [selectedCentros, setSelectedCentros] = useState<string[]>(initial.centros_custo)
  const [supervisor, setSupervisor] = useState(initial.supervisor)
  const [status, setStatus] = useState(initial.status)
  const [manutencao, setManutencao] = useState(initial.manutencao)
  const [q, setQ] = useState(initial.q)

  const availableContratos = useMemo(() => {
    if (selectedCentros.length === 0) return contratoOptions

    const allowed = new Set(
      pairs
        .filter((pair) => selectedCentros.includes(pair.centro_custo))
        .map((pair) => pair.contrato)
    )

    return contratoOptions.filter((item) => allowed.has(item.value))
  }, [selectedCentros, contratoOptions, pairs])

  const availableCentros = useMemo(() => {
    if (selectedContratos.length === 0) return centroCustoOptions

    const allowed = new Set(
      pairs
        .filter((pair) => selectedContratos.includes(pair.contrato))
        .map((pair) => pair.centro_custo)
    )

    return centroCustoOptions.filter((item) => allowed.has(item.value))
  }, [selectedContratos, centroCustoOptions, pairs])

  useEffect(() => {
    const valid = new Set(availableContratos.map((item) => item.value))
    setSelectedContratos((current) => current.filter((item) => valid.has(item)))
  }, [availableContratos])

  useEffect(() => {
    const valid = new Set(availableCentros.map((item) => item.value))
    setSelectedCentros((current) => current.filter((item) => valid.has(item)))
  }, [availableCentros])

  return (
    <form method="GET" action="/auditoria" className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <input type="hidden" name="contratos" value={selectedContratos.join(',')} />
      <input type="hidden" name="centros_custo" value={selectedCentros.join(',')} />

      <div className="grid gap-4 md:grid-cols-5">
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Data inicial
          </label>
          <input
            type="date"
            name="inicio"
            value={inicio}
            onChange={(e) => setInicio(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-400"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Data final
          </label>
          <input
            type="date"
            name="fim"
            value={fim}
            onChange={(e) => setFim(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-400"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Tipo de evento
          </label>
          <select
            name="tipo_evento"
            value={tipoEvento}
            onChange={(e) => setTipoEvento(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-400"
          >
            <option value="todos">Todos</option>
            <option value="TERM_CREATED">Termo criado</option>
            <option value="DELIVERY_REGISTERED">Entrega registrada</option>
            <option value="MAINTENANCE_ON">Entrou em manutenção</option>
            <option value="MAINTENANCE_OFF">Saiu de manutenção</option>
            <option value="RETURN_REGISTERED">Devolução registrada</option>
          </select>
        </div>

        <MultiSelectBox
          label="Contrato"
          options={availableContratos}
          selected={selectedContratos}
          onChange={setSelectedContratos}
          emptyText="Nenhum contrato disponível com os centros selecionados."
        />

        <MultiSelectBox
          label="Centro de custo"
          options={availableCentros}
          selected={selectedCentros}
          onChange={setSelectedCentros}
          emptyText="Nenhum centro de custo disponível com os contratos selecionados."
        />

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Supervisor
          </label>
          <select
            name="supervisor"
            value={supervisor}
            onChange={(e) => setSupervisor(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-400"
          >
            <option value="todos">Todos</option>
            {supervisorOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Status do termo
          </label>
          <select
            name="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-400"
          >
            <option value="todos">Todos</option>
            <option value="ENTREGUE">Entregue</option>
            <option value="DEVOLVIDO">Devolvido à sede</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Manutenção
          </label>
          <select
            name="manutencao"
            value={manutencao}
            onChange={(e) => setManutencao(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-400"
          >
            <option value="todos">Todos</option>
            <option value="em_manutencao">Em manutenção</option>
            <option value="sem_manutencao">Sem manutenção</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Busca livre
          </label>
          <input
            type="text"
            name="q"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Termo, funcionário, matrícula, patrimônio, contrato..."
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-black placeholder:text-gray-400 outline-none focus:border-indigo-400"
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="submit"
          className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-700"
        >
          Aplicar filtros
        </button>

        <a
          href="/auditoria"
          className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          Limpar filtros
        </a>
      </div>

      <div className="mt-3 text-xs text-slate-500">
        Contrato e centro de custo ficam relacionados para evitar cruzamentos inconsistentes.
      </div>
    </form>
  )
}
