'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import {
  deleteTermById,
  registerTermReturn,
  setTermMaintenance,
  transferTerm,
  listEmployees,
} from '@/lib/terms-supabase'

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
  redirect(`/termos/${term_id}?success=return_registered`)
}

export async function transferTermAction(formData: FormData) {
  const term_id = asString(formData, 'term_id')
  const employee_id = asString(formData, 'employee_id')
  const data_transferencia = asString(formData, 'data_transferencia')
  const condicao = asString(formData, 'condicao') as
    | 'EM_PERFEITO_ESTADO'
    | 'COM_DEFEITO'
    | 'FALTANDO_PECAS'
  const observacoes = asString(formData, 'observacoes')

  if (!term_id || !employee_id || !data_transferencia || !condicao) {
    redirect(`/termos/${term_id}?error=transfer_required`)
  }

  const employees = await listEmployees()
  const employee = employees.find(e => e.id === employee_id && e.ativo)
  if (!employee) redirect(`/termos/${term_id}?error=transfer_employee`)

  let newTermId: string
  try {
    const created = await transferTerm({
      term_id,
      employee,
      data_transferencia,
      condicao,
      observacoes: observacoes || null,
    })
    newTermId = created.id
  } catch (err) {
    console.error('Erro ao transferir termo:', err)
    redirect(`/termos/${term_id}?error=transfer_failed`)
  }

  revalidatePath('/termos')
  revalidatePath(`/termos/${term_id}`)
  redirect(`/termos/${newTermId}?success=transferred`)
}

export async function markMaintenanceAction(formData: FormData) {
  const term_id = asString(formData, 'term_id')
  const observacao_manutencao = asString(formData, 'observacao_manutencao')
  const data_manutencao = asString(formData, 'data_manutencao') || null

  if (!term_id) {
    redirect('/termos?error=maintenance')
  }

  await setTermMaintenance(term_id, {
    em_manutencao: true,
    observacao_manutencao: observacao_manutencao || null,
    data_manutencao,
  })

  revalidatePath('/termos')
  revalidatePath(`/termos/${term_id}`)
  redirect(`/termos/${term_id}?success=maintenance_on`)
}

export async function clearMaintenanceAction(formData: FormData) {
  const term_id = asString(formData, 'term_id')

  if (!term_id) {
    redirect('/termos?error=maintenance')
  }

  await setTermMaintenance(term_id, {
    em_manutencao: false,
  })

  revalidatePath('/termos')
  revalidatePath(`/termos/${term_id}`)
  redirect(`/termos/${term_id}?success=maintenance_off`)
}

export async function deleteTermAction(formData: FormData) {
  const term_id = asString(formData, 'term_id')

  if (!term_id) {
    redirect('/termos?error=delete')
  }

  await deleteTermById(term_id)

  revalidatePath('/termos')
  redirect('/termos?success=deleted')
}
