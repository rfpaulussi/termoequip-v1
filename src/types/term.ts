export type TermStatus = "ENTREGUE" | "DEVOLVIDO";

export type ReturnCondition =
  | "EM_PERFEITO_ESTADO"
  | "COM_DEFEITO"
  | "FALTANDO_PECAS";

export interface TermReturn {
  dataDevolucao: string;
  condicao: ReturnCondition;
  observacoes: string;
  responsavelRecebimento: string;
}

export interface EquipmentTerm {
  id: string;
  numeroTermo: string;
  contrato: string;
  centroCusto: string;
  supervisor: string;
  encarregado: string;
  dataEntrega: string;

  funcionarioNome: string;
  matricula: string;
  funcao: string;

  tipoEquipamento: string;
  marca: string;
  modelo: string;
  numeroSerie: string;
  patrimonio: string;
  estadoEntrega: string;
  acessorios: string;
  observacoes: string;

  status: TermStatus;
  createdAt: string;
  devolucao?: TermReturn;
}