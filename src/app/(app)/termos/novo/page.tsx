import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import TermoForm from './termo-form'
import { createTermAction } from './actions'

export default async function NovoTermoPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>
}) {
  const params = (await searchParams) ?? {}
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const today = new Date().toISOString().slice(0, 10)

  const errorMessage =
    params.error === 'required' ? 'Preencha os campos obrigatórios do cadastro.' :
    params.error === 'cpf_invalid' ? 'Informe um CPF válido no formato 000.000.000-00.' :
    params.error === 'patrimonio_in_use' ? 'Já existe um termo finalizado com este patrimônio.' :
    params.error === 'check_patrimonio' ? 'Não foi possível validar o patrimônio agora.' :
    params.error === 'create_failed' ? 'Não foi possível salvar o rascunho. Revise os dados e tente novamente.' : ''

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Gestão</p>
          <h1 className="mt-1 text-3xl font-black text-slate-900">Novo Termo</h1>
          <p className="mt-1 text-sm text-slate-500">
            Preencha os dados e salve como rascunho para finalizar depois.
          </p>
          {user?.email && (
            <p className="mt-1 text-xs text-slate-400">Usuário: {user.email}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Link href="/termos" className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition">
            ← Voltar
          </Link>
          {errorMessage && (
            <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
              Revise os campos
            </span>
          )}
        </div>
      </div>

      <TermoForm
        today={today}
        serverError={errorMessage}
        submitLabel="Salvar rascunho"
        cancelHref="/termos"
        formAction={createTermAction}
      />
    </div>
  )
}
