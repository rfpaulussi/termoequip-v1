export type ReturnCondition =
  | 'EM_PERFEITO_ESTADO'
  | 'COM_DEFEITO'
  | 'FALTANDO_PECAS'

export type TermStatus =
  | 'ENTREGUE'
  | 'DEVOLVIDO'

export type TermInsert = {
  numero_termo: string
  funcionario_nome: string
  matricula: string
  cpf: string
  funcao: string
  centro_custo: string
  contrato: string
  supervisor: string
  tipo_equipamento: string
  patrimonio: string
  data_entrega?: string
  status?: TermStatus
  is_draft?: boolean
  marca?: string | null
  modelo?: string | null
  numero_serie?: string | null
  acessorios?: string | null
  encarregado?: string | null
  estado_entrega?: string | null
  observacoes?: string | null
}

export type TermReturnInsert = {
  term_id: string
  data_devolucao: string
  condicao: ReturnCondition
  responsavel_recebimento: string
  observacoes?: string | null
}
