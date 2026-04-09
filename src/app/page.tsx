export default function Home() {
  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-lg p-8">
        <div className="mb-6">
          <span className="inline-block rounded-full bg-slate-900 px-3 py-1 text-sm font-medium text-white">
            Versão 1
          </span>
        </div>

        <h1 className="text-3xl font-bold text-slate-900 mb-4">
          TermoEquip
        </h1>

        <p className="text-slate-600 text-lg mb-6">
          Aplicativo web para geração, controle, impressão e histórico de
          Termos de Responsabilidade de Equipamentos.
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 p-4">
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              Objetivo inicial
            </h2>
            <p className="text-slate-600">
              Cadastrar termos de entrega de equipamentos, salvar histórico e
              permitir impressão posterior.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              Próximas telas
            </h2>
            <p className="text-slate-600">
              Login, dashboard, novo termo, histórico e devolução.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}