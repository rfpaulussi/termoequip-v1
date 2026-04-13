import Link from 'next/link'
import {
  clearMaintenanceAction,
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
    success?: string
  }>
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

  const isAdmin = profile?.role === 'admin'

  const errorMessage =
    query.error === 'return_required'
      ? 'Preencha os campos obrigatórios da devolução.'
      : ''

  const successMessage =
    query.success === 'return_registered'
      ? 'Devolução registrada com sucesso.'
      : query.success === 'maintenance_on'
      ? 'Equipamento marcado em manutenção.'
      : query.success === 'maintenance_off'
      ? 'Equipamento retirado de manutenção.'
      : ''

  const timeline = [
    {
      title: 'Termo criado',
      description: `Termo ${term.numero_termo} registrado no sistema.`,
      date: term.created_at,
    },
    {
      title: 'Entrega registrada',
      description: `Equipamento entregue para ${term.funcionario_nome}.`,
      date: term.data_entrega,
    },
    ...(term.em_manutencao && term.data_manutencao
      ? [
          {
            title: 'Equipamento em manutenção',
            description:
              term.observacao_manutencao ||
              'Equipamento sinalizado em manutenção.',
            date: term.data_manutencao,
          },
        ]
      : []),
    ...(termReturn
      ? [
          {
            title: 'Devolução registrada',
            description: `Recebido por ${termReturn.responsavel_recebimento}.`,
            date: termReturn.data_devolucao,
          },
        ]
      : []),
  ]

  return (
    <main className="min-h-screen bg-green-50 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
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

            <Link
              href={`/termos/${term.id}/imprimir`}
              className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
            >
              Imprimir termo
            </Link>

            {isAdmin ? (
              <Link
                href={`/termos/${term.id}/excluir`}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                Excluir termo
              </Link>
            ) : null}
          </div>
        </div>

        {successMessage ? (
          <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            {successMessage}
          </div>
        ) : null}

        {errorMessage ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <section className="rounded-2xl border border-green-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-green-700">Resumo operacional</h2>

              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-green-100 bg-green-50 p-4">
                  <p className="text-sm font-semibold text-green-700">Situação do termo</p>
                  <div className="mt-2">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        term.status === 'DEVOLVIDO'
                          ? 'bg-gray-200 text-gray-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {term.status}
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl border border-green-100 bg-green-50 p-4">
                  <p className="text-sm font-semibold text-green-700">Manutenção</p>
                  <div className="mt-2">
                    {term.em_manutencao ? (
                      <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                        EM MANUTENÇÃO
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                        SEM MANUTENÇÃO
                      </span>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-green-100 bg-green-50 p-4">
                  <p className="text-sm font-semibold text-green-700">Devolução</p>
                  <p className="mt-2 text-sm text-black">
                    {termReturn
                      ? `Registrada em ${formatDate(termReturn.data_devolucao)}`
                      : 'Ainda não registrada'}
                  </p>
                </div>
              </div>
            </section>

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
                  <h2 className="text-sm font-semibold text-green-700">Datas</h2>
                  <p className="mt-1 text-sm text-gray-600">
                    Entrega: {formatDate(term.data_entrega)}
                  </p>
                  <p className="text-sm text-gray-600">
                    Criação: {formatDate(term.created_at)}
                  </p>
                  <p className="text-sm text-gray-600">
                    Atualização: {formatDate(term.updated_at)}
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
              <h2 className="text-lg font-semibold text-green-700">Ações operacionais</h2>

              <div className="mt-4 grid gap-6 md:grid-cols-2">
                <div className="rounded-2xl border border-green-100 p-4">
                  <h3 className="text-sm font-semibold text-green-700">Manutenção</h3>

                  {term.em_manutencao ? (
                    <div className="mt-3 space-y-4">
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
                    <form action={markMaintenanceAction} className="mt-3 space-y-4">
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
                </div>

                <div className="rounded-2xl border border-green-100 p-4">
                  <h3 className="text-sm font-semibold text-green-700">Devolução</h3>

                  {termReturn ? (
                    <div className="mt-3 rounded-xl border border-green-200 bg-green-50 px-4 py-4 text-sm text-green-800">
                      <p>
                        <strong>Data:</strong> {formatDate(termReturn.data_devolucao)}
                      </p>
                      <p className="mt-2">
                        <strong>Condição:</strong> {conditionLabel(termReturn.condicao)}
                      </p>
                      <p className="mt-2">
                        <strong>Recebido por:</strong> {termReturn.responsavel_recebimento}
                      </p>
                      <p className="mt-2">
                        <strong>Observações:</strong> {termReturn.observacoes || '-'}
                      </p>
                    </div>
                  ) : (
                    <form action={registerReturnAction} className="mt-3 grid gap-4">
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

                      <div>
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

                      <div>
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

                      <button
                        type="submit"
                        className="rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white hover:bg-green-700"
                      >
                        Registrar devolução
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-2xl border border-green-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-green-700">Timeline do termo</h2>

              <div className="mt-4 space-y-4">
                {timeline.map((item, index) => (
                  <div key={`${item.title}-${index}`} className="flex gap-3">
                    <div className="mt-1 h-3 w-3 rounded-full bg-green-600" />
                    <div>
                      <p className="text-sm font-semibold text-black">{item.title}</p>
                      <p className="text-sm text-gray-600">{item.description}</p>
                      <p className="mt-1 text-xs text-gray-500">
                        {formatDateTime(item.date)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-green-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-green-700">Leitura rápida</h2>

              <div className="mt-4 space-y-3 text-sm text-black">
                <p>
                  <strong>Funcionário:</strong> {term.funcionario_nome}
                </p>
                <p>
                  <strong>Equipamento:</strong> {term.tipo_equipamento}
                </p>
                <p>
                  <strong>Patrimônio:</strong> {term.patrimonio}
                </p>
                <p>
                  <strong>Supervisor:</strong> {term.supervisor}
                </p>
                <p>
                  <strong>Contrato:</strong> {term.contrato}
                </p>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  )
}
