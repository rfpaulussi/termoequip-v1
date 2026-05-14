'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { updateDraftTerm } from '@/lib/terms-supabase'

function asString(formData: FormData, key: string) {
  return String(formData.get(key) ?? '').trim()
}

function normalizeCpf(value: string) {
  return value.replace(/\D/g, '')
}

function isValidCPF(value: string) {
  const cpf = normalizeCpf(value)

  if (cpf.length !== 11) return false
  if (/^(\d)\1{10}$/.test(cpf)) return false

  let sum = 0
  for (let i = 0; i < 9; i++) sum += Number(cpf[i]) * (10 - i)

  let remainder = (sum * 10) % 11
  if (remainder === 10) remainder = 0
  if (remainder !== Number(cpf[9])) return false

  sum = 0
  for (let i = 0; i < 10; i++) sum += Number(cpf[i]) * (11 - i)

  remainder = (sum * 10) % 11
  if (remainder === 10) remainder = 0

  return remainder === Number(cpf[10])
}

function normalizeSegment(value: string, fallback: string, maxLength = 12) {
  const cleaned = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()

  return (cleaned || fallback).slice(0, maxLength)
}

function generateTermNumber(input: {
  centro_custo: string
  matricula: string
  patrimonio: string
}) {
  const now = new Date()
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')

  const centroCusto = normalizeSegment(input.centro_custo, 'CC', 10)
  const matricula = normalizeSegment(input.matricula, 'MAT', 10)
  const patrimonio = normalizeSegment(input.patrimonio, 'PAT', 14)

  return `TE-${centroCusto}-${matricula}-${patrimonio}-${yyyy}${mm}${dd}`
}

export async function updateDraftTermAction(formData: FormData) {
  const id = asString(formData, 'id')
  const contrato = asString(formData, 'contrato')
  const centro_custo = asString(formData, 'centro_custo')
  const supervisor = asString(formData, 'supervisor')
  const encarregado = asString(formData, 'encarregado')
  const data_entrega = asString(formData, 'data_entrega')
  const funcionario_nome = asString(formData, 'funcionario_nome')
  const matricula = asString(formData, 'matricula')
  const cpf = normalizeCpf(asString(formData, 'cpf'))
  const funcao = asString(formData, 'funcao')
  const tipo_equipamento = asString(formData, 'tipo_equipamento')
  const marca = asString(formData, 'marca')
  const modelo = asString(formData, 'modelo')
  const numero_serie = asString(formData, 'numero_serie')
  const patrimonio = asString(formData, 'patrimonio')
  const estado_entrega = asString(formData, 'estado_entrega')
  const acessorios = asString(formData, 'acessorios')
  const observacoes = asString(formData, 'observacoes')

  if (
    !id ||
    !contrato ||
    !centro_custo ||
    !supervisor ||
    !funcionario_nome ||
    !matricula ||
    !cpf ||
    !funcao ||
    !tipo_equipamento ||
    !patrimonio
  ) {
    redirect(`/termos/${id}/editar?error=required`)
  }

  if (!isValidCPF(cpf)) {
    redirect(`/termos/${id}/editar?error=cpf_invalid`)
  }

  try {
    await updateDraftTerm(id, {
      numero_termo: generateTermNumber({
        centro_custo,
        matricula,
        patrimonio,
      }),
      contrato,
      centro_custo,
      supervisor,
      encarregado: encarregado || null,
      data_entrega: data_entrega || new Date().toISOString().slice(0, 10),
      funcionario_nome,
      matricula,
      cpf,
      funcao,
      tipo_equipamento,
      marca: marca || null,
      modelo: modelo || null,
      numero_serie: numero_serie || null,
      patrimonio,
      estado_entrega: estado_entrega || null,
      acessorios: acessorios || null,
      observacoes: observacoes || null,
      status: 'ENTREGUE',
      is_draft: true,
    })
  } catch (error) {
    console.error('Erro ao atualizar rascunho:', error)
    redirect(`/termos/${id}/editar?error=update_failed`)
  }

  revalidatePath('/termos')
  revalidatePath(`/termos/${id}`)
  redirect('/termos?draft_updated=1')
}
