'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      if (!email || !password) {
        setMessage('Preencha e-mail e senha.')
        setLoading(false)
        return
      }

      if (mode === 'signup') {
        const redirectTo = window.location.origin

        const { error } = await supabase.auth.signUp({
          email: email,
          password: password,
          options: {
            emailRedirectTo: redirectTo,
          },
        })

        if (error) {
          setMessage(error.message)
          setLoading(false)
          return
        }

        setMessage('Conta criada com sucesso. Verifique seu e-mail para confirmar o cadastro.')
        setLoading(false)
        return
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      })

      if (error) {
        setMessage(error.message)
        setLoading(false)
        return
      }

      router.replace('/dashboard')
      router.refresh()
    } catch (error) {
      console.error(error)
      setMessage('Ocorreu um erro ao processar sua solicitação.')
    } finally {
      setLoading(false)
    }
  }

  const urlMessage =
    searchParams.get('error') === 'confirm'
      ? 'Não foi possível confirmar seu e-mail. Tente novamente.'
      : ''

  return (
    <main className="min-h-screen bg-green-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-green-100 p-8">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-green-700">TermoEquip</h1>
          <p className="text-sm text-black mt-2">
            {mode === 'login' ? 'Entrar na plataforma' : 'Criar nova conta'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-6">
          <button
            type="button"
            onClick={() => {
              setMode('login')
              setMessage('')
            }}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
              mode === 'login'
                ? 'bg-green-600 text-white'
                : 'bg-green-100 text-green-700'
            }`}
          >
            Entrar
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('signup')
              setMessage('')
            }}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
              mode === 'signup'
                ? 'bg-green-600 text-white'
                : 'bg-green-100 text-green-700'
            }`}
          >
            Criar conta
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seuemail@exemplo.com"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-green-600 text-white py-3 font-semibold hover:bg-green-700 transition disabled:opacity-60"
          >
            {loading
              ? 'Processando...'
              : mode === 'login'
              ? 'Entrar'
              : 'Criar conta'}
          </button>
        </form>

        {(message || urlMessage) && (
          <div className="mt-4 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-black">
            {message || urlMessage}
          </div>
        )}
      </div>
    </main>
  )
}
