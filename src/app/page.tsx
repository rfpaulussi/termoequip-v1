import Link from 'next/link'
import { redirect } from 'next/navigation'

type PageProps = {
  searchParams?: Promise<{ code?: string }>
}

export default async function HomePage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {}

  if (params.code) {
    redirect(`/auth/callback?code=${params.code}`)
  }

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center px-6 py-12">
      <div className="mx-auto max-w-4xl w-full">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-indigo-700 mb-6">
            Gestão de Patrimônio
          </div>
          <h1 className="text-5xl font-black text-slate-900 leading-tight">
            Termo<span className="text-indigo-600">Equip</span>
          </h1>
          <p className="mt-4 text-lg text-slate-500 max-w-xl mx-auto">
            Gere, acompanhe e consulte termos de responsabilidade de equipamentos com controle total.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <Link href="/login" className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white hover:bg-indigo-700 transition shadow-sm">
              Entrar no sistema
            </Link>
            <Link href="/dashboard" className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition">
              Ir para o dashboard
            </Link>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-sm border-t-4 border-indigo-500">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 mb-4">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h2 className="font-bold text-slate-800">Cadastro</h2>
            <p className="mt-1 text-sm text-slate-500">Registre novos termos de responsabilidade com organização e rapidez.</p>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm border-t-4 border-amber-400">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 mb-4">
              <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="font-bold text-slate-800">Histórico</h2>
            <p className="mt-1 text-sm text-slate-500">Consulte os termos já lançados e acompanhe a movimentação dos equipamentos.</p>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm border-t-4 border-emerald-400">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 mb-4">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
            </div>
            <h2 className="font-bold text-slate-800">Operação</h2>
            <p className="mt-1 text-sm text-slate-500">Mantenha a rotina de emissão, controle e conferência em um fluxo claro.</p>
          </div>
        </div>
      </div>
    </main>
  )
}
