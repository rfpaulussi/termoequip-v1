import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database'

type ProfileRow = Database['public']['Tables']['profiles']['Row']

export async function getCurrentProfile(): Promise<ProfileRow | null> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (error) {
    throw new Error(`Erro ao buscar perfil: ${error.message}`)
  }

  return data
}
