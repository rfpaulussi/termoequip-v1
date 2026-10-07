'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getCurrentProfile } from '@/lib/auth/profile'
import { listEmployees, listTerms, transferTerm } from '@/lib/terms-supabase'

const CONDICOES = ['EM_PERFEITO_ESTADO', 'COM_DEFEITO', 'FALTANDO_PECAS'] as const
type Condicao = (typeof CONDICOES)[number]

function asString(formData: FormData, key: string) {
  return String(formData.get(key) ?? '').trim()
}

export async function transferBatchAction(formData: FormData) {
  const profile = await getCurrentProfile()
  if (!profile) redirect('/login')

  const termIds = [...new Set(formData.getAll('term_ids').map(v => String(v)))].filter(Boolean)
  const employeeId = asString(formData, 'employee_id')
  const data = asString(formData, 'data_transferencia')
  const condicao = asString(formData, 'condicao') as Condicao
  const observacoes = asString(formData, 'observacoes')

  if (termIds.length === 0 || !employeeId || !data || !CONDICOES.includes(condicao)) {
    redirect('/transferencias?error=transfer_required')
  }

  const employee = (await listEmployees()).find(e => e.id === employeeId && e.ativo)
  if (!employee) redirect('/transferencias?error=transfer_employee')

  const isAdmin = profile.role === 'superadmin' || profile.role === 'admin'
  const allowed = new Set((await listTerms(isAdmin ? undefined : profile.centros_custo)).map(t => t.id))

  let ok = 0
  let failed = 0
  for (const termId of termIds) {
    if (!allowed.has(termId)) { failed++; continue }
    try {
      await transferTerm({
        term_id: termId,
        employee,
        data_transferencia: data,
        condicao,
        observacoes: observacoes || null,
      })
      ok++
    } catch (err) {
      console.error('Erro ao transferir termo', termId, err)
      failed++
    }
  }

  revalidatePath('/transferencias')
  revalidatePath('/termos')
  redirect(`/transferencias?${failed ? 'error=transfer_partial' : 'success=transferred'}&ok=${ok}&falhas=${failed}`)
}
