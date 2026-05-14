import Link from 'next/link'
import { listTerms } from '@/lib/terms-supabase'
import { getCurrentProfile } from '@/lib/auth/profile'
import ExportPdfButton from './export-pdf-button'
import { formatDisplayLabel } from '@/lib/format-display'
import { finalizeDraftFromListAction } from './history-actions'

type SearchParams = Promise<{
  q?: string
  status?: string
  manutencao?: string
  contrato?: string
  centro_custo?: string
  supervisor?: string
  draft_saved?: string
  draft_updated?: string
  draft_finalized?: string
  draft_finalize_error?: string
}>

function formatDate(value: string) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('pt-BR')
}

function uniqueSorted(values: string[]) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b))
}

const fieldClass = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'

export default async function TermosPage({ searchParams }: { searchParams?: SearchParams }) {
  const params = (await searchParams) ?? {}
  const q = (params.q ?? '').trim().toLowerCase()
  const status = params.status ?? 'todos'
  const manutencao = params.manutencao ?? 'todos'
  const contrato = params.contrato ?? 'todos'
  const centro_custo = params.centro_custo ?? 'todos'
  const supervisor = params.supervisor ?? 'todos'

  const profile = await getCurrentProfile()
  const isAdmin = profile?.role === 'admin'
  const terms = await listTerms()

  const contratos = uniqueSorted(terms.map(t => t.contrato))
  const centrosCusto = uniqueSorted(terms.map(t => t.centro_custo))
  const supervisores = uniqueSorted(terms.map(t => t.supervisor))

  const filteredTerms = terms.filter(term => {
    const matchesSearch = !q ||
      term.numero_termo.toLowerCase().includes(q) ||
      term.funcionario_nome.toLowerCase().includes(q) ||
      term.tipo_equipamento.toLowerCase().includes(q) ||
      term.patrimonio.toLowerCase().includes(q) ||
      term.supervisor.toLowerCase().includes(q) ||
      term.contrato.toLowerCase().includes(q) ||
      term.centro_custo.toLowerCase().includes(q) ||
      (term.matricula ?? '').toLowerCase().includes(q)
    const matchesStatus = status === 'todos' ? true : term.status === status
    const matchesMaintenance = manutencao === 'todos' ? true : manutencao === 'em_manutencao' ? term.em_manutencao === true : term.em_manutencao === false
    const matchesContrato = contrato === 'todos' ? true : term.contrato === contrato
    const matchesCentroCusto = centro_custo === 'todos' ? true : term.centro_custo === centro_custo
    const matchesSupervisor = supervisor === 'todos' ? true : term.supervisor === supervisor
    return matchesSearch && matchesStatus && matchesMaintenance && matchesContrato && matchesCentroCusto && matchesSupervisor
  })

  const pdfTerms = filteredTerms.map(term => ({
    numero_termo: term.numero_termo,
    funcionario_nome: term.funcionario_nome,
    matricula: term.matricula,
    tipo_equipamento: term.tipo_equipamento,
    patrimonio: term.patrimonio,
    supervisor: term.supervisor,
    contrato: term.contrato,
    centro_custo: term.centro_custo,
    status: term.status,
    em_manutencao: term.em_manutencao,
    data_entrega: term.data_entrega,
    is_draft: term.is_draft,
  }))

  const bannerMessage =
    params.draft_saved ? 'Rascunho salvo com sucesso.' :
    params.draft_updated ? 'Rascunho atualizado com sucesso.' :
    params.draft_finalized ? 'Rascunho finalizado com sucesso.' :
    params.draft_finalize_error ? 'Não foi possível finalizar o rascunho.' : ''

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Gestão</p>
          <h1 className="mt-1 text-3xl font-black text-slate-900">Termos</h1>
          <p className="mt-1 text-sm text-slate-500">Histórico completo de termos de responsabilidade.</p>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <ExportPdfButton
              terms={pdfTerms}
              filters={{ q: params.q ?? '', status, manutencao, contrato, centro_custo, supervisor }}
            />
          )}
          <Link href="/termos/novo" className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700 transition">
            + Novo termo
          </Link>
        </div>
      </div>

      {bannerMessage && (
        <div className={`rounded-xl px-4 py-3 text-sm font-medium ${
          params.draft_finalize_error
            ? 'bg-red-50 border border-red-200 text-red-700'
            : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
        }`}>
          {bannerMessage}
        </div>
      )}

      <form className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
        <div className="grid gap-3 md:grid-cols-6">
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Buscar</label>
            <input type="text" name="q" defaultValue={params.q ?? ''}
              placeholder="Número, funcionário, patrimônio..."
              className={fieldClass} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Status</label>
            <select name="status" defaultValue={status} className={fieldClass}>
              <option value="todos">Todos</option>
              <option value="ENTREGUE">Em campo</option>
              <option value="DEVOLVIDO">Devolvido</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Manutenção</label>
            <select name="manutencao" defaultValue={manutencao} className={fieldClass}>
              <option value="todos">Todos</option>
              <option value="em_manutencao">Em manutenção</option>
              <option value="sem_manutencao">Sem manutenção</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Contrato</label>
            <select name="contrato" defaultValue={contrato} className={fieldClass}>
              <option value="todos">Todos</option>
              {contratos.map(item => <option key={item} value={item}>{formatDisplayLabel(item)}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Centro de custo</label>
            <select name="centro_custo" defaultValue={centro_custo} className={fieldClass}>
              <option value="todos">Todos</option>
              {centrosCusto.map(item => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-6">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Supervisor</label>
            <select name="supervisor" defaultValue={supervisor} className={fieldClass}>
              <option value="todos">Todos</option>
              {supervisores.map(item => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>
          <div className="flex items-end gap-2">
            <button type="submit" className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700 transition">
              Filtrar
            </button>
            <Link href="/termos" className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition">
              Limpar
            </Link>
          </div>
        </div>
      </form>

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          <span className="font-bold text-slate-800">{filteredTerms.length}</span> registro{filteredTerms.length !== 1 ? 's' : ''} encontrado{filteredTerms.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="grid grid-cols-7 gap-4 bg-slate-50 px-4 py-3 border-b border-slate-200 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <div>Nº Termo</div>
          <div>Funcionário</div>
          <div>Equipamento</div>
          <div>Supervisor</div>
          <div>Situação</div>
          <div>Entrega</div>
          <div>Ação</div>
        </div>

        {filteredTerms.length === 0 ? (
          <div className="px-4 py-12 text-center text-sm text-slate-400">
            Nenhum termo encontrado com os filtros atuais.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredTerms.map(term => (
              <div key={term.id} className="grid grid-cols-7 gap-4 px-4 py-4 text-sm text-slate-800 hover:bg-slate-50 transition">
                <div className="font-semibold text-indigo-600">{term.numero_termo}</div>
                <div>
                  <p>{term.funcionario_nome}</p>
                  <p className="text-xs text-slate-400">Mat: {term.matricula}</p>
                </div>
                <div>
                  <p>{term.tipo_equipamento}</p>
                  <p className="text-xs text-slate-400">Pat: {term.patrimonio}</p>
                </div>
                <div>
                  <p>{term.supervisor}</p>
                  <p className="text-xs text-slate-400">{term.centro_custo}</p>
                </div>
                <div className="space-y-1.5">
                  {term.is_draft ? (
                    <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">RASCUNHO</span>
                  ) : (
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      term.status === 'DEVOLVIDO' ? 'bg-slate-100 text-slate-600' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {term.status === 'DEVOLVIDO' ? 'DEVOLVIDO' : 'EM CAMPO'}
                    </span>
                  )}
                  {term.em_manutencao && (
                    <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">MANUTENÇÃO</span>
                  )}
                </div>
                <div className="text-slate-600">{formatDate(term.data_entrega)}</div>
                <div className="flex flex-col gap-1.5">
                  <Link href={`/termos/${term.id}`} className="text-xs font-semibold text-indigo-600 hover:underline">Abrir</Link>
                  {term.is_draft ? (
                    <>
                      <Link href={`/termos/${term.id}/editar`} className="text-xs font-semibold text-amber-600 hover:underline">Editar</Link>
                      <form action={finalizeDraftFromListAction}>
                        <input type="hidden" name="term_id" value={term.id} />
                        <button type="submit" className="text-left text-xs font-semibold text-blue-600 hover:underline">Finalizar</button>
                      </form>
                    </>
                  ) : (
                    <Link href={`/termos/${term.id}/imprimir`} className="text-xs font-semibold text-slate-500 hover:underline">Imprimir</Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
