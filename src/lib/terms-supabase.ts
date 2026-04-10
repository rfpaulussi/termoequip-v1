import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database'
import type { TermInsert, TermReturnInsert } from '@/types/term'

type EquipmentTermRow = Database['public']['Tables']['equipment_terms']['Row']
type EquipmentTermInsert = Database['public']['Tables']['equipment_terms']['Insert']
type TermReturnRow = Database['public']['Tables']['term_returns']['Row']
type TermReturnInsertDb = Database['public']['Tables']['term_returns']['Insert']

export async function listTerms() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('equipment_terms')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Erro ao listar termos: ${error.message}`)
  }

  return data
}

export async function getTermById(id: string) {
  const supabase = await createClient()

  const { data: term, error: termError } = await supabase
    .from('equipment_terms')
    .select('*')
    .eq('id', id)
    .single()

  if (termError) {
    throw new Error(`Erro ao buscar termo: ${termError.message}`)
  }

  const { data: termReturn, error: returnError } = await supabase
    .from('term_returns')
    .select('*')
    .eq('term_id', id)
    .maybeSingle()

  if (returnError) {
    throw new Error(`Erro ao buscar devolução: ${returnError.message}`)
  }

  return {
    term,
    termReturn,
  }
}

export async function createTerm(input: TermInsert) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const payload: EquipmentTermInsert = {
    numero_termo: input.numero_termo,
    funcionario_nome: input.funcionario_nome,
    matricula: input.matricula,
    funcao: input.funcao,
    centro_custo: input.centro_custo,
    contrato: input.contrato,
    supervisor: input.supervisor,
    tipo_equipamento: input.tipo_equipamento,
    patrimonio: input.patrimonio,
    data_entrega: input.data_entrega ?? new Date().toISOString(),
    status: input.status ?? 'ENTREGUE',
    marca: input.marca ?? null,
    modelo: input.modelo ?? null,
    numero_serie: input.numero_serie ?? null,
    acessorios: input.acessorios ?? null,
    encarregado: input.encarregado ?? null,
    estado_entrega: input.estado_entrega ?? null,
    observacoes: input.observacoes ?? null,
    created_by: user?.id ?? null,
  }

  const { data, error } = await supabase
    .from('equipment_terms')
    .insert(payload)
    .select()
    .single()

  if (error) {
    throw new Error(`Erro ao criar termo: ${error.message}`)
  }

  return data
}

export async function registerTermReturn(input: TermReturnInsert) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const payload: TermReturnInsertDb = {
    term_id: input.term_id,
    data_devolucao: input.data_devolucao,
    condicao: input.condicao,
    responsavel_recebimento: input.responsavel_recebimento,
    observacoes: input.observacoes ?? null,
    created_by: user?.id ?? null,
  }

  const { data: createdReturn, error: returnError } = await supabase
    .from('term_returns')
    .insert(payload)
    .select()
    .single()

  if (returnError) {
    throw new Error(`Erro ao registrar devolução: ${returnError.message}`)
  }

  const { error: updateError } = await supabase
    .from('equipment_terms')
    .update({ status: 'DEVOLVIDO' })
    .eq('id', input.term_id)

  if (updateError) {
    throw new Error(`Erro ao atualizar status do termo: ${updateError.message}`)
  }

  return createdReturn
}
