'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { finalizeDraftTerm } from '@/lib/terms-supabase'

export async function finalizeDraftFromListAction(formData: FormData) {
  const termId = String(formData.get('term_id') ?? '').trim()

  if (!termId) {
    redirect('/termos')
  }

  try {
    await finalizeDraftTerm(termId)
  } catch (error) {
    console.error('Erro ao finalizar rascunho:', error)
    redirect('/termos?draft_finalize_error=1')
  }

  revalidatePath('/termos')
  revalidatePath(`/termos/${termId}`)
  redirect('/termos?draft_finalized=1')
}
