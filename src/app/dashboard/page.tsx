export default function Home() {
  return (
    <main className="bg-green-50">
      <section className="mx-auto max-w-6xl px-6 py-10 md:py-14">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-green-100 bg-white p-8 shadow-sm md:p-10">
            <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800">
              Versão 1
            </span>

            <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
              Controle simples, visual e organizado para termos de responsabilidade.
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              O TermoEquip foi pensado para facilitar o cadastro, controle,
              impressão e histórico de termos de uso de equipamentos como
              roçadeira, motosserra, soprador e outros itens operacionais.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="/termos/novo"
                className="rounded-xl bg-green-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-green-800"
              >
                Cadastrar novo termo
              </a>

              <a
                href="/termos"
                className="rounded-xl border border-green-200 bg-green-50 px-5 py-3 text-sm font-semibold text-green-800 transition hover:bg-green-100"
              >
                Ver histórico
              </a>
            </div>
          </div>

          <div className="grid gap-5">
            <div className="rounded-3xl border border-green-100 bg-white p-6 shadow-sm">
              <div className="mb-3 h-2 w-16 rounded-full bg-green-600" />
              <h2 className="text-xl font-semibold text-slate-900">
                Objetivo inicial
              </h2>
              <p className="mt-3 leading-7 text-slate-600">
                Centralizar a emissão dos termos, organizar o histórico e
                facilitar a impressão posterior pelos supervisores e encarregados.
              </p>
            </div>

            <div className="rounded-3xl border border-green-100 bg-white p-6 shadow-sm">
              <div className="mb-3 h-2 w-16 rounded-full bg-emerald-500" />
              <h2 className="text-xl font-semibold text-slate-900">
                Escopo da versão 1
              </h2>
              <p className="mt-3 leading-7 text-slate-600">
                Login, dashboard, cadastro de termo, histórico de termos e
                estrutura para devolução de equipamentos.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-green-100 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-green-700">
              Cadastro
            </p>
            <p className="mt-3 text-slate-600 leading-7">
              Preenchimento padronizado dos dados do colaborador, equipamento e
              responsáveis.
            </p>
          </div>

          <div className="rounded-2xl border border-green-100 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-green-700">
              Controle
            </p>
            <p className="mt-3 text-slate-600 leading-7">
              Organização dos termos em um histórico visual, com status e consulta rápida.
            </p>
          </div>

          <div className="rounded-2xl border border-green-100 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-green-700">
              Impressão
            </p>
            <p className="mt-3 text-slate-600 leading-7">
              Base pronta para gerar documentos e permitir impressão posterior com mais consistência.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}