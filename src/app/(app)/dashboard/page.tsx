import Link from 'next/link'
import { getCurrentProfile } from '@/lib/auth/profile'
import { createClient } from '@/lib/supabase/server'

function roleLabel(role: string | null | undefined) {
  switch (role) {
    case 'superadmin': return 'Superadmin'
    case 'admin': return 'Admin'
    case 'supervisor': return 'Supervisor'
    case 'encarregado': return 'Encarregado'
    default: return 'Sem perfil'
  }
}

export default async function DashboardPage() {
  const profile = await getCurrentProfile()
  const supabase = await createClient()
  const isAdmin = profile?.role === 'superadmin' || profile?.role === 'admin'
  const centros = profile?.centros_custo ?? []

  function scopedQuery() {
    const q = supabase.from('equipment_terms').select('*', { count: 'exact', head: true })
    return !isAdmin && centros.length > 0 ? q.in('centro_custo', centros) : q
  }

  const [{ count: totalTerms }, { count: totalEntregues }, { count: totalMaintenance }, { count: totalDevolvidos }] =
    await Promise.all([
      scopedQuery(),
      scopedQuery().eq('status', 'ENTREGUE'),
      scopedQuery().eq('em_manutencao', true),
      scopedQuery().eq('status', 'DEVOLVIDO'),
    ])

  let recentQuery = supabase
    .from('equipment_terms')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)

  if (!isAdmin && centros.length > 0) {
    recentQuery = recentQuery.in('centro_custo', centros)
  }

  const { data: recentTerms } = await recentQuery

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">TermoEquip</p>
        <h1 className="mt-1 text-3xl font-black text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Visão geral do sistema · Perfil: <span className="font-semibold text-indigo-600">{roleLabel(profile?.role)}</span>
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl bg-white p-5 shadow-sm border-t-4 border-indigo-500">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Total de termos</p>
          <p className="mt-2 text-4xl font-black text-indigo-600">{totalTerms ?? 0}</p>
          <p className="mt-1 text-xs text-slate-400">cadastros no sistema</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm border-t-4 border-amber-400">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Em campo</p>
          <p className="mt-2 text-4xl font-black text-amber-500">{totalEntregues ?? 0}</p>
          <p className="mt-1 text-xs text-slate-400">equipamento com funcionário</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm border-t-4 border-orange-400">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Em manutenção</p>
          <p className="mt-2 text-4xl font-black text-orange-500">{totalMaintenance ?? 0}</p>
          <p className="mt-1 text-xs text-slate-400">equipamentos parados</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm border-t-4 border-emerald-400">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Devolvidos</p>
          <p className="mt-2 text-4xl font-black text-emerald-500">{totalDevolvidos ?? 0}</p>
          <p className="mt-1 text-xs text-slate-400">termos encerrados</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/termos/novo" className="group rounded-2xl bg-indigo-600 p-6 shadow-sm hover:bg-indigo-700 transition">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-white">Novo Termo</p>
              <p className="text-xs text-indigo-200">Cadastrar responsabilidade</p>
            </div>
          </div>
        </Link>

        <Link href="/termos" className="group rounded-2xl bg-white p-6 shadow-sm border border-slate-200 hover:border-indigo-300 hover:shadow-md transition">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
              <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-slate-800">Todos os Termos</p>
              <p className="text-xs text-slate-400">Histórico completo</p>
            </div>
          </div>
        </Link>

        {isAdmin ? (
          <Link href="/admin" className="group rounded-2xl bg-white p-6 shadow-sm border border-slate-200 hover:border-indigo-300 hover:shadow-md transition">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-slate-800">Painel Admin</p>
                <p className="text-xs text-slate-400">Gestão e controle</p>
              </div>
            </div>
          </Link>
        ) : (
          <Link href="/termos?status=ENTREGUE" className="group rounded-2xl bg-white p-6 shadow-sm border border-slate-200 hover:border-indigo-300 hover:shadow-md transition">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
                <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-slate-800">Em campo</p>
                <p className="text-xs text-slate-400">Aguardando devolução</p>
              </div>
            </div>
          </Link>
        )}
      </div>

      <div className="rounded-2xl bg-white shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-800">Últimos termos cadastrados</h2>
          <Link href="/termos" className="text-xs font-semibold text-indigo-600 hover:underline">Ver todos</Link>
        </div>
        {recentTerms && recentTerms.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {recentTerms.map(term => (
              <div key={term.id} className="flex items-center justify-between px-6 py-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-indigo-600">{term.numero_termo}</p>
                  <p className="text-xs text-slate-500">{term.funcionario_nome} · {term.tipo_equipamento}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    term.status === 'DEVOLVIDO' ? 'bg-slate-100 text-slate-600' :
                    term.em_manutencao ? 'bg-amber-100 text-amber-700' :
                    'bg-emerald-100 text-emerald-700'
                  }`}>
                    {term.em_manutencao ? 'MANUTENÇÃO' : term.status}
                  </span>
                  <Link href={`/termos/${term.id}`} className="text-xs font-semibold text-indigo-600 hover:underline">Abrir</Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="px-6 py-8 text-sm text-slate-400">Nenhum termo encontrado.</p>
        )}
      </div>
    </div>
  )
}
