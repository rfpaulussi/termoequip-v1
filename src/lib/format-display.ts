const LOWER_WORDS = new Set([
  'de',
  'da',
  'do',
  'das',
  'dos',
  'e',
  'em',
  'para',
  'por',
  'com',
  'sem',
  'na',
  'no',
  'nas',
  'nos',
  'a',
  'o',
  'as',
  'os',
])

const ACRONYMS = new Set([
  'CT',
  'LP',
  'AV',
  'PE',
  'SP',
  'PQ',
  'USCS',
  'CC',
])

function formatPiece(piece: string, isFirstWord: boolean) {
  if (!piece) return piece
  if (/^\d+$/.test(piece)) return piece
  if (/^\d[\d./-]*$/.test(piece)) return piece
  if (ACRONYMS.has(piece.toUpperCase())) return piece.toUpperCase()

  const lower = piece.toLowerCase()

  if (!isFirstWord && LOWER_WORDS.has(lower)) {
    return lower
  }

  return lower.charAt(0).toUpperCase() + lower.slice(1)
}

function formatToken(token: string, isFirstWord: boolean) {
  return token
    .split(/([/-])/)
    .map((part) => {
      if (part === '/' || part === '-') return part
      return formatPiece(part, isFirstWord)
    })
    .join('')
}

export function formatDisplayLabel(value: string | null | undefined) {
  if (!value) return ''

  const words = value.trim().split(/\s+/)

  return words
    .map((word, index) => formatToken(word, index === 0))
    .join(' ')
}
