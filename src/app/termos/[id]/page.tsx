import Link from 'next/link'
import {
  clearMaintenanceAction,
  deleteTermAction,
  markMaintenanceAction,
  registerReturnAction,
} from './actions'
import { getCurrentProfile } from '@/lib/auth/profile'
import { getTermById } from '@/lib/terms-supabase'

type PageProps = {
  params: Promise<{
    id: string
  }>
  searchParams?: Promise<{
    error?: string
  }>
}

function formatDate(value: string | null | undefined) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('pt-BR')
}

function conditionLabel(value: string) {
  switch (value) {
    case 'EM_PERFEITO_ESTADO':
      return 'Em perfeito estado'
    case 'COM_DEFEITO':
      return 'Com defeito'
    case 'FALTANDO_PECAS':
      return 'Faltando peças'
    default:
      return value
  }
}

export default async function TermoDetalhePage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params
  const query = (await searchParams) ?? {}
  const { term, termReturn } = await getTermById(id)
  const profile = await getCurrentProfile()

  const returnError =
    query.error === 'return_required'
      ? 'Preencha os campos obrigatórios da devolução.'
      : ''

  const isAdmin = profile?.role === 'admin'

  return (
    <main className="min-h-screen bg-green-50 p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800">
              Detalhe do Termo
            </span>
            <h1 className="mt-3 text-3xl font-bold text-green-700">
              {term.numero_termo}
            </h1>
            <p className="mt-2 text-black">
              Registro completo do termo de responsabilidade.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/termos"
              className="rounded-xl border border-green-200 bg-white px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-100"
            >
              Voltar
            </Link>

            {isAdmin ? (
              <form action={deleteTermAction}>
                <input type="hidden" name="term_id" value={term.id} />
                <button
                  type="submit"
                  className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                >
                  Excluir termo
                </button>
              </form>
            ) : null}
          </div>
        </div>

        <section className="rounded-2xl border border-green-200 bg-white p-6 shadow-sm">
          <div className="grid gap-5 md:grid-cols-3">
            <div>
              <h2 className="text-sm font-semibold text-green-700">Funcionário</h2>
              <p className="mt-1 text-black">{term.funcionario_nome}</p>
              <p className="text-sm text-gray-600">Matrícula: {term.matricula}</p>
              <p className="text-sm text-gray-600">Função: {term.funcao}</p>
            </div>

            <div>
              <h2 className="text-sm font-semibold text-green-700">Operação</h2>
              <p className="mt-1 text-black">Contrato: {term.contrato}</p>
              <p className="text-sm text-gray-600">Centro de custo: {term.centro_custo}</p>
              <p className="text-sm text-gray-600">Supervisor: {term.supervisor}</p>
              <p className="text-sm text-gray-600">
                Encarregado: {term.encarregado || '-'}
              </p>
            </div>

            <div>
              <h2 className="text-sm font-semibold text-green-700">Status</h2>
              <div className="mt-1 flex flex-wrap gap-2">
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                    term.status === 'DEVOLVIDO'
                      ? 'bg-gray-200 text-gray-700'
                      : 'bg-green-100 text-green-700'
                  }`}
                >
                  {term.status}
                </span>

                {term.em_manutencao ? (
                  <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                    EM MANUTENÇÃO
                  </span>
                ) : null}
              </div>

              <p className="mt-2 text-sm text-gray-600">
                Entrega: {formatDate(term.data_entrega)}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-green-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-green-700">Equipamento</h2>

          <div className="mt-4 grid gap-5 md:grid-cols-3">
            <div>
              <p className="text-sm font-semibold text-green-700">Tipo</p>
              <p className="text-black">{term.tipo_equipamento}</p>
            </div>

            <div>
              <p className="text-sm font-semibold text-green-700">Patrimônio</p>
              <p className="text-black">{term.patrimonio}</p>
            </div>

            <div>
              <p className="text-sm font-semibold text-green-700">Número de série</p>
              <p className="text-black">{term.numero_serie || '-'}</p>
            </div>

            <div>
              <p className="text-sm font-semibold text-green-700">Marca</p>
              <p className="text-black">{term.marca || '-'}</p>
            </div>

            <div>
              <p className="text-sm font-semibold text-green-700">Modelo</p>
              <p className="text-black">{term.modelo || '-'}</p>
            </div>

            <div>
              <p className="text-sm font-semibold text-green-700">Estado na entrega</p>
              <p className="text-black">{term.estado_entrega || '-'}</p>
            </div>

            <div className="md:col-span-3">
              <p className="text-sm font-semibold text-green-700">Acessórios</p>
              <p className="text-black">{term.acessorios || '-'}</p>
            </div>

            <div className="md:col-span-3">
              <p className="text-sm font-semibold text-green-700">Observações</p>
              <p className="text-black">{term.observacoes || '-'}</p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-green-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-green-700">Manutenção</h2>

          {term.em_manutencao ? (
            <div className="mt-4 space-y-4">
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Equipamento em manutenção desde {formatDate(term.data_manutencao)}.
                {term.observacao_manutencao ? (
                  <div className="mt-2">
                    Observação: {term.observacao_manutencao}
                  </div>
                ) : null}
              </div>

              <form action={clearMaintenanceAction}>
                <input type="hidden" name="term_id" value={term.id} />
                <button
                  type="submit"
                  className="rounded-xl bg-amber-600 px-5 py-3 text-sm font-semibold text-white hover:bg-amber-700"
                >
                  Retirar de manutenção
                </button>
              </form>
            </div>
          ) : (
            <form action={markMaintenanceAction} className="mt-4 space-y-4">
              <input type="hidden" name="term_id" value={term.id} />

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Observação da manutenção
                </label>
                <textarea
                  name="observacao_manutencao"
                  rows={3}
                  className="w-full rounded-xl border border-green-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                  placeholder="Descreva o motivo ou situação da manutenção"
                />
              </div>

              <button
                type="submit"
                className="rounded-xl bg-amber-600 px-5 py-3 text-sm font-semibold text-white hover:bg-amber-700"
              >
                Marcar em manutenção
              </button>
            </form>
          )}
        </section>

        {termReturn ? (
          <section className="rounded-2xl border border-green-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-green-700">Devolução registrada</h2>

            <div className="mt-4 grid gap-5 md:grid-cols-2">
              <div>
                <p className="text-sm font-semibold text-green-700">Data da devolução</p>
                <p className="text-black">{formatDate(termReturn.data_devolucao)}</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-green-700">Condição</p>
                <p className="text-black">{conditionLabel(termReturn.condicao)}</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-green-700">Responsável pelo recebimento</p>
                <p className="text-black">{termReturn.responsavel_recebimento}</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-green-700">Observações</p>
                <p className="text-black">{termReturn.observacoes || '-'}</p>
              </div>
            </div>
          </section>
        ) : (
          <section className="rounded-2xl border border-green-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-green-700">Registrar devolução</h2>

            {returnError ? (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {returnError}
              </div>
            ) : null}

            <form action={registerReturnAction} className="mt-4 grid gap-4 md:grid-cols-2">
              <input type="hidden" name="term_id" value={term.id} />

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Data da devolução *
                </label>
                <input
                  type="date"
                  name="data_devolucao"
                  defaultValue={new Date().toISOString().slice(0, 10)}
                  className="w-full rounded-xl border border-green-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Condição *
                </label>
                <select
                  name="condicao"
                  className="w-full rounded-xl border border-green-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                  defaultValue="EM_PERFEITO_ESTADO"
                  required
                >
                  <option value="EM_PERFEITO_ESTADO">Em perfeito estado</option>
                  <option value="COM_DEFEITO">Com defeito</option>
                  <option value="FALTANDO_PECAS">Faltando peças</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Responsável pelo recebimento *
                </label>
                <input
                  name="responsavel_recebimento"
                  className="w-full rounded-xl border border-green-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                  placeholder="Nome de quem recebeu o equipamento"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Observações
                </label>
                <textarea
                  name="observacoes"
                  rows={4}
                  className="w-full rounded-xl border border-green-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                  placeholder="Observações sobre a devolução"
                />
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white hover:bg-green-700"
                >
                  Registrar devolução
                </button>
              </div>
            </form>
          </section>
        )}
      </div>
    </main>
  )
}
