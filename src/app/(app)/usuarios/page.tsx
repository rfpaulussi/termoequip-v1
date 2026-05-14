import { createClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/lib/auth/profile'
import { toggleUserActiveAction, updateUserRoleAction } from './actions'

type ProfileRow = {
  id: string
  full_name: string | null
  email: string | null
  role: 'superadmin' | 'admin' | 'supervisor' | 'encarregado' | null
  is_active: boolean
}

function roleLabel(role: string | null) {
  switch (role) {
    case 'superadmin': return 'Superadmin'
    case 'admin': return 'Admin'
    case 'supervisor': return 'Supervisor'
    case 'encarregado': return 'Encarregado'
    default: return 'Sem perfil'
  }
}

function roleBadgeClass(role: string | null) {
  switch (role) {
    case 'superadmin': return 'bg-purple-100 text-purple-700'
    case 'admin': return 'bg-indigo-100 text-indigo-700'
    case 'supervisor': return 'bg-blue-100 text-blue-700'
    case 'encarregado': return 'bg-amber-100 text-amber-700'
    default: return 'bg-slate-100 text-slate-600'
  }
}

export default async function UsuariosPage() {
  const currentProfile = await getCurrentProfile()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, role, is_active')
    .order('full_name', { ascending: true })

  if (error) throw new Error(`Erro ao carregar usuários: ${error.message}`)

  const users = (data ?? []) as ProfileRow[]

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Administração</p>
        <h1 className="mt-1 text-3xl font-black text-slate-900">Usuários</h1>
        <p className="mt-1 text-sm text-slate-500">Gerencie perfis e controle de acesso ao sistema.</p>
      </div>

      <div className="rounded-2xl bg-white shadow-sm border border-slate-200 overflow-hidden">
        <div className="grid grid-cols-5 gap-4 bg-slate-50 px-6 py-3 border-b border-slate-200 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <div>Nome / E-mail</div>
          <div>ID</div>
          <div>Perfil</div>
          <div>Status</div>
          <div>Ações</div>
        </div>

        {users.length === 0 ? (
          <p className="px-6 py-10 text-sm text-slate-400">Nenhum usuário encontrado.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {users.map(user => (
              <div key={user.id} className="grid grid-cols-5 gap-4 px-6 py-4 text-sm items-start">
                <div>
                  <p className="font-semibold text-slate-800">{user.full_name || 'Sem nome'}</p>
                  <p className="text-xs text-slate-400">{user.email || 'Sem e-mail'}</p>
                </div>
                <div className="break-all text-xs text-slate-400 pt-1">{user.id}</div>
                <div>
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${roleBadgeClass(user.role)}`}>
                    {roleLabel(user.role)}
                  </span>
                </div>
                <div>
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${user.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                    {user.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  <form action={updateUserRoleAction} className="flex items-center gap-2">
                    <input type="hidden" name="user_id" value={user.id} />
                    <select name="role" defaultValue={user.role ?? 'encarregado'}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-indigo-400">
                      <option value="superadmin">Superadmin</option>
                      <option value="admin">Admin</option>
                      <option value="supervisor">Supervisor</option>
                      <option value="encarregado">Encarregado</option>
                    </select>
                    <button type="submit" className="rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 transition">
                      Salvar
                    </button>
                  </form>
                  <form action={toggleUserActiveAction}>
                    <input type="hidden" name="user_id" value={user.id} />
                    <input type="hidden" name="current_status" value={String(user.is_active)} />
                    {currentProfile?.id === user.id ? (
                      <span className="text-xs text-slate-400 italic">Sua própria conta</span>
                    ) : (
                      <button type="submit" className={`rounded-xl px-3 py-1.5 text-xs font-semibold text-white transition ${user.is_active ? 'bg-red-500 hover:bg-red-600' : 'bg-slate-500 hover:bg-slate-600'}`}>
                        {user.is_active ? 'Desativar' : 'Reativar'}
                      </button>
                    )}
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
        Desativar acesso impede o login, mas preserva o histórico operacional e a auditoria.
      </div>
    </div>
  )
}
