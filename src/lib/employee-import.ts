export type ImportRow = {
  nome_completo: string
  re: string
  cpf: string
  funcao: string
  centro_custo: string | null
}

export const IMPORT_COLUMNS = ['nome_completo', 're', 'cpf', 'funcao', 'centro_custo'] as const

export function isValidCpf(value: string): boolean {
  const cpf = value.replace(/\D/g, '')
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false
  for (const n of [9, 10]) {
    let sum = 0
    for (let i = 0; i < n; i++) sum += Number(cpf[i]) * (n + 1 - i)
    if (((sum * 10) % 11) % 10 !== Number(cpf[n])) return false
  }
  return true
}

export function formatCpf(value: string): string {
  const d = value.replace(/\D/g, '')
  return d.length === 11 ? `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}` : value.trim()
}

function splitLine(line: string, sep: string): string[] {
  const out: string[] = []
  let cur = ''
  let quoted = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (quoted) {
      if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++ }
      else if (ch === '"') quoted = false
      else cur += ch
    } else if (ch === '"') quoted = true
    else if (ch === sep) { out.push(cur); cur = '' }
    else cur += ch
  }
  out.push(cur)
  return out.map(s => s.trim())
}

/** Lê CSV (separador `,` ou `;`) com cabeçalho. Colunas extras (id, ativo, ...) são ignoradas. */
export function parseEmployeeCsv(text: string): { rows: ImportRow[]; error?: string } {
  const lines = text.replace(/^﻿/, '').split(/\r?\n/).filter(l => l.trim())
  if (lines.length < 2) return { rows: [], error: 'Arquivo vazio ou sem linhas de dados.' }

  const sep = lines[0].split(';').length > lines[0].split(',').length ? ';' : ','
  const header = splitLine(lines[0], sep).map(h => h.toLowerCase())
  const idx = Object.fromEntries(IMPORT_COLUMNS.map(c => [c, header.indexOf(c)]))
  const missing = IMPORT_COLUMNS.filter(c => c !== 'centro_custo' && idx[c] < 0)
  if (missing.length) return { rows: [], error: `Colunas ausentes no cabeçalho: ${missing.join(', ')}.` }

  const rows = lines.slice(1).map(line => {
    const cells = splitLine(line, sep)
    const get = (c: (typeof IMPORT_COLUMNS)[number]) => (idx[c] >= 0 ? cells[idx[c]] ?? '' : '')
    return {
      nome_completo: get('nome_completo'),
      re: get('re'),
      cpf: formatCpf(get('cpf')),
      funcao: get('funcao'),
      centro_custo: get('centro_custo') || null,
    }
  })
  return { rows }
}
