import Link from 'next/link'
import { redirect } from 'next/navigation'
import LogoutButton from '@/components/logout-button'
import { getCurrentProfile } from '@/lib/auth/profile'
import { createClient } from '@/lib/supabase/server'
import { updateUserRoleAction } from './actions'

function roleLabel(role: string) {
  switch (role) {
    case 'admin':
      return 'Admin'
    case 'supervisor':
      return 'Supervisor'
    case 'encarregado':
      return 'Encarregado'
    default:
      return role
  }
}

export default async function UsuariosPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; success?: string }>
}) {
  const profile = await getCurrentProfile()

  if (!profile || profile.role !== 'admin') {
    redirect('/dashboard')
  }

  const params = (await searchParams) ?? {}
  const supabase = await createClient()

  const { data: users, error } = await supabase
    .from('profiles')
    .select('*')
    .order('full_name', { ascending: true })

  if (error) {
    throw new Error(`Erro ao carregar perfis: ${error.message}`)
  }

  const message =
    params.success === '1'
      ? 'Perfil atualizado com sucesso.'
      : params.error === 'required'
      ? 'Selecione um perfil e um papel válido.'
      : params.error === 'update'
      ? 'Não foi possível atualizar o perfil.'
      : ''

  return (
    <main className="min-h-screen bg-green-50 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-green-700">
              Gestão de Usuários
            </h1>
            <p className="mt-2 text-black">
              Área administrativa para definir perfis do sistema.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/dashboard"
              className="rounded-xl border border-green-200 bg-white px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-100"
            >
              Dashboard
            </Link>

            <LogoutButton />
          </div>
        </div>

        {message ? (
          <div className="mb-6 rounded-2xl border border-green-200 bg-white px-4 py-3 text-sm text-black shadow-sm">
            {message}
          </div>
        ) : null}

        <div className="overflow-hidden rounded-2xl border border-green-200 bg-white shadow-sm">
          <div className="grid grid-cols-4 gap-4 bg-green-100 px-4 py-3 text-sm font-semibold text-green-800">
            <div>Nome</div>
            <div>ID</div>
            <div>Perfil atual</div>
            <div>Ação</div>
          </div>

          {users && users.length > 0 ? (
            users.map((user) => (
              <div
                key={user.id}
                className="grid grid-cols-4 gap-4 border-t border-green-100 px-4 py-4 text-sm text-black"
              >
                <div>{user.full_name || 'Sem nome'}</div>
                <div className="truncate text-gray-500">{user.id}</div>
                <div>
                  <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                    {roleLabel(user.role)}
                  </span>
                </div>

                <div>
                  <form action={updateUserRoleAction} className="flex flex-wrap gap-2">
                    <input type="hidden" name="profile_id" value={user.id} />

                    <select
                      name="role"
                      defaultValue={user.role}
                      className="rounded-xl border border-green-200 bg-white px-3 py-2 text-sm text-black outline-none focus:border-green-600"
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
                </div>
              </div>
            ))
          ) : (
            <div className="px-4 py-8 text-sm text-black">
              Nenhum usuário encontrado.
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
