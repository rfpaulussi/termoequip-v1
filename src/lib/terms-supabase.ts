import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database'
import type { TermInsert, TermReturnInsert } from '@/types/term'

type EquipmentTermInsert = Database['public']['Tables']['equipment_terms']['Insert']
type EquipmentTermUpdate = Database['public']['Tables']['equipment_terms']['Update']
type TermReturnInsertDb = Database['public']['Tables']['term_returns']['Insert']
type TermEventInsertDb = Database['public']['Tables']['term_events']['Insert']
type AppRole = Database['public']['Enums']['app_role']

async function createTermEvent(input: {
  term_id: string
  event_type:
    | 'TERM_CREATED'
    | 'DELIVERY_REGISTERED'
    | 'MAINTENANCE_ON'
    | 'MAINTENANCE_OFF'
    | 'RETURN_REGISTERED'
  title: string
  description?: string | null
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const payload: TermEventInsertDb = {
    term_id: input.term_id,
    event_type: input.event_type,
    title: input.title,
    description: input.description ?? null,
    created_by: user?.id ?? null,
  }

  const { error } = await supabase.from('term_events').insert(payload)

  if (error) {
    throw new Error(`Erro ao registrar evento: ${error.message}`)
  }
}

async function safeCreateTermEvent(input: {
  term_id: string
  event_type:
    | 'TERM_CREATED'
    | 'DELIVERY_REGISTERED'
    | 'MAINTENANCE_ON'
    | 'MAINTENANCE_OFF'
    | 'RETURN_REGISTERED'
  title: string
  description?: string | null
}) {
  try {
    await createTermEvent(input)
  } catch (error) {
    console.error('Falha ao registrar evento do termo:', error)
  }
}

export async function getCurrentRole(): Promise<AppRole | null> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (error) {
    throw new Error(`Erro ao buscar perfil: ${error.message}`)
  }

  return data?.role ?? null
}

