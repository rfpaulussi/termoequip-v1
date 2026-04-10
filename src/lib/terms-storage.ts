const STORAGE_KEY = 'termoequip_terms_v1'

export type ReturnCondition =
  | 'EM_PERFEITO_ESTADO'
  | 'COM_DEFEITO'
  | 'FALTANDO_PECAS'

export type EquipmentTermStatus = 'ENTREGUE' | 'DEVOLVIDO'

export type LegacyTermForm = {
  contrato: string
  centroCusto: string
  supervisor: string
  encarregado: string
  dataEntrega: string
  funcionarioNome: string
  matricula: string
  funcao: string
  tipoEquipamento: string
  marca: string
  modelo: string
  numeroSerie: string
  patrimonio: string
  estadoEntrega: string
  acessorios: string
  observacoes: string
}

export type EquipmentTerm = {
  id: string
  numeroTermo: string
  contrato: string
  centroCusto: string
  supervisor: string
  encarregado: string
  dataEntrega: string
  funcionarioNome: string
  matricula: string
  funcao: string
  tipoEquipamento: string
  marca: string
  modelo: string
  numeroSerie: string
  patrimonio: string
  estadoEntrega: string
  acessorios: string
  observacoes: string
  status: EquipmentTermStatus
  createdAt: string
  devolucao?: {
    dataDevolucao: string
    condicao: ReturnCondition
    responsavelRecebimento: string
    observacoes: string
  } | null
}

function readTerms(): EquipmentTerm[] {
  if (typeof window === 'undefined') return []

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []

    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeTerms(terms: EquipmentTerm[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(terms))
}

function generateId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return `term-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
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

export function getTerms() {
  return readTerms()
}

export function getTermById(id: string) {
  return readTerms().find((term) => term.id === id) ?? null
}

export function createTerm(form: LegacyTermForm) {
  const terms = readTerms()

  const newTerm: EquipmentTerm = {
    id: generateId(),
    numeroTermo: generateTermNumber(),
    contrato: form.contrato,
    centroCusto: form.centroCusto,
    supervisor: form.supervisor,
    encarregado: form.encarregado,
    dataEntrega: form.dataEntrega,
    funcionarioNome: form.funcionarioNome,
    matricula: form.matricula,
    funcao: form.funcao,
    tipoEquipamento: form.tipoEquipamento,
    marca: form.marca,
    modelo: form.modelo,
    numeroSerie: form.numeroSerie,
    patrimonio: form.patrimonio,
    estadoEntrega: form.estadoEntrega,
    acessorios: form.acessorios,
    observacoes: form.observacoes,
    status: 'ENTREGUE',
    createdAt: new Date().toISOString(),
    devolucao: null,
  }

  const updated = [newTerm, ...terms]
  writeTerms(updated)

  return newTerm
}

export function registerReturn(
  id: string,
  payload: {
    dataDevolucao: string
    condicao: ReturnCondition
    responsavelRecebimento: string
    observacoes: string
  }
) {
  const terms = readTerms()

  const updated = terms.map((term) => {
    if (term.id !== id) return term

    return {
      ...term,
      status: 'DEVOLVIDO' as EquipmentTermStatus,
      devolucao: {
        dataDevolucao: payload.dataDevolucao,
        condicao: payload.condicao,
        responsavelRecebimento: payload.responsavelRecebimento,
        observacoes: payload.observacoes,
      },
    }
  })

  writeTerms(updated)

  return updated.find((term) => term.id === id) ?? null
}
