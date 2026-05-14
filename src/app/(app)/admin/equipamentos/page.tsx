'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

type EquipmentType = {
  id: string
  tipo: string
  marca: string
  modelo: string
  ativo: boolean
}

export default function AdminEquipamentosPage() {
  const supabase = createClient()
  const [itens, setItens] = useState<EquipmentType[]>([])
  const [loading, setLoading] = useState(true)
  const [tipo, setTipo] = useState('')
  const [marca, setMarca] = useState('')
  const [modelo, setModelo] = useState('')
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [salvando, setSalvando] = useState(false)

  async function carregar() {
    setLoading(true)
    const { data } = await supabase
      .from('equipment_types')
      .select('*')
      .order('tipo')
      .order('marca')
      .order('modelo')
    if (data) setItens(data)
    setLoading(false)
  }

  useEffect(() => { carregar() }, [])

  async function adicionar() {
    setErro('')
    setSucesso('')
    if (!tipo.trim() || !marca.trim() || !modelo.trim()) {
      setErro('Preencha tipo, marca e modelo.')
      return
    }
    setSalvando(true)
    const { error } = await supabase
      .from('equipment_types')
      .insert({ tipo: tipo.trim(), marca: marca.trim(), modelo: modelo.trim() })
    setSalvando(false)
    if (error) {
      setErro(error.code === '23505' ? 'Essa combinação tipo/marca/modelo já existe.' : error.message)
    } else {
      setSucesso(`"${tipo} ${marca} ${modelo}" adicionado.`)
      setTipo('')
      setMarca('')
      setModelo('')
      carregar()
    }
  }

  async function toggleAtivo(item: EquipmentType) {
    await supabase
      .from('equipment_types')
      .update({ ativo: !item.ativo })
      .eq('id', item.id)
    carregar()
  }

  const ativos = itens.filter(i => i.ativo)
  const inativos = itens.filter(i => !i.ativo)

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tipos de Equipamento</h1>
          <p className="mt-1 text-sm text-slate-500">Cadastre novos equipamentos sem mexer no código.</p>
        </div>
        <Link href="/admin" className="rounded-xl border border-green-200 bg-white px-4 py-2 text-sm font-semibold text-green-800 hover:bg-green-50">
          Voltar
        </Link>
      </div>

      <div className="mb-8 rounded-2xl border border-green-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-semibold text-slate-800">Adicionar novo equipamento</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Tipo *</label>
            <input
              value={tipo}
              onChange={e => setTipo(e.target.value)}
              placeholder="Ex: Roçadeira"
              className="w-full rounded-xl border border-green-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Marca *</label>
            <input
              value={marca}
              onChange={e => setMarca(e.target.value)}
              placeholder="Ex: Stihl"
              className="w-full rounded-xl border border-green-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Modelo *</label>
            <input
              value={modelo}
              onChange={e => setModelo(e.target.value)}
              placeholder="Ex: FS 291"
              className="w-full rounded-xl border border-green-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />
          </div>
        </div>
        {erro && <p className="mt-3 text-sm text-red-600">{erro}</p>}
        {sucesso && <p className="mt-3 text-sm text-green-700">{sucesso}</p>}
        <button
          onClick={adicionar}
          disabled={salvando}
          className="mt-4 rounded-xl bg-green-600 px-5 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
        >
          {salvando ? 'Salvando...' : 'Adicionar'}
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Carregando...</p>
      ) : (
        <>
          <h3 className="mb-3 text-sm font-semibold text-slate-700">Ativos ({ativos.length})</h3>
          <div className="mb-6 space-y-2">
            {ativos.map(item => (
              <div key={item.id} className="flex items-center justify-between rounded-xl border border-green-100 bg-white px-4 py-3 shadow-sm">
                <div>
                  <span className="text-sm font-medium text-slate-800">{item.tipo}</span>
                  <span className="mx-2 text-slate-300">·</span>
                  <span className="text-sm text-slate-600">{item.marca}</span>
                  <span className="mx-2 text-slate-300">·</span>
                  <span className="text-sm text-slate-500">{item.modelo}</span>
                </div>
                <button
                  onClick={() => toggleAtivo(item)}
                  className="text-xs text-red-500 hover:underline"
                >
                  Desativar
                </button>
              </div>
            ))}
            {ativos.length === 0 && <p className="text-sm text-slate-400">Nenhum equipamento ativo.</p>}
          </div>

          {inativos.length > 0 && (
            <>
              <h3 className="mb-3 text-sm font-semibold text-slate-400">Inativos ({inativos.length})</h3>
              <div className="space-y-2">
                {inativos.map(item => (
                  <div key={item.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 opacity-60">
                    <div>
                      <span className="text-sm font-medium text-slate-400 line-through">{item.tipo}</span>
                      <span className="mx-2 text-slate-300">·</span>
                      <span className="text-sm text-slate-400 line-through">{item.marca}</span>
                      <span className="mx-2 text-slate-300">·</span>
                      <span className="text-sm text-slate-400 line-through">{item.modelo}</span>
                    </div>
                    <button
                      onClick={() => toggleAtivo(item)}
                      className="text-xs text-green-600 hover:underline"
                    >
                      Reativar
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
