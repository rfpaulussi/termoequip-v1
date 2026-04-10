import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-green-50 px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-3xl border border-green-100 bg-white p-10 shadow-sm">
          <div className="inline-flex rounded-full bg-green-100 px-4 py-1 text-sm font-semibold text-green-700">
            Controle de Termos de Equipamentos
          </div>

          <h1 className="mt-6 max-w-3xl text-4xl font-bold text-green-700">
            Gere, acompanhe e consulte termos de responsabilidade de forma simples.
          </h1>

          <p className="mt-4 max-w-3xl text-lg text-black">
            O TermoEquip foi criado para organizar a entrega de equipamentos,
            registrar responsabilidade, manter histórico de movimentações
            e facilitar a consulta dos termos emitidos.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/login"
              className="rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white hover:bg-green-700"
            >
              Entrar no sistema
            </Link>

            <Link
              href="/dashboard"
              className="rounded-xl border border-green-200 bg-white px-5 py-3 text-sm font-semibold text-green-700 hover:bg-green-100"
            >
              Ir para o dashboard
            </Link>

            <Link
              href="/termos/novo"
              className="rounded-xl border border-green-200 bg-white px-5 py-3 text-sm font-semibold text-green-700 hover:bg-green-100"
            >
              Cadastrar novo termo
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-green-200 bg-white p-6 shadow-sm">
            <div className="mb-3 text-3xl">📝</div>
            <h2 className="text-xl font-semibold text-green-700">Cadastro</h2>
            <p className="mt-2 text-black">
              Registre novos termos de responsabilidade com mais organização e rapidez.
            </p>
          </div>

          <div className="rounded-2xl border border-green-200 bg-white p-6 shadow-sm">
            <div className="mb-3 text-3xl">📚</div>
            <h2 className="text-xl font-semibold text-green-700">Histórico</h2>
            <p className="mt-2 text-black">
              Consulte os termos já lançados e acompanhe a movimentação dos equipamentos.
            </p>
          </div>

          <div className="rounded-2xl border border-green-200 bg-white p-6 shadow-sm">
            <div className="mb-3 text-3xl">🖨️</div>
            <h2 className="text-xl font-semibold text-green-700">Operação</h2>
            <p className="mt-2 text-black">
              Mantenha a rotina de emissão, controle e conferência em um fluxo mais claro.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
