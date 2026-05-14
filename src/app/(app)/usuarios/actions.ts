'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/lib/auth/profile'

async function assertAdmin() {
  const profile = await getCurrentProfile()

  if (!profile || profile.role !== 'admin') {
    throw new Error('Acesso negado. Apenas administradores podem executar esta ação.')
  }

  return profile
}

export async function updateUserRoleAction(formData: FormData) {
  const currentAdmin = await assertAdmin()

  const userId = String(formData.get('user_id') ?? '').trim()
  const nextRole = String(formData.get('role') ?? '').trim()

  if (!userId || !nextRole) {
    throw new Error('Dados inválidos para atualização de perfil.')
  }

  if (
    nextRole !== 'admin' &&
    nextRole !== 'supervisor' &&
    nextRole !== 'encarregado'
  ) {
    throw new Error('Perfil informado é inválido.')
  }

  if (userId === currentAdmin.id && nextRole !== 'admin') {
    throw new Error('Você não pode remover seu próprio perfil de administrador.')
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from('profiles')
    .update({ role: nextRole })
    .eq('id', userId)

  if (error) {
    throw new Error(`Erro ao atualizar perfil: ${error.message}`)
  }

  revalidatePath('/usuarios')
  revalidatePath('/admin')
}

export async function toggleUserActiveAction(formData: FormData) {
  const currentAdmin = await assertAdmin()

  const userId = String(formData.get('user_id') ?? '').trim()
  const currentStatus = String(formData.get('current_status') ?? '').trim() === 'true'

  if (!userId) {
    throw new Error('Usuário inválido.')
  }

  if (userId === currentAdmin.id) {
    throw new Error('Você não pode desativar sua própria conta.')
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from('profiles')
    .update({ is_active: !currentStatus })
    .eq('id', userId)

  if (error) {
    throw new Error(`Erro ao alterar status do usuário: ${error.message}`)
  }

  revalidatePath('/usuarios')
  revalidatePath('/admin')
}
