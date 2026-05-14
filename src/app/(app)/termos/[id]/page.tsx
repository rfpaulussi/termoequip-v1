import Link from 'next/link'
import { redirect } from 'next/navigation'
import { clearMaintenanceAction, markMaintenanceAction, registerReturnAction } from './actions'
import { getCurrentProfile } from '@/lib/auth/profile'
import { getTermById } from '@/lib/terms-supabase'

type PageProps = {
  params: Promise<{ id: string }>
  searchParams?: Promise<{ error?: string; success?: string }>
}

function formatDate(value: string | null | undefined) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('pt-BR')
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('pt-BR')
}

function conditionLabel(value: string) {
  switch (value) {
    case 'EM_PERFEITO_ESTADO': return 'Em perfeito estado'
    case 'COM_DEFEITO': return 'Com defeito'
    case 'FALTANDO_PECAS': return 'Faltando peças'
    default: return value
  }
}

const fieldClass = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'

export default async function TermoDetalhePage({ params, searchParams }: PageProps) {
  const { id } = await params
  const query = (await searchParams) ?? {}
  const { term, termReturn, events } = await getTermById(id)
  const profile = await getCurrentProfile()
  const isAdmin = profile?.role === 'admin'

  if (!isAdmin) {
    const centros = profile?.centros_custo ?? []
    if (centros.length > 0 && !centros.includes(term.centro_custo)) {
      redirect('/termos')
    }
  }

  const errorMessage = query.error === 'return_required' ? 'Preencha os campos obrigatórios da devolução.' : ''
  const successMessage =
    query.success === 'return_registered' ? 'Devolução registrada com sucesso.' :
    query.success === 'maintenance_on' ? 'Equipamento marcado em manutenção.' :
    query.success === 'maintenance_off' ? 'Equipamento retirado de manutenção.' : ''

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Termo de Responsabilidade</p>
          <h1 className="mt-1 text-3xl font-black text-slate-900">{term.numero_termo}</h1>
          <p className="mt-1 text-sm text-slate-500">Registro completo do termo.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/termos" className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition">
            ← Voltar
          </Link>
          <Link href={`/termos/${term.id}/imprimir`} className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700 transition">
            Imprimir
          </Link>
          {isAdmin && (
            <Link href={`/termos/${term.id}/excluir`} className="rounded-xl bg-red-500 px-4 py-2 text-sm font-bold text-white hover:bg-red-600 transition">
              Excluir
            </Link>
          )}
        </div>
      </div>

      {successMessage && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{successMessage}</div>
      )}
      {errorMessage && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 shadow-sm border-t-4 border-indigo-500">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Situação</p>
          <div className="mt-2">
            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              term.status === 'DEVOLVIDO' ? 'bg-slate-100 text-slate-600' : 'bg-emerald-100 text-emerald-700'
            }`}>
              {term.status === 'DEVOLVIDO' ? 'DEVOLVIDO' : 'EM CAMPO'}
            </span>
          </div>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm border-t-4 border-amber-400">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Manutenção</p>
          <div className="mt-2">
            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              term.em_manutencao ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
            }`}>
              {term.em_manutencao ? 'EM MANUTENÇÃO' : 'NORMAL'}
            </span>
          </div>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm border-t-4 border-emerald-400">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Devolução</p>
          <p className="mt-2 text-sm font-medium text-slate-700">
            {termReturn ? `Registrada em ${formatDate(termReturn.data_devolucao)}` : 'Não registrada'}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">

          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="font-bold text-slate-800">Dados do termo</h2>
            </div>
            <div className="p-6 grid gap-6 md:grid-cols-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Funcionário</p>
                <p className="font-semibold text-slate-800">{term.funcionario_nome}</p>
                <p className="text-xs text-slate-500 mt-0.5">Mat: {term.matricula}</p>
                <p className="text-xs text-slate-500">Função: {term.funcao}</p>
                {term.cpf && <p className="text-xs text-slate-500">CPF: {term.cpf}</p>}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Operação</p>
                <p className="text-sm text-slate-700">{term.contrato}</p>
                <p className="text-xs text-slate-500 mt-0.5">CC: {term.centro_custo}</p>
                <p className="text-xs text-slate-500">Supervisor: {term.supervisor}</p>
                <p className="text-xs text-slate-500">Encarregado: {term.encarregado || '-'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Datas</p>
                <p className="text-xs text-slate-600">Entrega: {formatDate(term.data_entrega)}</p>
                <p className="text-xs text-slate-600">Criação: {formatDate(term.created_at)}</p>
                <p className="text-xs text-slate-600">Atualização: {formatDate(term.updated_at)}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="font-bold text-slate-800">Equipamento</h2>
            </div>
            <div className="p-6 grid gap-4 md:grid-cols-3">
              {[
                { label: 'Tipo', value: term.tipo_equipamento },
                { label: 'Patrimônio', value: term.patrimonio },
                { label: 'Nº de série', value: term.numero_serie || '-' },
                { label: 'Marca', value: term.marca || '-' },
                { label: 'Modelo', value: term.modelo || '-' },
                { label: 'Estado na entrega', value: term.estado_entrega || '-' },
              ].map(item => (
                <div key={item.label}>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{item.label}</p>
                  <p className="mt-0.5 text-sm text-slate-800">{item.value}</p>
                </div>
              ))}
              <div className="md:col-span-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Acessórios</p>
                <p className="mt-0.5 text-sm text-slate-800">{term.acessorios || '-'}</p>
              </div>
              <div className="md:col-span-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Observações</p>
                <p className="mt-0.5 text-sm text-slate-800">{term.observacoes || '-'}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="font-bold text-slate-800">Ações operacionais</h2>
            </div>
            <div className="p-6 grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="text-sm font-bold text-slate-700 mb-3">Manutenção</h3>
                {term.em_manutencao ? (
                  <div className="space-y-3">
                    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                      Em manutenção desde {formatDate(term.data_manutencao)}.
                      {term.observacao_manutencao && <p className="mt-1">{term.observacao_manutencao}</p>}
                    </div>
                    <form action={clearMaintenanceAction}>
                      <input type="hidden" name="term_id" value={term.id} />
                      <button type="submit" className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-bold text-white hover:bg-amber-600 transition">
                        Retirar de manutenção
                      </button>
                    </form>
                  </div>
                ) : (
                  <form action={markMaintenanceAction} className="space-y-3">
                    <input type="hidden" name="term_id" value={term.id} />
                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Observação</label>
                      <textarea name="observacao_manutencao" rows={3} className={fieldClass} placeholder="Motivo ou situação da manutenção" />
                    </div>
                    <button type="submit" className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-bold text-white hover:bg-amber-600 transition">
                      Marcar em manutenção
                    </button>
                  </form>
                )}
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-700 mb-3">Devolução</h3>
                {termReturn ? (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-slate-700 space-y-1.5">
                    <p><span className="font-semibold">Data:</span> {formatDate(termReturn.data_devolucao)}</p>
                    <p><span className="font-semibold">Condição:</span> {conditionLabel(termReturn.condicao)}</p>
                    <p><span className="font-semibold">Recebido por:</span> {termReturn.responsavel_recebimento}</p>
                    <p><span className="font-semibold">Obs:</span> {termReturn.observacoes || '-'}</p>
                  </div>
                ) : (
                  <form action={registerReturnAction} className="space-y-3">
                    <input type="hidden" name="term_id" value={term.id} />
                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Data da devolução *</label>
                      <input type="date" name="data_devolucao" defaultValue={new Date().toISOString().slice(0, 10)} className={fieldClass} required />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Condição *</label>
                      <select name="condicao" defaultValue="EM_PERFEITO_ESTADO" className={fieldClass} required>
                        <option value="EM_PERFEITO_ESTADO">Em perfeito estado</option>
                        <option value="COM_DEFEITO">Com defeito</option>
                        <option value="FALTANDO_PECAS">Faltando peças</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Responsável pelo recebimento *</label>
                      <input name="responsavel_recebimento" className={fieldClass} placeholder="Nome de quem recebeu" required />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Observações</label>
                      <textarea name="observacoes" rows={3} className={fieldClass} placeholder="Observações sobre a devolução" />
                    </div>
                    <button type="submit" className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 transition">
                      Registrar devolução
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="font-bold text-slate-800">Timeline</h2>
            </div>
            <div className="p-5">
              {events.length === 0 ? (
                <p className="text-sm text-slate-400">Nenhum evento registrado.</p>
              ) : (
                <div className="space-y-4">
                  {events.map(item => (
                    <div key={item.id} className="flex gap-3">
                      <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-indigo-500" />
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                        {item.description && <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>}
                        <p className="mt-1 text-xs text-slate-400">{formatDateTime(item.created_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="font-bold text-slate-800">Resumo</h2>
            </div>
            <div className="p-5 space-y-2.5 text-sm">
              {[
                { label: 'Funcionário', value: term.funcionario_nome },
                { label: 'Equipamento', value: term.tipo_equipamento },
                { label: 'Patrimônio', value: term.patrimonio },
                { label: 'Supervisor', value: term.supervisor },
                { label: 'Contrato', value: term.contrato },
              ].map(item => (
                <div key={item.label}>
                  <p className="text-xs text-slate-400">{item.label}</p>
                  <p className="font-medium text-slate-800">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
