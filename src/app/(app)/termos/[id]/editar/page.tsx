import Link from 'next/link'
import { getTermById } from '@/lib/terms-supabase'
import TermoForm from '@/app/(app)/termos/novo/termo-form'
import { updateDraftTermAction } from './actions'

type PageProps = {
  params: Promise<{ id: string }>
  searchParams?: Promise<{ error?: string }>
}

export default async function EditarRascunhoPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params
  const query = (await searchParams) ?? {}

  const { term } = await getTermById(id)

  if (!term.is_draft) {
    return (
      <main className="bg-green-50 px-6 py-10">
        <div className="mx-auto max-w-4xl rounded-3xl border border-amber-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-amber-700">Termo já finalizado</h1>
          <p className="mt-3 text-slate-700">
            Este termo não está mais em modo rascunho. Para preservar a consistência documental, ele não pode ser editado livremente.
          </p>
          <div className="mt-6">
            <Link
              href="/termos"
              className="rounded-xl border border-green-200 bg-white px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-50"
            >
              Voltar para termos
            </Link>
          </div>
        </div>
      </main>
    )
  }

  const errorMessage =
    query.error === 'required'
      ? 'Preencha os campos obrigatórios do rascunho.'
      : query.error === 'cpf_invalid'
      ? 'Informe um CPF válido no formato 000.000.000-00.'
      : query.error === 'update_failed'
      ? 'Não foi possível atualizar o rascunho. Revise os dados e tente novamente.'
      : ''

  return (
    <main className="bg-green-50 px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-800">
              Rascunho em edição
            </span>
            <h1 className="mt-4 text-3xl font-bold text-slate-900">
              Editar rascunho do termo
            </h1>
            <p className="mt-2 text-slate-600">
              Revise os dados, salve as alterações e finalize depois quando estiver tudo conferido.
            </p>
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

        <TermoForm
          today={new Date().toISOString().slice(0, 10)}
          serverError={errorMessage}
          submitLabel="Salvar alterações do rascunho"
          cancelHref="/termos"
          formAction={updateDraftTermAction}
          initialValues={{
            id: term.id,
            centro_custo: term.centro_custo ?? '',
            contrato: term.contrato ?? '',
            supervisor: term.supervisor ?? '',
            encarregado: term.encarregado ?? '',
            data_entrega: term.data_entrega?.slice(0, 10) ?? '',
            funcionario_nome: term.funcionario_nome ?? '',
            matricula: term.matricula ?? '',
            cpf: term.cpf ?? '',
            funcao: term.funcao ?? '',
            tipo_equipamento: term.tipo_equipamento ?? '',
            marca: term.marca ?? '',
            modelo: term.modelo ?? '',
            numero_serie: term.numero_serie ?? '',
            patrimonio: term.patrimonio ?? '',
            estado_entrega: term.estado_entrega ?? '',
            acessorios: term.acessorios ?? '',
            observacoes: term.observacoes ?? '',
          }}
        />
      </div>
    </main>
  )
}
