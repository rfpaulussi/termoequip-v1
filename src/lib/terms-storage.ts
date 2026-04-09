import { EquipmentTerm, ReturnCondition } from "@/types/term";

const STORAGE_KEY = "termoequip_terms_v1";

function isBrowser() {
  return typeof window !== "undefined";
}

function persistTerms(terms: EquipmentTerm[]) {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(terms));
}

export function getStoredTerms(): EquipmentTerm[] {
  if (!isBrowser()) return [];

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as EquipmentTerm[];
    return parsed.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch {
    return [];
  }
}

function getNextTermNumber(existingTerms: EquipmentTerm[]) {
  const nextNumber = existingTerms.length + 1;
  const year = new Date().getFullYear();
  return `TE-${year}-${String(nextNumber).padStart(6, "0")}`;
}

export interface CreateTermInput {
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
}

export function createTerm(input: CreateTermInput): EquipmentTerm {
  const existingTerms = getStoredTerms();

  const newTerm: EquipmentTerm = {
    id: crypto.randomUUID(),
    numeroTermo: getNextTermNumber(existingTerms),
    status: "ENTREGUE",
    createdAt: new Date().toISOString(),
    ...input,
  };

  persistTerms([newTerm, ...existingTerms]);
  return newTerm;
}

export function getStoredTermById(id: string): EquipmentTerm | null {
  const terms = getStoredTerms();
  return terms.find((term) => term.id === id) ?? null;
}

export interface RegisterReturnInput {
  dataDevolucao: string;
  condicao: ReturnCondition;
  observacoes: string;
  responsavelRecebimento: string;
}

export function registerTermReturn(
  id: string,
  input: RegisterReturnInput
): EquipmentTerm | null {
  const terms = getStoredTerms();
  const index = terms.findIndex((term) => term.id === id);

  if (index === -1) return null;

  const updatedTerm: EquipmentTerm = {
    ...terms[index],
    status: "DEVOLVIDO",
    devolucao: {
      dataDevolucao: input.dataDevolucao,
      condicao: input.condicao,
      observacoes: input.observacoes,
      responsavelRecebimento: input.responsavelRecebimento,
    },
  };

  terms[index] = updatedTerm;
  persistTerms(terms);

  return updatedTerm;
}