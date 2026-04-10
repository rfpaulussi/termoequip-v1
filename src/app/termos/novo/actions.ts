'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createTerm } from '@/lib/terms-supabase'

function asString(formData: FormData, key: string) {
  return String(formData.get(key) ?? '').trim()
}

function generateTermNumber() {
  const now = new Date()
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  const hh = String(now.getHours()).padStart(2, '0')
  const mi = String(now.getMinutes()).padStart(2, '0')
  const ss = String(now.getSeconds()).padStart(2, '0')
  return `TERM-${yyyy}${mm}${dd}-${hh}${mi}${ss}`
}

export async function createTermAction(formData: FormData) {
  const contrato = asString(formData, 'contrato')
  const centro_custo = asString(formData, 'centro_custo')
  const supervisor = asString(formData, 'supervisor')
  const encarregado = asString(formData, 'encarregado')
  const data_entrega = asString(formData, 'data_entrega')
  const funcionario_nome = asString(formData, 'funcionario_nome')
  const matricula = asString(formData, 'matricula')
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
    !contrato ||
    !centro_custo ||
    !supervisor ||
    !funcionario_nome ||
    !matricula ||
    !funcao ||
    !tipo_equipamento ||
    !patrimonio
  ) {
    redirect('/termos/novo?error=required')
  }

  const created = await createTerm({
    numero_termo: generateTermNumber(),
    contrato,
    centro_custo,
    supervisor,
    encarregado: encarregado || null,
    data_entrega: data_entrega || new Date().toISOString().slice(0, 10),
    funcionario_nome,
    matricula,
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
  })

  revalidatePath('/termos')
  redirect(`/termos/${created.id}`)
}
