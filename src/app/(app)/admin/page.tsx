import Link from 'next/link'
import LogoutButton from '@/components/logout-button'
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

  const { data: recentTerms, error: recentTermsError } = await supabase
    .from('equipment_terms')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(8)

  if (recentTermsError) {
    throw new Error(`Erro ao carregar termos recentes: ${recentTermsError.message}`)
  }

  return (
    <main className="min-h-screen bg-green-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800">
              Painel Administrativo
            </span>
            <h1 className="mt-3 text-3xl font-bold text-green-700">Gestão do Admin</h1>
            <p className="mt-2 text-black">Controle geral do sistema, usuários e situação operacional dos termos.</p>
            <div className="mt-3 inline-flex rounded-full bg-white px-3 py-1 text-sm font-semibold text-green-800 border border-green-200">
              Admin: {profile?.full_name || 'Sem nome'}
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard" className="rounded-xl border border-green-200 bg-white px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-100">
              Dashboard
            </Link>
            <LogoutButton />
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-4">
          <div className="rounded-2xl border border-green-200 bg-white p-6 shadow-sm">
            <div className="mb-3 text-3xl">📄</div>
            <h2 className="text-xl font-semibold text-green-700">Total de termos</h2>
            <p className="mt-2 text-3xl font-bold text-black">{totalTerms ?? 0}</p>
          </div>
          <div className="rounded-2xl border border-green-200 bg-white p-6 shadow-sm">
            <div className="mb-3 text-3xl">✅</div>
            <h2 className="text-xl font-semibold text-green-700">Devolvidos</h2>
            <p className="mt-2 text-3xl font-bold text-black">{totalReturned ?? 0}</p>
          </div>
          <div className="rounded-2xl border border-green-200 bg-white p-6 shadow-sm">
            <div className="mb-3 text-3xl">🔧</div>
            <h2 className="text-xl font-semibold text-green-700">Em manutenção</h2>
            <p className="mt-2 text-3xl font-bold text-black">{totalMaintenance ?? 0}</p>
          </div>
          <div className="rounded-2xl border border-green-200 bg-white p-6 shadow-sm">
            <div className="mb-3 text-3xl">📦</div>
            <h2 className="text-xl font-semibold text-green-700">Em campo</h2>
            <p className="mt-2 text-3xl font-bold text-black">{totalActive ?? 0}</p>
          </div>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-6">
          <Link href="/usuarios" className="rounded-2xl border border-green-200 bg-white p-6 shadow-sm transition hover:border-green-400 hover:shadow-md">
            <div className="mb-3 text-3xl">👤</div>
            <h2 className="text-xl font-semibold text-green-700">Usuários</h2>
            <p className="mt-2 text-sm text-black">Revisar e alterar perfis do sistema.</p>
          </Link>
          <Link href="/termos" className="rounded-2xl border border-green-200 bg-white p-6 shadow-sm transition hover:border-green-400 hover:shadow-md">
            <div className="mb-3 text-3xl">📚</div>
            <h2 className="text-xl font-semibold text-green-700">Todos os termos</h2>
            <p className="mt-2 text-sm text-black">Acesso ao histórico completo.</p>
          </Link>
          <Link href="/termos?manutencao=em_manutencao" className="rounded-2xl border border-green-200 bg-white p-6 shadow-sm transition hover:border-green-400 hover:shadow-md">
            <div className="mb-3 text-3xl">🛠️</div>
            <h2 className="text-xl font-semibold text-green-700">Manutenção</h2>
            <p className="mt-2 text-sm text-black">Ver equipamentos em manutenção.</p>
          </Link>
          <Link href="/termos?status=ENTREGUE" className="rounded-2xl border border-green-200 bg-white p-6 shadow-sm transition hover:border-green-400 hover:shadow-md">
            <div className="mb-3 text-3xl">⏳</div>
            <h2 className="text-xl font-semibold text-green-700">Pendentes</h2>
            <p className="mt-2 text-sm text-black">Termos entregues sem devolução registrada.</p>
          </Link>
          <Link href="/auditoria" className="rounded-2xl border border-green-200 bg-white p-6 shadow-sm transition hover:border-green-400 hover:shadow-md">
            <div className="mb-3 text-3xl">🧾</div>
            <h2 className="text-xl font-semibold text-green-700">Auditoria</h2>
            <p className="mt-2 text-sm text-black">Consultar eventos reais por período e filtros operacionais.</p>
          </Link>
          <Link href="/admin/equipamentos" className="rounded-2xl border border-green-200 bg-white p-6 shadow-sm transition hover:border-green-400 hover:shadow-md">
            <div className="mb-3 text-3xl">⚙️</div>
            <h2 className="text-xl font-semibold text-green-700">Equipamentos</h2>
            <p className="mt-2 text-sm text-black">Cadastrar e gerenciar tipos de equipamento.</p>
          </Link>
        </div>

        <section className="mt-8 rounded-2xl border border-green-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-green-700">Últimos termos cadastrados</h2>
            <Link href="/termos" className="text-sm font-semibold text-green-700 hover:underline">Ver todos</Link>
          </div>
          <div className="overflow-hidden rounded-2xl border border-green-100">
            <div className="grid grid-cols-5 gap-4 bg-green-100 px-4 py-3 text-sm font-semibold text-green-800">
              <div>Nº Termo</div>
              <div>Funcionário</div>
              <div>Equipamento</div>
              <div>Status</div>
              <div>Ação</div>
            </div>
            {recentTerms && recentTerms.length > 0 ? (
              recentTerms.map((term) => (
                <div key={term.id} className="grid grid-cols-5 gap-4 border-t border-green-100 px-4 py-4 text-sm text-black">
                  <div className="font-semibold text-green-700">{term.numero_termo}</div>
                  <div>{term.funcionario_nome}</div>
                  <div>{term.tipo_equipamento}</div>
                  <div>
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${term.status === 'DEVOLVIDO' ? 'bg-gray-200 text-gray-700' : 'bg-green-100 text-green-700'}`}>
                      {term.status}
                    </span>
                    {term.em_manutencao ? (
                      <div className="mt-2">
                        <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">EM MANUTENÇÃO</span>
                      </div>
                    ) : null}
                  </div>
                  <div>
                    <Link href={`/termos/${term.id}`} className="text-sm font-semibold text-green-700 hover:underline">Abrir</Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-8 text-sm text-black">Nenhum termo recente encontrado.</div>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
