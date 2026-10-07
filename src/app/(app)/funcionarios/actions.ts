'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createEmployee, updateEmployee, toggleEmployeeStatus, listEmployees } from '@/lib/terms-supabase'
import { getCurrentProfile } from '@/lib/auth/profile'
import { createClient } from '@/lib/supabase/server'
import { formatCpf, isValidCpf, type ImportRow } from '@/lib/employee-import'

function asString(formData: FormData, key: string) {
  return String(formData.get(key) ?? '').trim()
}

function classifyError(message: string): string {
  if (message.includes('employees_cpf_key') || message.includes('unique') && message.includes('cpf')) {
    return 'cpf_duplicado'
  }
  if (message.includes('employees_re_key') || message.includes('unique') && message.includes('re')) {
    return 're_duplicado'
  }
  return 'save_failed'
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

  try {
    await createEmployee({ nome_completo, re, cpf, funcao, ativo: true, centro_custo })
  } catch (err) {
    const message = err instanceof Error ? err.message : ''
    redirect(`/funcionarios?error=${classifyError(message)}`)
  }

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

  try {
    await updateEmployee(id, { nome_completo, re, cpf, funcao, ativo: true, centro_custo })
  } catch (err) {
    const message = err instanceof Error ? err.message : ''
    redirect(`/funcionarios?error=${classifyError(message)}`)
  }

  revalidatePath('/funcionarios')
  redirect('/funcionarios?success=updated')
}

export type ImportResult = {
  ok: boolean
  created: number
  errors: { line: number; nome: string; motivo: string }[]
  message?: string
}

export async function importEmployeesAction(rows: ImportRow[]): Promise<ImportResult> {
  const profile = await getCurrentProfile()
  if (!profile) return { ok: false, created: 0, errors: [], message: 'Sessão expirada.' }
  if (!Array.isArray(rows) || rows.length === 0) {
    return { ok: false, created: 0, errors: [], message: 'Nenhuma linha para importar.' }
  }
  if (rows.length > 500) {
    return { ok: false, created: 0, errors: [], message: 'Limite de 500 linhas por importação.' }
  }

  const isAdmin = profile.role === 'superadmin' || profile.role === 'admin'
  const supabase = await createClient()
  const [{ data: funcoes }, { data: contratos }, existing] = await Promise.all([
    supabase.from('job_functions').select('nome').eq('ativo', true),
    supabase.from('contracts').select('centro_custo').eq('ativo', true),
    listEmployees(),
  ])
  const funcoesOk = new Set((funcoes ?? []).map(f => f.nome))
  const centrosOk = new Set((contratos ?? []).map(c => c.centro_custo))
  const usedCpf = new Set(existing.map(e => e.cpf.replace(/\D/g, '')))
  const usedRe = new Set(existing.map(e => e.re))

  const errors: ImportResult['errors'] = []
  let created = 0

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i]
    const nome = String(r.nome_completo ?? '').trim()
    const re = String(r.re ?? '').trim()
    const cpf = formatCpf(String(r.cpf ?? ''))
    const funcao = String(r.funcao ?? '').trim()
    const centro = r.centro_custo ? String(r.centro_custo).trim() : null
    const fail = (motivo: string) => errors.push({ line: i + 2, nome: nome || '(sem nome)', motivo })

    if (!nome || !re || !cpf || !funcao) { fail('Campo obrigatório vazio.'); continue }
    if (!isValidCpf(cpf)) { fail('CPF inválido.'); continue }
    if (!funcoesOk.has(funcao)) { fail(`Função "${funcao}" não cadastrada.`); continue }
    if (centro && !centrosOk.has(centro)) { fail(`Centro de custo "${centro}" não existe.`); continue }
    if (!isAdmin && (!centro || !profile.centros_custo.includes(centro))) {
      fail('Sem permissão para este centro de custo.'); continue
    }
    const digits = cpf.replace(/\D/g, '')
    if (usedCpf.has(digits)) { fail('CPF já cadastrado ou repetido no arquivo.'); continue }
    if (usedRe.has(re)) { fail('RE já cadastrado ou repetido no arquivo.'); continue }

    try {
      await createEmployee({ nome_completo: nome, re, cpf, funcao, ativo: true, centro_custo: centro })
      usedCpf.add(digits)
      usedRe.add(re)
      created++
    } catch (err) {
      const k = classifyError(err instanceof Error ? err.message : '')
      fail(k === 'cpf_duplicado' ? 'CPF duplicado.' : k === 're_duplicado' ? 'RE duplicado.' : 'Erro ao salvar.')
    }
  }

  if (created > 0) revalidatePath('/funcionarios')
  return { ok: errors.length === 0, created, errors }
}

export async function toggleEmployeeStatusAction(formData: FormData) {
  const id = asString(formData, 'id')
  const ativo = formData.get('ativo') === 'true'
  try {
    await toggleEmployeeStatus(id, !ativo)
  } catch {
    // silencia — a lista vai recarregar sem mudança
  }
  revalidatePath('/funcionarios')
}
