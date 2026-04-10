'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { registerTermReturn } from '@/lib/terms-supabase'

function asString(formData: FormData, key: string) {
  return String(formData.get(key) ?? '').trim()
}

export async function registerReturnAction(formData: FormData) {
  const term_id = asString(formData, 'term_id')
  const data_devolucao = asString(formData, 'data_devolucao')
  const condicao = asString(formData, 'condicao') as
    | 'EM_PERFEITO_ESTADO'
    | 'COM_DEFEITO'
    | 'FALTANDO_PECAS'
  const responsavel_recebimento = asString(formData, 'responsavel_recebimento')
  const observacoes = asString(formData, 'observacoes')

  if (!term_id || !data_devolucao || !condicao || !responsavel_recebimento) {
    redirect(`/termos/${term_id}?error=return_required`)
  }

  await registerTermReturn({
    term_id,
    data_devolucao,
    condicao,
    responsavel_recebimento,
    observacoes: observacoes || null,
  })

  revalidatePath('/termos')
  revalidatePath(`/termos/${term_id}`)
  redirect(`/termos/${term_id}`)
}
