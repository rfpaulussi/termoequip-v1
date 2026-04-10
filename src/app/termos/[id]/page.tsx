type PageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function TermoDetalhePage({ params }: PageProps) {
  const { id } = await params

  return (
    <main className="min-h-screen bg-green-50 p-6">
      <div className="mx-auto max-w-4xl rounded-2xl bg-white border border-green-100 shadow-sm p-6">
        <h1 className="text-2xl font-bold text-green-700 mb-2">
          Detalhe do Termo
        </h1>

        <p className="text-gray-700 mb-4">
          ID do termo: <strong>{id}</strong>
        </p>

        <div className="rounded-xl bg-yellow-50 border border-yellow-200 p-4 text-sm text-yellow-800">
          Esta página foi recriada temporariamente para corrigir o build.
          Depois que o deploy estabilizar, retomamos a versão completa do detalhe do termo.
        </div>
      </div>
    </main>
  )
}
