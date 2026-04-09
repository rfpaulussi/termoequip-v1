export default function LoginPage() {
  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-lg p-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Login</h1>
        <p className="text-slate-600 mb-6">
          Acesso ao sistema TermoEquip.
        </p>

        <form className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              E-mail
            </label>
            <input
              id="email"
              type="email"
              placeholder="seuemail@empresa.com.br"
              className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 outline-none focus:border-slate-500"
            />
          </div>

          <div>
            <label
              htmlFor="senha"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Senha
            </label>
            <input
              id="senha"
              type="password"
              placeholder="Digite sua senha"
              className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 outline-none focus:border-slate-500"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-800"
          >
            Entrar
          </button>
        </form>
      </div>
    </main>
  );
}