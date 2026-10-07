function normalizeSegment(value: string, fallback: string, maxLength = 12) {
  const cleaned = value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()

  return (cleaned || fallback).slice(0, maxLength)
}

export function generateTermNumber(input: {
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
