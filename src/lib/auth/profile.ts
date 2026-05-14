import { createClient } from '@/lib/supabase/server'

export type AppRole = 'admin' | 'supervisor' | 'encarregado'

export type CurrentProfile = {
  id: string
  full_name: string | null
  email: string | null
  role: AppRole | null
  is_active: boolean
  centros_custo: string[]
}

export async function getCurrentProfile(): Promise<CurrentProfile | null> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, role, is_active')
    .eq('id', user.id)
    .maybeSingle()

  if (error) {
    throw new Error(`Erro ao buscar perfil atual: ${error.message}`)
  }

  if (!data) return null

  const role = (data.role as AppRole | null) ?? null

  let centros_custo: string[] = []

  if (role !== 'admin') {
    const { data: contracts, error: contractsError } = await supabase
      .from('user_contracts')
      .select('centro_custo')
      .eq('user_id', user.id)

    if (contractsError) {
      throw new Error(`Erro ao buscar contratos do usuário: ${contractsError.message}`)
    }

    centros_custo = (contracts ?? []).map(c => c.centro_custo).filter((c): c is string => c !== null)
  }

  return {
    id: data.id,
    full_name: data.full_name ?? user.user_metadata?.full_name ?? null,
    email: (data as { email?: string | null }).email ?? user.email ?? null,
    role,
    is_active: data.is_active ?? true,
    centros_custo,
  }
}
