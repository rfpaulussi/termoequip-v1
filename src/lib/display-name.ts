/** Nomes vindos do GI/termos antigos chegam em CAIXA ALTA; exibe em Título. */
export function displayName(name: string) {
  if (name !== name.toUpperCase()) return name
  return name
    .toLowerCase()
    .replace(/(^|\s)(\p{L})/gu, (_, sp: string, ch: string) => sp + ch.toUpperCase())
    .replace(/\b(Da|De|Do|Das|Dos|E)\b/g, m => m.toLowerCase())
}

export function plural(n: number, one: string, many: string) {
  return `${n} ${n === 1 ? one : many}`
}

export function initials(name: string) {
  return name.split(' ').filter(Boolean).slice(0, 2).map(p => p[0]).join('').toUpperCase()
}
