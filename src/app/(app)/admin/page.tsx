import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/lib/auth/profile'

export default async function AdminPage() {
  const profile = await getCurrentProfile()
  const supabase = await createClient()

  const [{ count: totalTerms }, { count: totalReturned }, { count: totalMaintenance }, { count: totalActive }] =
    await Promise.all([
      supabase.from('equipment_terms').select('*', { count: 'exact', head: true }),
      supabase.from('equipment_terms').select('*', { count: 'exact', head: true }).eq('status', 'DEVOLVIDO'),
      supabase.from('equipment_terms').select('*', { count: 'exact', head: true }).eq('em_manutencao', true),
      supabase.from('equipment_terms').select('*', { count: 'exact', head: true }).eq('status', 'ENTREGUE'),
    ])

  const { data: recentTerms } = await supabase
    .from('equipment_terms')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(8)

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Administração</p>
        <h1 className="mt-1 text-3xl font-black text-slate-900">Painel Admin</h1>
        <p className="mt-1 text-sm text-slate-500">
          Controle geral · <span className="font-semibold text-indigo-600">{profile?.full_name || 'Admin'}</span>
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
          <p className="mt-2 text-4xl font-black text-amber-500">{totalActive ?? 0}</p>
          <p className="mt-1 text-xs text-slate-400">equipamento com funcionário</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm border-t-4 border-orange-400">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Em manutenção</p>
          <p className="mt-2 text-4xl font-black text-orange-500">{totalMaintenance ?? 0}</p>
          <p className="mt-1 text-xs text-slate-400">equipamentos parados</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm border-t-4 border-emerald-400">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Devolvidos</p>
          <p className="mt-2 text-4xl font-black text-emerald-500">{totalReturned ?? 0}</p>
          <p className="mt-1 text-xs text-slate-400">termos encerrados</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        {[
          { href: '/usuarios', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', label: 'Usuários', desc: 'Perfis e acessos' },
          { href: '/termos', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', label: 'Todos os termos', desc: 'Histórico completo' },
          { href: '/termos?manutencao=em_manutencao', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z', label: 'Manutenção', desc: 'Equipamentos parados' },
          { href: '/termos?status=ENTREGUE', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', label: 'Em campo', desc: 'Sem devolução registrada' },
          { href: '/auditoria', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', label: 'Auditoria', desc: 'Eventos por período' },
          { href: '/admin/equipamentos', icon: 'M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2v-4M9 21H5a2 2 0 01-2-2v-4m0 0h18', label: 'Cadastros', desc: 'Contratos, funções e equipamentos' },
        ].map(item => (
          <Link key={item.href} href={item.href} className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200 hover:border-indigo-300 hover:shadow-md transition">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 mb-3">
              <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
            </div>
            <p className="font-bold text-sm text-slate-800">{item.label}</p>
            <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
          </Link>
        ))}
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
