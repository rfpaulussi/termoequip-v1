'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createEmployee } from '@/lib/terms-supabase'
import { formatCpf, isValidCpf } from '@/lib/employee-import'

function asString(formData: FormData, key: string) {
  return String(formData.get(key) ?? '').trim()
}

/** Só aceita caminhos internos da própria aplicação como destino do redirect. */
function safeReturnTo(value: string) {
  return value.startsWith('/') && !value.startsWith('//') ? value : '/funcionarios'
}

export async function createEmployeeInlineAction(formData: FormData) {
  const returnTo = safeReturnTo(asString(formData, 'return_to'))
  const nome_completo = asString(formData, 'nome_completo')
  const re = asString(formData, 're')
  const cpf = formatCpf(asString(formData, 'cpf'))
  const funcao = asString(formData, 'funcao')
  const centro_custo = asString(formData, 'centro_custo') || null
  const sep = returnTo.includes('?') ? '&' : '?'

  if (!nome_completo || !re || !cpf || !funcao) redirect(`${returnTo}${sep}error=employee_required`)
  if (!isValidCpf(cpf)) redirect(`${returnTo}${sep}error=employee_cpf`)

  let id: string
  try {
    const created = await createEmployee({ nome_completo, re, cpf, funcao, ativo: true, centro_custo })
    id = created.id
  } catch (err) {
    const message = err instanceof Error ? err.message : ''
    const code = message.includes('cpf') ? 'employee_cpf_dup' : message.includes('re') ? 'employee_re_dup' : 'employee_failed'
    redirect(`${returnTo}${sep}error=${code}`)
  }

  revalidatePath(returnTo.split('?')[0])
  redirect(`${returnTo}${sep}success=employee_created&novo=${id}`)
}
