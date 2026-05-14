import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentProfile } from '@/lib/auth/profile'
import { getTermById } from '@/lib/terms-supabase'
import { deleteTermAction } from '../actions'

type PageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function ExcluirTermoPage({ params }: PageProps) {
  const { id } = await params
  const profile = await getCurrentProfile()

  if (!profile || profile.role !== 'superadmin') {
    redirect('/dashboard')
  }

  const { term } = await getTermById(id)

  return (
    <main className="min-h-screen p-0">
      <div className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-white p-8 shadow-sm">
        <div className="inline-flex rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">
          Confirmação de exclusão
        </div>

        <h1 className="mt-4 text-3xl font-bold text-red-700">
          Excluir termo
        </h1>

        <p className="mt-4 text-black">
          Você está prestes a excluir permanentemente este termo.
        </p>

        <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-5">
          <p className="text-sm text-black">
            <strong>Número do termo:</strong> {term.numero_termo}
          </p>
          <p className="mt-2 text-sm text-black">
            <strong>Funcionário:</strong> {term.funcionario_nome}
          </p>
          <p className="mt-2 text-sm text-black">
            <strong>Equipamento:</strong> {term.tipo_equipamento}
          </p>
          <p className="mt-2 text-sm text-black">
            <strong>Patrimônio:</strong> {term.patrimonio}
          </p>
        </div>

        <p className="mt-6 text-sm text-red-700">
          Esta ação não poderá ser desfeita.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={`/termos/${term.id}`}
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Cancelar
          </Link>

          <form action={deleteTermAction}>
            <input type="hidden" name="term_id" value={term.id} />
            <button
              type="submit"
              className="rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700"
            >
              Confirmar exclusão
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
