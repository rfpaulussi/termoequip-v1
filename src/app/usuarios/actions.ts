'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/lib/auth/profile'

function asString(formData: FormData, key: string) {
  return String(formData.get(key) ?? '').trim()
}

export async function updateUserRoleAction(formData: FormData) {
  const profileId = asString(formData, 'profile_id')
  const role = asString(formData, 'role') as 'admin' | 'supervisor' | 'encarregado'

  if (!profileId || !role) {
    redirect('/usuarios?error=required')
  }

  const currentProfile = await getCurrentProfile()

  if (!currentProfile || currentProfile.role !== 'admin') {
    redirect('/dashboard')
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', profileId)

  if (error) {
    redirect('/usuarios?error=update')
  }

  revalidatePath('/usuarios')
  revalidatePath('/dashboard')
  redirect('/usuarios?success=1')
}
