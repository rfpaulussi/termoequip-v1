import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createTermAction } from './actions'

const fieldClassName =
  'w-full rounded-xl border border-green-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100'

export default async function NovoTermoPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>
}) {
  const params = (await searchParams) ?? {}
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const today = new Date().toISOString().slice(0, 10)
  const errorMessage =
    params.error === 'required'
      ? 'Preencha os campos principais: contrato, centro de custo, supervisor, nome do funcionário, matrícula, função, tipo do equipamento e patrimônio.'
      : ''

  return (
    <main className="bg-green-50 px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800">
              Novo Termo
            </span>
            <h1 className="mt-4 text-3xl font-bold text-slate-900">
              Cadastro de Termo de Responsabilidade
            </h1>
            <p className="mt-2 text-slate-600">
              Preencha os dados para gerar o termo e salvar no Supabase.
            </p>
            {user?.email ? (
              <p className="mt-2 text-sm text-slate-500">
                Usuário logado: {user.email}
              </p>
            ) : null}
          </div>

          <Link
            href="/termos"
            className="rounded-xl border border-green-200 bg-white px-4 py-2 text-sm font-semibold text-green-800 hover:bg-green-50"
          >
            Voltar para termos
          </Link>
        </div>

        {errorMessage ? (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        ) : null}

        <form action={createTermAction} className="space-y-8">
          <section className="rounded-3xl border border-green-100 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">
              Dados operacionais
            </h2>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Contrato *
                </label>
                <input
                  name="contrato"
                  className={fieldClassName}
                  placeholder="Digite o contrato"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Centro de custo *
                </label>
                <input
                  name="centro_custo"
                  className={fieldClassName}
                  placeholder="Digite o centro de custo"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Supervisor responsável *
                </label>
                <input
                  name="supervisor"
                  className={fieldClassName}
                  placeholder="Nome do supervisor"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Encarregado responsável
                </label>
                <input
                  name="encarregado"
                  className={fieldClassName}
                  placeholder="Nome do encarregado"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Data da entrega
                </label>
                <input
                  type="date"
                  name="data_entrega"
                  defaultValue={today}
                  className={fieldClassName}
                />
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-green-100 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">
              Dados do colaborador
            </h2>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div className="md:col-span-1">
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Nome do funcionário *
                </label>
                <input
                  name="funcionario_nome"
                  className={fieldClassName}
                  placeholder="Nome completo"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Matrícula / Registro *
                </label>
                <input
                  name="matricula"
                  className={fieldClassName}
                  placeholder="Número de registro"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Função *
                </label>
                <input
                  name="funcao"
                  className={fieldClassName}
                  placeholder="Função do colaborador"
                  required
                />
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-green-100 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">
              Dados do equipamento
            </h2>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Tipo do equipamento *
                </label>
                <input
                  name="tipo_equipamento"
                  className={fieldClassName}
                  placeholder="Roçadeira, motosserra..."
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Marca
                </label>
                <input
                  name="marca"
                  className={fieldClassName}
                  placeholder="Marca"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Modelo
                </label>
                <input
                  name="modelo"
                  className={fieldClassName}
                  placeholder="Modelo"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Número de série
                </label>
                <input
                  name="numero_serie"
                  className={fieldClassName}
                  placeholder="Número de série"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Patrimônio *
                </label>
                <input
                  name="patrimonio"
                  className={fieldClassName}
                  placeholder="Número do patrimônio"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Estado na entrega
                </label>
                <input
                  name="estado_entrega"
                  defaultValue="Bom estado"
                  className={fieldClassName}
                  placeholder="Bom estado"
                />
              </div>

              <div className="md:col-span-3">
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Acessórios
                </label>
                <input
                  name="acessorios"
                  className={fieldClassName}
                  placeholder="Carregador, bateria, maleta..."
                />
              </div>

              <div className="md:col-span-3">
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Observações
                </label>
                <textarea
                  name="observacoes"
                  rows={4}
                  className={fieldClassName}
                  placeholder="Observações adicionais"
                />
              </div>
            </div>
          </section>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              className="rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white hover:bg-green-700"
            >
              Salvar termo
            </button>

            <Link
              href="/termos"
              className="rounded-xl border border-green-200 bg-white px-5 py-3 text-sm font-semibold text-green-800 hover:bg-green-50"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </main>
  )
}
