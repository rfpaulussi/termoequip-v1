'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Suspense } from 'react'

function CallbackHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    async function handleCode() {
      const code = searchParams.get('code')
      const next = searchParams.get('next') ?? '/reset-password'

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
          router.replace(next)
          return
        }
        setErrorMsg(error.message)
        return
      }

      router.replace('/login?error=confirm')
    }

    handleCode()
  }, [])

  if (errorMsg) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
        <div className="rounded-2xl border border-red-200 bg-white p-8 shadow-xl max-w-md w-full">
          <p className="text-sm font-semibold text-red-600">Erro ao verificar acesso:</p>
          <p className="mt-2 text-sm text-slate-700">{errorMsg}</p>
          <a href="/esqueci-senha" className="mt-4 inline-block text-sm font-semibold text-indigo-600 hover:underline">
            Tentar novamente
          </a>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center">
      <p className="text-sm text-slate-500">Verificando acesso...</p>
    </main>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense>
      <CallbackHandler />
    </Suspense>
  )
}
