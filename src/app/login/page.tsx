'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function humanizeAuthError(message: string) {
  const msg = message.toLowerCase()

  if (
    msg.includes('invalid login credentials') ||
    msg.includes('invalid_credentials') ||
    msg.includes('email not confirmed') ||
    msg.includes('invalid email or password')
  ) {
    return 'E-mail ou senha inválidos.'
  }

  if (
    msg.includes('user already registered') ||
    msg.includes('already registered') ||
    msg.includes('already been registered')
  ) {
    return 'Este e-mail já está cadastrado. Tente entrar ou recuperar a senha.'
  }

  if (
    msg.includes('password should be at least') ||
    msg.includes('password must be at least')
  ) {
    return 'A senha precisa ter pelo menos 6 caracteres.'
  }

  if (
    msg.includes('rate limit') ||
    msg.includes('too many requests')
  ) {
    return 'Muitas tentativas em pouco tempo. Aguarde um pouco e tente novamente.'
  }

  return 'Não foi possível concluir a operação. Revise os dados e tente novamente.'
}

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<'supervisor' | 'encarregado'>('supervisor')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (searchParams.get('error') === 'inactive') {
      supabase.auth.signOut()
    }
  }, [searchParams, supabase])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setSuccessMessage('')
    setErrorMessage('')

    try {
      if (!email.trim() || !password.trim()) {
        setErrorMessage('Preencha e-mail e senha.')
        setLoading(false)
        return
      }

      if (mode === 'signup') {
        if (!fullName.trim()) {
          setErrorMessage('Preencha o nome completo.')
          setLoading(false)
          return
        }

        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim(),
              requested_role: role,
            },
          },
        })

        if (error) {
          setErrorMessage(humanizeAuthError(error.message))
          setLoading(false)
          return
        }

        setSuccessMessage('Conta criada com sucesso. Agora você já pode entrar.')
        setLoading(false)
        return
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error) {
        setErrorMessage(humanizeAuthError(error.message))
        setLoading(false)
        return
      }

      router.replace('/dashboard')
      router.refresh()
    } catch (error) {
      console.error(error)
      setErrorMessage('Ocorreu um erro ao processar sua solicitação.')
    } finally {
      setLoading(false)
    }
  }

  const urlErrorMessage =
    searchParams.get('error') === 'confirm'
      ? 'Não foi possível confirmar seu e-mail. Tente novamente.'
      : searchParams.get('error') === 'inactive'
      ? 'Sua conta está desativada. Procure o administrador do sistema.'
      : ''

  const inputClassName =
    'w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-black placeholder:text-gray-400 outline-none focus:border-green-500'

  return (
    <main className="min-h-screen bg-green-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-green-100 p-8">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-green-700">TermoEquip</h1>
          <p className="text-sm text-black mt-2">
            {mode === 'login'
              ? 'Entre para acessar os termos e o histórico do sistema.'
              : 'Crie sua conta para utilizar o TermoEquip.'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-6">
          <button
            type="button"
            onClick={() => {
              setMode('login')
              setSuccessMessage('')
              setErrorMessage('')
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
              setSuccessMessage('')
              setErrorMessage('')
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
          {mode === 'signup' ? (
            <>
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Nome completo
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Digite seu nome completo"
                  className={inputClassName}
                  style={{ color: '#111827', WebkitTextFillColor: '#111827' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Função inicial no sistema
                </label>
                <select
                  value={role}
                  onChange={(e) =>
                    setRole(e.target.value as 'supervisor' | 'encarregado')
                  }
                  className={inputClassName}
                  style={{ color: '#111827', WebkitTextFillColor: '#111827' }}
                >
                  <option value="supervisor">Supervisor</option>
                  <option value="encarregado">Encarregado</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  O perfil poderá ser revisado depois pelo administrador.
                </p>
              </div>
            </>
          ) : null}

          <div>
            <label className="block text-sm font-medium text-black mb-1">
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seuemail@exemplo.com"
              className={inputClassName}
              style={{ color: '#111827', WebkitTextFillColor: '#111827' }}
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
              className={inputClassName}
              style={{ color: '#111827', WebkitTextFillColor: '#111827' }}
            />
          </div>

          {mode === 'login' ? (
            <div className="text-right">
              <Link
                href="/esqueci-senha"
                className="text-sm font-semibold text-green-700 hover:underline"
              >
                Esqueci minha senha
              </Link>
            </div>
          ) : null}

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

        {successMessage ? (
          <div className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            {successMessage}
          </div>
        ) : null}

        {(errorMessage || urlErrorMessage) ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage || urlErrorMessage}
          </div>
        ) : null}
      </div>
    </main>
  )
}
