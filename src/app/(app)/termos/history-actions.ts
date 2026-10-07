'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { finalizeDraftTerm, getTermById, registerTermReturn, setTermMaintenance } from '@/lib/terms-supabase'

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

const CONDICOES = ['EM_PERFEITO_ESTADO', 'COM_DEFEITO', 'FALTANDO_PECAS'] as const

function str(formData: FormData, key: string) {
  return String(formData.get(key) ?? '').trim()
}

export async function returnFromListAction(formData: FormData) {
  const termId = str(formData, 'term_id')
  const data = str(formData, 'data_devolucao')
  const condicao = str(formData, 'condicao') as (typeof CONDICOES)[number]
  const recebedor = str(formData, 'responsavel_recebimento')
  const observacoes = str(formData, 'observacoes')

  if (!termId || !data || !recebedor || !CONDICOES.includes(condicao)) {
    redirect('/termos?acao_erro=devolucao_campos')
  }

  let available = false
  try {
    const { term, termReturn } = await getTermById(termId)
    available = !termReturn && term.status === 'ENTREGUE' && !term.is_draft
    if (available) {
      await registerTermReturn({
        term_id: termId,
        data_devolucao: data,
        condicao,
        responsavel_recebimento: recebedor,
        observacoes: observacoes || null,
      })
    }
  } catch (error) {
    console.error('Erro ao devolver pela lista:', error)
    redirect('/termos?acao_erro=devolucao')
  }
  if (!available) redirect('/termos?acao_erro=devolucao_indisponivel')

  revalidatePath('/termos')
  revalidatePath(`/termos/${termId}`)
  redirect('/termos?acao_ok=devolvido')
}

export async function maintenanceOnFromListAction(formData: FormData) {
  const termId = str(formData, 'term_id')
  const data = str(formData, 'data_manutencao')
  const observacao = str(formData, 'observacao_manutencao')

  if (!termId || !data) redirect('/termos?acao_erro=manutencao_campos')

  try {
    await setTermMaintenance(termId, {
      em_manutencao: true,
      observacao_manutencao: observacao || null,
      data_manutencao: data,
    })
  } catch (error) {
    console.error('Erro ao marcar manutenção pela lista:', error)
    redirect('/termos?acao_erro=manutencao')
  }

  revalidatePath('/termos')
  revalidatePath(`/termos/${termId}`)
  redirect('/termos?acao_ok=manutencao_on')
}

export async function maintenanceOffFromListAction(formData: FormData) {
  const termId = str(formData, 'term_id')
  if (!termId) redirect('/termos')

  try {
    await setTermMaintenance(termId, { em_manutencao: false })
  } catch (error) {
    console.error('Erro ao retirar manutenção pela lista:', error)
    redirect('/termos?acao_erro=manutencao')
  }

  revalidatePath('/termos')
  revalidatePath(`/termos/${termId}`)
  redirect('/termos?acao_ok=manutencao_off')
}
