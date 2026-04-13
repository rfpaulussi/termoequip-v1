import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import TermoForm from './termo-form'

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
      : params.error === 'patrimonio_in_use'
      ? 'Já existe um termo ativo com este número de patrimônio. Para reutilizar esse equipamento, o termo anterior precisa estar devolvido à sede da empresa.'
      : params.error === 'check_patrimonio'
      ? 'Não foi possível validar o patrimônio no momento. Tente novamente.'
      : params.error === 'create_failed'
      ? 'Não foi possível criar o termo. Revise os dados e tente novamente.'
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

        <TermoForm today={today} />
      </div>
    </main>
  )
}
