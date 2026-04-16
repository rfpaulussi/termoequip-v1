import Link from 'next/link'
import LogoutButton from '@/components/logout-button'
import { createClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/lib/auth/profile'
import { toggleUserActiveAction, updateUserRoleAction } from './actions'

type ProfileRow = {
  id: string
  full_name: string | null
  email: string | null
  role: 'admin' | 'supervisor' | 'encarregado' | null
  is_active: boolean
}

function roleBadge(role: string | null) {
  switch (role) {
    case 'admin':
      return 'bg-green-100 text-green-700'
    case 'supervisor':
      return 'bg-blue-100 text-blue-700'
    case 'encarregado':
      return 'bg-amber-100 text-amber-700'
    default:
      return 'bg-slate-200 text-slate-700'
  }
}

function roleLabel(role: string | null) {
  switch (role) {
    case 'admin':
      return 'Admin'
    case 'supervisor':
      return 'Supervisor'
    case 'encarregado':
      return 'Encarregado'
    default:
      return 'Sem perfil'
  }
}

export default async function UsuariosPage() {
  const currentProfile = await getCurrentProfile()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, role, is_active')
    .order('full_name', { ascending: true })

  if (error) {
    throw new Error(`Erro ao carregar usuários: ${error.message}`)
  }

  const users = (data ?? []) as ProfileRow[]

  return (
    <main className="min-h-screen bg-green-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-green-700">Gestão de Usuários</h1>
            <p className="mt-2 text-black">
              Área administrativa para revisar perfis e controlar acesso ao sistema.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="rounded-xl border border-green-200 bg-white px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-100"
            >
              Dashboard
            </Link>

            <LogoutButton />
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-green-200 bg-white shadow-sm">
          <div className="grid grid-cols-5 gap-4 bg-green-100 px-4 py-3 text-sm font-semibold text-green-800">
            <div>Nome / E-mail</div>
            <div>ID</div>
            <div>Perfil atual</div>
            <div>Status</div>
            <div>Ações</div>
          </div>

          {users.length === 0 ? (
            <div className="px-4 py-10 text-sm text-black">
              Nenhum usuário encontrado.
            </div>
          ) : (
            users.map((user) => (
              <div
                key={user.id}
                className="grid grid-cols-5 gap-4 border-t border-green-100 px-4 py-4 text-sm text-black"
              >
                <div>
                  <div className="font-semibold text-green-700">
                    {user.full_name || 'Sem nome'}
                  </div>
                  <div className="text-sm text-slate-500">
                    {user.email || 'Sem e-mail'}
                  </div>
                </div>

                <div className="break-all text-slate-600">{user.id}</div>

                <div>
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${roleBadge(
                      user.role
                    )}`}
                  >
                    {roleLabel(user.role)}
                  </span>
                </div>

                <div>
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      user.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {user.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>

                <div className="flex flex-col gap-3">
                  <form action={updateUserRoleAction} className="flex items-center gap-2">
                    <input type="hidden" name="user_id" value={user.id} />

                    <select
                      name="role"
                      defaultValue={user.role ?? 'encarregado'}
                      className="rounded-xl border border-green-200 bg-white px-3 py-2 text-sm text-black"
                    >
                      <option value="admin">Admin</option>
                      <option value="supervisor">Supervisor</option>
                      <option value="encarregado">Encarregado</option>
                    </select>

                    <button
                      type="submit"
                      className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                    >
                      Salvar
                    </button>
                  </form>

                  <form action={toggleUserActiveAction}>
                    <input type="hidden" name="user_id" value={user.id} />
                    <input
                      type="hidden"
                      name="current_status"
                      value={String(user.is_active)}
                    />

                    {currentProfile?.id === user.id ? (
                      <span className="inline-flex rounded-xl border border-slate-200 bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-500">
                        Sua própria conta
                      </span>
                    ) : (
                      <button
                        type="submit"
                        className={`rounded-xl px-4 py-2 text-sm font-semibold text-white ${
                          user.is_active
                            ? 'bg-red-600 hover:bg-red-700'
                            : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                      >
                        {user.is_active ? 'Desativar acesso' : 'Reativar acesso'}
                      </button>
                    )}
                  </form>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Desativar acesso impede o usuário de entrar nas áreas protegidas do sistema, mas preserva o histórico operacional e a auditoria.
        </div>
      </div>
    </main>
  )
}
