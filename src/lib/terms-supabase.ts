import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database'
import type { TermInsert, TermReturnInsert } from '@/types/term'

type EquipmentTermInsert = Database['public']['Tables']['equipment_terms']['Insert']
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

  await safeCreateTermEvent({
    term_id: data.id,
    event_type: 'TERM_CREATED',
    title: 'Termo criado',
    description: `Termo ${data.numero_termo} registrado no sistema.`,
  })

  await safeCreateTermEvent({
    term_id: data.id,
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
  input: { em_manutencao: boolean; observacao_manutencao?: string | null }
) {
  const supabase = await createClient()

  const payload = {
    em_manutencao: input.em_manutencao,
    data_manutencao: input.em_manutencao ? new Date().toISOString() : null,
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

export async function deleteTermById(termId: string) {
  const supabase = await createClient()

  const role = await getCurrentRole()

  if (role !== 'admin') {
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
