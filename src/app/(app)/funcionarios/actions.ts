'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createEmployee, updateEmployee, toggleEmployeeStatus } from '@/lib/terms-supabase'

function asString(formData: FormData, key: string) {
  return String(formData.get(key) ?? '').trim()
}

export async function createEmployeeAction(formData: FormData) {
  const nome_completo = asString(formData, 'nome_completo')
  const re = asString(formData, 're')
  const cpf = asString(formData, 'cpf')
  const funcao = asString(formData, 'funcao')
  const centro_custo = asString(formData, 'centro_custo') || null

  if (!nome_completo || !re || !cpf || !funcao) {
    redirect('/funcionarios?error=required')
  }

  await createEmployee({ nome_completo, re, cpf, funcao, ativo: true, centro_custo })
  revalidatePath('/funcionarios')
  redirect('/funcionarios?success=created')
}

export async function updateEmployeeAction(formData: FormData) {
  const id = asString(formData, 'id')
  const nome_completo = asString(formData, 'nome_completo')
  const re = asString(formData, 're')
  const cpf = asString(formData, 'cpf')
  const funcao = asString(formData, 'funcao')
  const centro_custo = asString(formData, 'centro_custo') || null

  if (!id || !nome_completo || !re || !cpf || !funcao) {
    redirect('/funcionarios?error=required')
  }

  await updateEmployee(id, { nome_completo, re, cpf, funcao, ativo: true, centro_custo })
  revalidatePath('/funcionarios')
  redirect('/funcionarios?success=updated')
}

export async function toggleEmployeeStatusAction(formData: FormData) {
  const id = asString(formData, 'id')
  const ativo = formData.get('ativo') === 'true'
  await toggleEmployeeStatus(id, !ativo)
  revalidatePath('/funcionarios')
}
