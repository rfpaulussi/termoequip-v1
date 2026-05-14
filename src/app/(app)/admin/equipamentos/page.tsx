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
      .order('tipo').order('marca').order('modelo')
    if (data) setItens(data)
    setLoading(false)
  }

  useEffect(() => { carregar() }, [])

  async function adicionar() {
    setErro('')
    setSucesso('')
    if (!tipo.trim() || !marca.trim() || !modelo.trim()) { setErro('Preencha tipo, marca e modelo.'); return }
    setSalvando(true)
    const { error } = await supabase.from('equipment_types').insert({ tipo: tipo.trim(), marca: marca.trim(), modelo: modelo.trim() })
    setSalvando(false)
    if (error) {
      setErro(error.code === '23505' ? 'Essa combinação tipo/marca/modelo já existe.' : error.message)
    } else {
      setSucesso(`"${tipo} · ${marca} · ${modelo}" adicionado.`)
      setTipo(''); setMarca(''); setModelo('')
      carregar()
    }
  }

  async function toggleAtivo(item: EquipmentType) {
    await supabase.from('equipment_types').update({ ativo: !item.ativo }).eq('id', item.id)
    carregar()
  }

  const ativos = itens.filter(i => i.ativo)
  const inativos = itens.filter(i => !i.ativo)
  const fieldClass = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Administração</p>
          <h1 className="mt-1 text-3xl font-black text-slate-900">Equipamentos</h1>
          <p className="mt-1 text-sm text-slate-500">Cadastre e gerencie tipos sem mexer no código.</p>
        </div>
        <Link href="/admin" className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition">
          ← Admin
        </Link>
      </div>

      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6">
        <h2 className="font-bold text-slate-800 mb-4">Adicionar novo equipamento</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Tipo *</label>
            <input value={tipo} onChange={e => setTipo(e.target.value)} placeholder="Ex: Roçadeira" className={fieldClass} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Marca *</label>
            <input value={marca} onChange={e => setMarca(e.target.value)} placeholder="Ex: Stihl" className={fieldClass} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Modelo *</label>
            <input value={modelo} onChange={e => setModelo(e.target.value)} placeholder="Ex: FS 291" className={fieldClass} />
          </div>
        </div>
        {erro && <p className="mt-3 text-sm text-red-600">{erro}</p>}
        {sucesso && <p className="mt-3 text-sm text-emerald-700">{sucesso}</p>}
        <button onClick={adicionar} disabled={salvando}
          className="mt-4 rounded-xl bg-indigo-600 px-5 py-2 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-60 transition">
          {salvando ? 'Salvando...' : 'Adicionar'}
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Carregando...</p>
      ) : (
        <>
          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">Ativos <span className="text-slate-400 font-normal">({ativos.length})</span></h3>
            </div>
            {ativos.length === 0 ? (
              <p className="px-6 py-6 text-sm text-slate-400">Nenhum equipamento ativo.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {ativos.map(item => (
                  <div key={item.id} className="flex items-center justify-between px-6 py-3">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-semibold text-slate-800">{item.tipo}</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-slate-600">{item.marca}</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-slate-500">{item.modelo}</span>
                    </div>
                    <button onClick={() => toggleAtivo(item)} className="text-xs text-red-500 hover:underline">Desativar</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {inativos.length > 0 && (
            <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden opacity-60">
              <div className="px-6 py-4 border-b border-slate-100">
                <h3 className="font-bold text-slate-500">Inativos <span className="font-normal">({inativos.length})</span></h3>
              </div>
              <div className="divide-y divide-slate-100">
                {inativos.map(item => (
                  <div key={item.id} className="flex items-center justify-between px-6 py-3">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium text-slate-400 line-through">{item.tipo}</span>
                      <span className="text-slate-200">·</span>
                      <span className="text-slate-400 line-through">{item.marca}</span>
                      <span className="text-slate-200">·</span>
                      <span className="text-slate-400 line-through">{item.modelo}</span>
                    </div>
                    <button onClick={() => toggleAtivo(item)} className="text-xs text-emerald-600 hover:underline">Reativar</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
