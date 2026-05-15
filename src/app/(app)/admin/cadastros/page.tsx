'use client'

import { useEffect, useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

type Tab = 'contratos' | 'funcoes' | 'equipamentos' | 'unidades' | 'usuarios'

type Contract = { id: string; centro_custo: string; contrato: string; ativo: boolean }
type JobFunction = { id: string; nome: string; ativo: boolean }
type Equipment = { id: string; tipo: string; marca: string; modelo: string; ativo: boolean }
type EquipmentUnit = {
  id: string
  equipment_type_id: string
  numero_serie: string
  numero_patrimonio: string
  ativo: boolean
  equipment_types?: { tipo: string; marca: string; modelo: string }
}
type UserOption = { id: string; full_name: string | null; email: string | null; role: string | null }
type UserContract = { id: string; centro_custo: string | null }

const fieldClass = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'

export default function AdminCadastrosPage() {
  const supabase = createClient()
  const [tab, setTab] = useState<Tab>('contratos')

  // Contratos
  const [contratos, setContratos] = useState<Contract[]>([])
  const [novoCc, setNovoCc] = useState('')
  const [novoContrato, setNovoContrato] = useState('')

  // Funções
  const [funcoes, setFuncoes] = useState<JobFunction[]>([])
  const [novaFuncao, setNovaFuncao] = useState('')

  // Equipamentos (modelos)
  const [equipamentos, setEquipamentos] = useState<Equipment[]>([])
  const [novoTipo, setNovoTipo] = useState('')
  const [novaMarca, setNovaMarca] = useState('')
  const [novoModelo, setNovoModelo] = useState('')

  // Unidades físicas
  const [unidades, setUnidades] = useState<EquipmentUnit[]>([])
  const [novaUnidadeTipoId, setNovaUnidadeTipoId] = useState('')
  const [novaUnidadeSerie, setNovaUnidadeSerie] = useState('')
  const [novaUnidadePatrimonio, setNovaUnidadePatrimonio] = useState('')
  const [importError, setImportError] = useState('')
  const [importSuccess, setImportSuccess] = useState('')
  const [isPending, startTransition] = useTransition()

  // Usuários
  const [usuarios, setUsuarios] = useState<UserOption[]>([])
  const [selectedUserId, setSelectedUserId] = useState('')
  const [userContracts, setUserContracts] = useState<UserContract[]>([])
  const [loadingUserContracts, setLoadingUserContracts] = useState(false)

  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [loading, setLoading] = useState(true)

  function resetMsg() { setErro(''); setSucesso(''); setImportError(''); setImportSuccess('') }

  async function carregarContratos() {
    const { data } = await supabase.from('contracts').select('*').order('centro_custo')
    if (data) setContratos(data)
  }

  async function carregarFuncoes() {
    const { data } = await supabase.from('job_functions').select('*').order('nome')
    if (data) setFuncoes(data)
  }

  async function carregarEquipamentos() {
    const { data } = await supabase.from('equipment_types').select('*').order('tipo').order('marca').order('modelo')
    if (data) setEquipamentos(data)
  }

  async function carregarUnidades() {
    const { data } = await supabase
      .from('equipment_units')
      .select('*, equipment_types(tipo, marca, modelo)')
      .eq('ativo', true)
      .order('created_at', { ascending: false })
    if (data) setUnidades(data)
  }

  async function carregarUsuarios() {
    const { data } = await supabase.from('profiles').select('id, full_name, email, role').eq('is_active', true).order('full_name')
    if (data) setUsuarios(data)
  }

  async function carregarUserContracts(userId: string) {
    setLoadingUserContracts(true)
    const { data } = await supabase.from('user_contracts').select('id, centro_custo').eq('user_id', userId)
    if (data) setUserContracts(data)
    setLoadingUserContracts(false)
  }

  async function handleSelectUser(userId: string) {
    setSelectedUserId(userId)
    setUserContracts([])
    if (userId) await carregarUserContracts(userId)
  }

  async function vincularContrato(centroCusto: string) {
    resetMsg()
    const jaVinculado = userContracts.some(uc => uc.centro_custo === centroCusto)
    if (jaVinculado) return
    const { error } = await supabase.from('user_contracts').insert({ user_id: selectedUserId, centro_custo: centroCusto })
    if (error) { setErro(error.message) }
    else { setSucesso('Contrato vinculado.'); await carregarUserContracts(selectedUserId) }
  }

  async function desvincularContrato(userContractId: string) {
    resetMsg()
    const { error } = await supabase.from('user_contracts').delete().eq('id', userContractId)
    if (error) { setErro(error.message) }
    else { setSucesso('Vínculo removido.'); await carregarUserContracts(selectedUserId) }
  }

  async function carregar() {
    setLoading(true)
    await Promise.all([carregarContratos(), carregarFuncoes(), carregarEquipamentos(), carregarUnidades(), carregarUsuarios()])
    setLoading(false)
  }

  useEffect(() => { carregar() }, [])

  async function adicionarContrato() {
    resetMsg()
    if (!novoCc.trim() || !novoContrato.trim()) { setErro('Preencha centro de custo e contrato.'); return }
    setSalvando(true)
    const { error } = await supabase.from('contracts').insert({ centro_custo: novoCc.trim(), contrato: novoContrato.trim() })
    setSalvando(false)
    if (error) { setErro(error.code === '23505' ? 'Centro de custo ou contrato já existe.' : error.message) }
    else { setSucesso('Contrato adicionado.'); setNovoCc(''); setNovoContrato(''); carregarContratos() }
  }

  async function adicionarFuncao() {
    resetMsg()
    if (!novaFuncao.trim()) { setErro('Preencha o nome da função.'); return }
    setSalvando(true)
    const { error } = await supabase.from('job_functions').insert({ nome: novaFuncao.trim() })
    setSalvando(false)
    if (error) { setErro(error.code === '23505' ? 'Essa função já existe.' : error.message) }
    else { setSucesso('Função adicionada.'); setNovaFuncao(''); carregarFuncoes() }
  }

  async function adicionarEquipamento() {
    resetMsg()
    if (!novoTipo.trim() || !novaMarca.trim() || !novoModelo.trim()) { setErro('Preencha tipo, marca e modelo.'); return }
    setSalvando(true)
    const { error } = await supabase.from('equipment_types').insert({ tipo: novoTipo.trim(), marca: novaMarca.trim(), modelo: novoModelo.trim() })
    setSalvando(false)
    if (error) { setErro(error.code === '23505' ? 'Essa combinação já existe.' : error.message) }
    else { setSucesso('Equipamento adicionado.'); setNovoTipo(''); setNovaMarca(''); setNovoModelo(''); carregarEquipamentos() }
  }

  async function adicionarUnidade() {
    resetMsg()
    if (!novaUnidadeTipoId || !novaUnidadeSerie.trim() || !novaUnidadePatrimonio.trim()) {
      setErro('Selecione o equipamento e preencha série e patrimônio.')
      return
    }
    setSalvando(true)
    const { error } = await supabase.from('equipment_units').insert({
      equipment_type_id: novaUnidadeTipoId,
      numero_serie: novaUnidadeSerie.trim(),
      numero_patrimonio: novaUnidadePatrimonio.trim()
    })
    setSalvando(false)
    if (error) { setErro(error.code === '23505' ? 'Série ou patrimônio já cadastrado.' : error.message) }
    else {
      setSucesso('Unidade adicionada.')
      setNovaUnidadeTipoId('')
      setNovaUnidadeSerie('')
      setNovaUnidadePatrimonio('')
      carregarUnidades()
    }
  }

  async function desativarUnidade(id: string) {
    resetMsg()
    const { error } = await supabase.from('equipment_units').update({ ativo: false }).eq('id', id)
    if (error) { setErro(error.message) }
    else { carregarUnidades() }
  }

  function handleCSV(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImportError('')
    setImportSuccess('')

    const reader = new FileReader()
    reader.onload = async (ev) => {
      const text = ev.target?.result as string
      const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
      const header = lines[0].toLowerCase()

      if (!header.includes('tipo') || !header.includes('serie') || !header.includes('patrimonio')) {
        setImportError('CSV inválido. Cabeçalho esperado: Tipo, Marca, Modelo, Nº Serie, Nº Patrimonio')
        return
      }

      const rows = lines.slice(1).map(line => {
        const cols = line.split(',').map(c => c.trim())
        return { tipo: cols[0], marca: cols[1], modelo: cols[2], numero_serie: cols[3], numero_patrimonio: cols[4] }
      }).filter(r => r.tipo && r.numero_serie && r.numero_patrimonio)

      if (rows.length === 0) {
        setImportError('Nenhuma linha válida encontrada no CSV.')
        return
      }

      startTransition(async () => {
        let erros = 0
        for (const row of rows) {
          let typeId: string

          const { data: tipo } = await supabase
            .from('equipment_types')
            .select('id')
            .eq('tipo', row.tipo)
            .eq('marca', row.marca)
            .eq('modelo', row.modelo)
            .maybeSingle()

          if (!tipo) {
            const { data: novoTipo, error: createError } = await supabase
              .from('equipment_types')
              .insert({ tipo: row.tipo, marca: row.marca, modelo: row.modelo })
              .select('id')
              .single()
            if (createError) { erros++; continue }
            typeId = novoTipo.id
          } else {
            typeId = tipo.id
          }

          const { error } = await supabase
            .from('equipment_units')
            .upsert({ equipment_type_id: typeId, numero_serie: row.numero_serie, numero_patrimonio: row.numero_patrimonio }, { onConflict: 'numero_serie' })

          if (error) erros++
        }

        if (erros > 0) setImportError(`${erros} linha(s) com erro ao importar.`)
        else setImportSuccess(`${rows.length} unidade(s) importada(s) com sucesso.`)
        carregarUnidades()
        carregarEquipamentos()
        e.target.value = ''
      })
    }
    reader.readAsText(file)
  }

  async function toggleContrato(item: Contract) {
    await supabase.from('contracts').update({ ativo: !item.ativo }).eq('id', item.id)
    carregarContratos()
  }

  async function toggleFuncao(item: JobFunction) {
    await supabase.from('job_functions').update({ ativo: !item.ativo }).eq('id', item.id)
    carregarFuncoes()
  }

  async function toggleEquipamento(item: Equipment) {
    await supabase.from('equipment_types').update({ ativo: !item.ativo }).eq('id', item.id)
    carregarEquipamentos()
  }

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'contratos', label: 'Contratos', count: contratos.filter(i => i.ativo).length },
    { key: 'funcoes', label: 'Funções', count: funcoes.filter(i => i.ativo).length },
    { key: 'equipamentos', label: 'Equipamentos', count: equipamentos.filter(i => i.ativo).length },
    { key: 'unidades', label: 'Unidades', count: unidades.length },
    { key: 'usuarios', label: 'Usuários', count: usuarios.length },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Administração</p>
          <h1 className="mt-1 text-3xl font-black text-slate-900">Cadastros</h1>
          <p className="mt-1 text-sm text-slate-500">Gerencie contratos, funções e equipamentos sem mexer no código.</p>
        </div>
        <Link href="/admin" className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition">
          ← Admin
        </Link>
      </div>

      {/* Abas */}
      <div className="flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1 w-fit">
        {tabs.map(t => (
          <button key={t.key} onClick={() => { setTab(t.key); resetMsg() }}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${tab === t.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            {t.label}
            <span className={`ml-2 rounded-full px-1.5 py-0.5 text-xs ${tab === t.key ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-500'}`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {erro && <p className="text-sm text-red-600">{erro}</p>}
      {sucesso && <p className="text-sm text-emerald-700">{sucesso}</p>}

      {loading ? <p className="text-sm text-slate-400">Carregando...</p> : (
        <>
          {/* ABA CONTRATOS */}
          {tab === 'contratos' && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6">
                <h2 className="font-bold text-slate-800 mb-4">Adicionar contrato</h2>
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Centro de custo *</label>
                    <input value={novoCc} onChange={e => setNovoCc(e.target.value)} placeholder="Ex: 1409" className={fieldClass} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Nome do contrato *</label>
                    <input value={novoContrato} onChange={e => setNovoContrato(e.target.value)} placeholder="Ex: PREFEITURA MUNICIPAL DE XYZ" className={fieldClass} />
                  </div>
                </div>
                <button onClick={adicionarContrato} disabled={salvando}
                  className="mt-4 rounded-xl bg-indigo-600 px-5 py-2 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-60 transition">
                  {salvando ? 'Salvando...' : 'Adicionar'}
                </button>
              </div>
              <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-bold text-slate-800">Ativos <span className="text-slate-400 font-normal">({contratos.filter(i => i.ativo).length})</span></h3>
                </div>
                <div className="divide-y divide-slate-100">
                  {contratos.filter(i => i.ativo).map(item => (
                    <div key={item.id} className="flex items-center justify-between px-6 py-3">
                      <div className="text-sm">
                        <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded mr-3">{item.centro_custo}</span>
                        <span className="text-slate-800">{item.contrato}</span>
                      </div>
                      <button onClick={() => toggleContrato(item)} className="text-xs text-red-500 hover:underline ml-4 flex-shrink-0">Desativar</button>
                    </div>
                  ))}
                </div>
                {contratos.filter(i => !i.ativo).length > 0 && (
                  <>
                    <div className="px-6 py-3 border-t border-slate-100 bg-slate-50">
                      <h3 className="text-xs font-semibold text-slate-400">Inativos ({contratos.filter(i => !i.ativo).length})</h3>
                    </div>
                    <div className="divide-y divide-slate-100 opacity-50">
                      {contratos.filter(i => !i.ativo).map(item => (
                        <div key={item.id} className="flex items-center justify-between px-6 py-3">
                          <div className="text-sm">
                            <span className="font-mono text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded mr-3 line-through">{item.centro_custo}</span>
                            <span className="text-slate-400 line-through">{item.contrato}</span>
                          </div>
                          <button onClick={() => toggleContrato(item)} className="text-xs text-emerald-600 hover:underline ml-4 flex-shrink-0">Reativar</button>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* ABA FUNÇÕES */}
          {tab === 'funcoes' && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6">
                <h2 className="font-bold text-slate-800 mb-4">Adicionar função</h2>
                <div className="max-w-sm">
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Nome da função *</label>
                  <input value={novaFuncao} onChange={e => setNovaFuncao(e.target.value)} placeholder="Ex: Auxiliar de serviços gerais" className={fieldClass} />
                </div>
                <button onClick={adicionarFuncao} disabled={salvando}
                  className="mt-4 rounded-xl bg-indigo-600 px-5 py-2 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-60 transition">
                  {salvando ? 'Salvando...' : 'Adicionar'}
                </button>
              </div>
              <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                  <h3 className="font-bold text-slate-800">Ativas <span className="text-slate-400 font-normal">({funcoes.filter(i => i.ativo).length})</span></h3>
                </div>
                <div className="divide-y divide-slate-100">
                  {funcoes.filter(i => i.ativo).map(item => (
                    <div key={item.id} className="flex items-center justify-between px-6 py-3">
                      <span className="text-sm text-slate-800">{item.nome}</span>
                      <button onClick={() => toggleFuncao(item)} className="text-xs text-red-500 hover:underline">Desativar</button>
                    </div>
                  ))}
                </div>
                {funcoes.filter(i => !i.ativo).length > 0 && (
                  <>
                    <div className="px-6 py-3 border-t border-slate-100 bg-slate-50">
                      <h3 className="text-xs font-semibold text-slate-400">Inativas ({funcoes.filter(i => !i.ativo).length})</h3>
                    </div>
                    <div className="divide-y divide-slate-100 opacity-50">
                      {funcoes.filter(i => !i.ativo).map(item => (
                        <div key={item.id} className="flex items-center justify-between px-6 py-3">
                          <span className="text-sm text-slate-400 line-through">{item.nome}</span>
                          <button onClick={() => toggleFuncao(item)} className="text-xs text-emerald-600 hover:underline">Reativar</button>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* ABA EQUIPAMENTOS */}
          {tab === 'equipamentos' && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6">
                <h2 className="font-bold text-slate-800 mb-4">Adicionar equipamento</h2>
                <div className="grid gap-3 md:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Tipo *</label>
                    <input value={novoTipo} onChange={e => setNovoTipo(e.target.value)} placeholder="Ex: Roçadeira" className={fieldClass} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Marca *</label>
                    <input value={novaMarca} onChange={e => setNovaMarca(e.target.value)} placeholder="Ex: Stihl" className={fieldClass} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Modelo *</label>
                    <input value={novoModelo} onChange={e => setNovoModelo(e.target.value)} placeholder="Ex: FS 291" className={fieldClass} />
                  </div>
                </div>
                <button onClick={adicionarEquipamento} disabled={salvando}
                  className="mt-4 rounded-xl bg-indigo-600 px-5 py-2 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-60 transition">
                  {salvando ? 'Salvando...' : 'Adicionar'}
                </button>
              </div>
              <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                  <h3 className="font-bold text-slate-800">Ativos <span className="text-slate-400 font-normal">({equipamentos.filter(i => i.ativo).length})</span></h3>
                </div>
                <div className="divide-y divide-slate-100">
                  {equipamentos.filter(i => i.ativo).map(item => (
                    <div key={item.id} className="flex items-center justify-between px-6 py-3">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-semibold text-slate-800">{item.tipo}</span>
                        <span className="text-slate-300">·</span>
                        <span className="text-slate-600">{item.marca}</span>
                        <span className="text-slate-300">·</span>
                        <span className="text-slate-500">{item.modelo}</span>
                      </div>
                      <button onClick={() => toggleEquipamento(item)} className="text-xs text-red-500 hover:underline">Desativar</button>
                    </div>
                  ))}
                </div>
                {equipamentos.filter(i => !i.ativo).length > 0 && (
                  <>
                    <div className="px-6 py-3 border-t border-slate-100 bg-slate-50">
                      <h3 className="text-xs font-semibold text-slate-400">Inativos ({equipamentos.filter(i => !i.ativo).length})</h3>
                    </div>
                    <div className="divide-y divide-slate-100 opacity-50">
                      {equipamentos.filter(i => !i.ativo).map(item => (
                        <div key={item.id} className="flex items-center justify-between px-6 py-3">
                          <div className="flex items-center gap-2 text-sm line-through text-slate-400">
                            <span>{item.tipo}</span><span className="text-slate-200">·</span>
                            <span>{item.marca}</span><span className="text-slate-200">·</span>
                            <span>{item.modelo}</span>
                          </div>
                          <button onClick={() => toggleEquipamento(item)} className="text-xs text-emerald-600 hover:underline">Reativar</button>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* ABA UNIDADES */}
          {tab === 'unidades' && (
            <div className="space-y-4">

              {/* Cadastro manual */}
              <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6">
                <h2 className="font-bold text-slate-800 mb-1">Adicionar unidade</h2>
                <p className="text-xs text-slate-500 mb-4">
                  Cada unidade física tem um patrimônio e um número de série únicos.
                  O número de série é permanente — só o patrimônio muda se a plaquinha for trocada.
                </p>
                <div className="grid gap-3 md:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Equipamento *</label>
                    <select value={novaUnidadeTipoId} onChange={e => setNovaUnidadeTipoId(e.target.value)} className={fieldClass}>
                      <option value="">Selecione...</option>
                      {equipamentos.filter(e => e.ativo).map(eq => (
                        <option key={eq.id} value={eq.id}>{eq.tipo} — {eq.marca} {eq.modelo}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Nº Patrimônio *</label>
                    <input value={novaUnidadePatrimonio} onChange={e => setNovaUnidadePatrimonio(e.target.value)} placeholder="Ex: 001234" className={fieldClass} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Nº Série *</label>
                    <input value={novaUnidadeSerie} onChange={e => setNovaUnidadeSerie(e.target.value)} placeholder="Ex: 123456789" className={fieldClass} />
                  </div>
                </div>
                <button onClick={adicionarUnidade} disabled={salvando}
                  className="mt-4 rounded-xl bg-indigo-600 px-5 py-2 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-60 transition">
                  {salvando ? 'Salvando...' : 'Adicionar'}
                </button>
              </div>

              {/* Importação CSV */}
              <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h2 className="font-bold text-slate-800 mb-1">Importar via CSV</h2>
                    <p className="text-xs text-slate-500">
                      Colunas obrigatórias na ordem:{' '}
                      <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                        Tipo, Marca, Modelo, Nº Serie, Nº Patrimonio
                      </span>
                      . A primeira linha deve ser o cabeçalho.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const csv = '\uFEFFTipo,Marca,Modelo,Nº Serie,Nº Patrimonio\nRoçadeira,Stihl,FS 291,123456789,001234'
                      const blob = new Blob([csv], { type: 'text/csv' })
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = 'modelo_unidades.csv'
                      a.click()
                      URL.revokeObjectURL(url)
                    }}
                    className="flex-shrink-0 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition"
                  >
                    ↓ Baixar modelo
                  </button>
                </div>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleCSV}
                  disabled={isPending}
                  className="text-sm text-slate-600 disabled:opacity-40"
                />
                {isPending && <p className="mt-2 text-xs text-indigo-500">Importando...</p>}
                {importError && <p className="mt-2 text-xs text-red-500">{importError}</p>}
                {importSuccess && <p className="mt-2 text-xs text-emerald-600">{importSuccess}</p>}
              </div>

              {/* Lista */}
              <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                  <h3 className="font-bold text-slate-800">
                    Ativas <span className="text-slate-400 font-normal">({unidades.length})</span>
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        <th className="px-6 py-3">Equipamento</th>
                        <th className="px-6 py-3">Patrimônio</th>
                        <th className="px-6 py-3">Série</th>
                        <th className="px-6 py-3"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {unidades.map(u => (
                        <tr key={u.id} className="hover:bg-slate-50">
                          <td className="px-6 py-3 text-slate-700">
                            {u.equipment_types?.tipo} — {u.equipment_types?.marca} {u.equipment_types?.modelo}
                          </td>
                          <td className="px-6 py-3 font-mono text-slate-800">{u.numero_patrimonio}</td>
                          <td className="px-6 py-3 font-mono text-slate-500">{u.numero_serie}</td>
                          <td className="px-6 py-3 text-right">
                            <button onClick={() => desativarUnidade(u.id)} className="text-xs text-red-500 hover:underline">
                              Desativar
                            </button>
                          </td>
                        </tr>
                      ))}
                      {unidades.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-6 py-8 text-center text-sm text-slate-400">
                            Nenhuma unidade cadastrada. Adicione manualmente ou importe via CSV.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ABA USUÁRIOS */}
          {tab === 'usuarios' && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6">
                <h2 className="font-bold text-slate-800 mb-4">Vincular contratos ao usuário</h2>
                <div className="max-w-sm">
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Selecione o usuário</label>
                  <select value={selectedUserId} onChange={e => handleSelectUser(e.target.value)} className={fieldClass}>
                    <option value="">Selecione...</option>
                    {usuarios.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.full_name || u.email || u.id} {u.role ? `(${u.role})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                {selectedUserId && !loadingUserContracts && (
                  <div className="mt-6 space-y-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Contratos vinculados ({userContracts.length})</p>
                      {userContracts.length === 0 ? (
                        <p className="text-sm text-slate-400">Nenhum contrato vinculado.</p>
                      ) : (
                        <div className="space-y-1.5">
                          {userContracts.map(uc => {
                            const contrato = contratos.find(c => c.centro_custo === uc.centro_custo)
                            return (
                              <div key={uc.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5">
                                <div className="text-sm">
                                  <span className="font-mono text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded mr-2">{uc.centro_custo}</span>
                                  <span className="text-slate-700">{contrato?.contrato ?? '-'}</span>
                                </div>
                                <button onClick={() => desvincularContrato(uc.id)} className="text-xs text-red-500 hover:underline ml-4 flex-shrink-0">Remover</button>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Adicionar contrato</p>
                      <div className="space-y-1.5">
                        {contratos.filter(c => c.ativo && !userContracts.some(uc => uc.centro_custo === c.centro_custo)).map(c => (
                          <div key={c.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-2.5">
                            <div className="text-sm">
                              <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded mr-2">{c.centro_custo}</span>
                              <span className="text-slate-700">{c.contrato}</span>
                            </div>
                            <button onClick={() => vincularContrato(c.centro_custo)} className="text-xs text-indigo-600 hover:underline ml-4 flex-shrink-0">Vincular</button>
                          </div>
                        ))}
                        {contratos.filter(c => c.ativo && !userContracts.some(uc => uc.centro_custo === c.centro_custo)).length === 0 && (
                          <p className="text-sm text-slate-400">Todos os contratos ativos já estão vinculados.</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                {loadingUserContracts && <p className="mt-4 text-sm text-slate-400">Carregando vínculos...</p>}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
