import { createClient } from '@/lib/supabase/server'

export type AppRole = 'admin' | 'supervisor' | 'encarregado'

export type CurrentProfile = {
  id: string
  full_name: string | null
  email: string | null
  role: AppRole | null
  is_active: boolean
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

  return {
    id: data.id,
    full_name: data.full_name ?? user.user_metadata?.full_name ?? null,
    email: (data as { email?: string | null }).email ?? user.email ?? null,
    role: (data.role as AppRole | null) ?? null,
    is_active: data.is_active ?? true,
  }
}
