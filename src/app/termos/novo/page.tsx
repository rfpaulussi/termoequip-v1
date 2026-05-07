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
      ? 'Preencha os campos obrigatórios do cadastro.'
      : params.error === 'cpf_invalid'
      ? 'Informe um CPF válido no formato 000.000.000-00.'
      : params.error === 'patrimonio_in_use'
      ? 'Já existe um termo ativo com este patrimônio.'
      : params.error === 'check_patrimonio'
      ? 'Não foi possível validar o patrimônio agora.'
      : params.error === 'create_failed'
      ? 'Não foi possível criar o termo. Revise os dados e tente novamente.'
      : ''

  return (
    <main className="bg-green-50 px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
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

          <div className="flex flex-col items-end gap-3">
            <Link
              href="/termos"
              className="rounded-xl border border-green-200 bg-white px-4 py-2 text-sm font-semibold text-green-800 hover:bg-green-50"
            >
              Voltar para termos
            </Link>

            {errorMessage ? (
              <div className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                Revise os campos
              </div>
            ) : null}
          </div>
        </div>

        <TermoForm today={today} serverError={errorMessage} />
      </div>
    </main>
  )
}
