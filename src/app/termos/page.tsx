'use client'

import Link from 'next/link'
import LogoutButton from '@/components/logout-button'

export default function TermosPage() {
  return (
    <main className="min-h-screen bg-green-50 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-green-700">Termos</h1>
            <p className="mt-2 text-black">
              Área de histórico e consulta de termos.
            </p>
          </div>

          <LogoutButton />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Link
            href="/termos/novo"
            className="rounded-2xl border border-green-200 bg-white p-6 shadow-sm transition hover:border-green-400"
          >
            <h2 className="text-xl font-semibold text-green-700">Novo termo</h2>
            <p className="mt-2 text-sm text-black">
              Cadastrar um novo termo de responsabilidade.
            </p>
          </Link>

          <Link
            href="/dashboard"
            className="rounded-2xl border border-green-200 bg-white p-6 shadow-sm transition hover:border-green-400"
          >
            <h2 className="text-xl font-semibold text-green-700">Dashboard</h2>
            <p className="mt-2 text-sm text-black">
              Voltar para a área principal do sistema.
            </p>
          </Link>
        </div>

        <div className="mt-6 rounded-2xl border border-yellow-200 bg-yellow-50 p-5 text-sm text-yellow-800">
          A listagem completa dos termos será conectada ao Supabase na próxima etapa.
        </div>
      </div>
    </main>
  )
}