export async function listTerms(centrosCusto?: string[]) {
  const supabase = await createClient()

  let query = supabase
    .from('equipment_terms')
    .select('*')
    .order('created_at', { ascending: false })

  if (centrosCusto && centrosCusto.length > 0) {
    query = query.in('centro_custo', centrosCusto)
  }

  const { data, error } = await query

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

  const { data: events, error: eventsError } = await supabase
    .from('term_events')
    .select('*')
    .eq('term_id', id)
    .order('created_at', { ascending: true })

  if (eventsError) {
    console.error('Falha ao buscar eventos do termo:', eventsError.message)
  }

  return {
    term,
    termReturn,
    events: events ?? [],
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
    cpf: input.cpf,
    funcao: input.funcao,
    centro_custo: input.centro_custo,
    contrato: input.contrato,
    supervisor: input.supervisor,
    tipo_equipamento: input.tipo_equipamento,
    patrimonio: input.patrimonio,
    data_entrega: input.data_entrega ?? new Date().toISOString(),
    status: input.status ?? 'ENTREGUE',
    is_draft: input.is_draft ?? false,
    is_reserva: input.is_reserva ?? false,
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

  await safeCreateTermEvent({
    term_id: data.id,
    event_type: 'TERM_CREATED',
    title: data.is_draft ? 'Rascunho salvo' : 'Termo criado',
    description: data.is_draft
      ? `Rascunho ${data.numero_termo} salvo para edição posterior.`
      : `Termo ${data.numero_termo} registrado no sistema.`,
  })

  if (!data.is_draft) {
    await safeCreateTermEvent({
      term_id: data.id,
      event_type: 'DELIVERY_REGISTERED',
      title: 'Entrega registrada',
      description: `Equipamento entregue para ${data.funcionario_nome}.`,
    })
  }

  return data
}

export async function updateDraftTerm(termId: string, input: TermInsert) {
  const supabase = await createClient()

  const payload: EquipmentTermUpdate = {
    numero_termo: input.numero_termo,
    funcionario_nome: input.funcionario_nome,
    matricula: input.matricula,
    cpf: input.cpf,
    funcao: input.funcao,
    centro_custo: input.centro_custo,
    contrato: input.contrato,
    supervisor: input.supervisor,
    tipo_equipamento: input.tipo_equipamento,
    patrimonio: input.patrimonio,
    data_entrega: input.data_entrega ?? new Date().toISOString(),
    status: input.status ?? 'ENTREGUE',
    is_draft: true,
    marca: input.marca ?? null,
    modelo: input.modelo ?? null,
    numero_serie: input.numero_serie ?? null,
    acessorios: input.acessorios ?? null,
    encarregado: input.encarregado ?? null,
    estado_entrega: input.estado_entrega ?? null,
    observacoes: input.observacoes ?? null,
  }

  const { data, error } = await supabase
    .from('equipment_terms')
    .update(payload)
    .eq('id', termId)
    .eq('is_draft', true)
    .select()
    .single()

  if (error) {
    throw new Error(`Erro ao atualizar rascunho: ${error.message}`)
  }

  return data
}

export async function finalizeDraftTerm(termId: string) {
  const supabase = await createClient()

  const { data: term, error: fetchError } = await supabase
    .from('equipment_terms')
    .select('*')
    .eq('id', termId)
    .single()

  if (fetchError || !term) {
    throw new Error(`Erro ao localizar rascunho: ${fetchError?.message ?? 'não encontrado'}`)
  }

  if (!term.is_draft) {
    return term
  }

  const { data, error } = await supabase
    .from('equipment_terms')
    .update({ is_draft: false })
    .eq('id', termId)
    .select()
    .single()

  if (error) {
    throw new Error(`Erro ao finalizar rascunho: ${error.message}`)
  }

  await safeCreateTermEvent({
    term_id: termId,
    event_type: 'DELIVERY_REGISTERED',
    title: 'Entrega registrada',
    description: `Equipamento entregue para ${data.funcionario_nome}.`,
  })

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

  await safeCreateTermEvent({
    term_id: input.term_id,
    event_type: 'RETURN_REGISTERED',
    title: 'Devolução registrada',
    description: `Recebido por ${input.responsavel_recebimento}.`,
  })

  return createdReturn
}

export async function setTermMaintenance(
  termId: string,
  input: {
    em_manutencao: boolean
    observacao_manutencao?: string | null
    data_manutencao?: string | null
  }
) {
  const supabase = await createClient()

  const payload = {
    em_manutencao: input.em_manutencao,
    data_manutencao: input.em_manutencao
      ? (input.data_manutencao ?? new Date().toISOString())
      : null,
    observacao_manutencao: input.em_manutencao
      ? input.observacao_manutencao ?? null
      : null,
  }

  const { data, error } = await supabase
    .from('equipment_terms')
    .update(payload)
    .eq('id', termId)
    .select()
    .single()

  if (error) {
    throw new Error(`Erro ao atualizar manutenção: ${error.message}`)
  }

  await safeCreateTermEvent({
    term_id: termId,
    event_type: input.em_manutencao ? 'MAINTENANCE_ON' : 'MAINTENANCE_OFF',
    title: input.em_manutencao
      ? 'Equipamento em manutenção'
      : 'Equipamento retirado de manutenção',
    description: input.em_manutencao
      ? input.observacao_manutencao || 'Equipamento sinalizado em manutenção.'
      : 'Manutenção encerrada.',
  })

  return data
}

export async function listEmployees(centrosCusto?: string[]) {
  const supabase = await createClient()
  let query = supabase
    .from('employees')
    .select('*')
    .order('nome_completo')
  if (centrosCusto && centrosCusto.length > 0) {
    query = query.in('centro_custo', centrosCusto)
  }
  const { data, error } = await query
  if (error) throw new Error(`Erro ao listar funcionários: ${error.message}`)
  return data
}

export async function createEmployee(input: {
  nome_completo: string
  re: string
  cpf: string
  funcao: string
  ativo: boolean
  centro_custo: string | null
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('employees')
    .insert({ ...input, created_by: user?.id ?? null })
    .select()
    .single()
  if (error) throw new Error(`Erro ao criar funcionário: ${error.message}`)
  return data
}

export async function updateEmployee(
  id: string,
  input: { nome_completo: string; re: string; cpf: string; funcao: string; ativo: boolean; centro_custo: string | null }
) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('employees')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(`Erro ao atualizar funcionário: ${error.message}`)
  return data
}

export async function toggleEmployeeStatus(id: string, ativo: boolean) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('employees')
    .update({ ativo, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw new Error(`Erro ao atualizar status: ${error.message}`)
}

export async function deleteTermById(termId: string) {
  const supabase = await createClient()

  const role = await getCurrentRole()

  if (role !== 'superadmin') {
    throw new Error('Apenas admin pode excluir termos.')
  }

  const { error: eventsDeleteError } = await supabase
    .from('term_events')
    .delete()
    .eq('term_id', termId)

  if (eventsDeleteError) {
    throw new Error(`Erro ao excluir eventos: ${eventsDeleteError.message}`)
  }

  const { error: returnDeleteError } = await supabase
    .from('term_returns')
    .delete()
    .eq('term_id', termId)

  if (returnDeleteError) {
    throw new Error(`Erro ao excluir devolução: ${returnDeleteError.message}`)
  }

  const { error } = await supabase
    .from('equipment_terms')
    .delete()
    .eq('id', termId)

  if (error) {
    throw new Error(`Erro ao excluir termo: ${error.message}`)
  }

  return true
}
