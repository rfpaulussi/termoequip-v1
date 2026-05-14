'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function humanizeAuthError(message: string) {
  const msg = message.toLowerCase()
  if (msg.includes('invalid login credentials') || msg.includes('invalid_credentials') || msg.includes('email not confirmed') || msg.includes('invalid email or password')) return 'E-mail ou senha inválidos.'
  if (msg.includes('user already registered') || msg.includes('already registered') || msg.includes('already been registered')) return 'Este e-mail já está cadastrado. Tente entrar ou recuperar a senha.'
  if (msg.includes('password should be at least') || msg.includes('password must be at least')) return 'A senha precisa ter pelo menos 6 caracteres.'
  if (msg.includes('rate limit') || msg.includes('too many requests')) return 'Muitas tentativas em pouco tempo. Aguarde um pouco e tente novamente.'
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
    if (searchParams.get('error') === 'inactive') supabase.auth.signOut()
  }, [searchParams, supabase])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setSuccessMessage('')
    setErrorMessage('')
    try {
      if (!email.trim() || !password.trim()) { setErrorMessage('Preencha e-mail e senha.'); setLoading(false); return }
      if (mode === 'signup') {
        if (!fullName.trim()) { setErrorMessage('Preencha o nome completo.'); setLoading(false); return }
        const { error } = await supabase.auth.signUp({ email: email.trim(), password, options: { data: { full_name: fullName.trim(), requested_role: role } } })
        if (error) { setErrorMessage(humanizeAuthError(error.message)); setLoading(false); return }
        setSuccessMessage('Conta criada com sucesso. Agora você já pode entrar.')
        setLoading(false)
        return
      }
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
      if (error) { setErrorMessage(humanizeAuthError(error.message)); setLoading(false); return }
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
    searchParams.get('error') === 'confirm' ? 'Não foi possível confirmar seu e-mail. Tente novamente.'
    : searchParams.get('error') === 'inactive' ? 'Sua conta está desativada. Procure o administrador do sistema.'
    : ''

  const inputClass = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition'

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 mb-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-slate-900">TermoEquip</h1>
          <p className="mt-1 text-sm text-slate-500">
            {mode === 'login' ? 'Entre para acessar o sistema.' : 'Crie sua conta para utilizar o TermoEquip.'}
          </p>
        </div>

        <div className="rounded-2xl bg-white shadow-sm border border-slate-200 p-8">
          <div className="grid grid-cols-2 gap-2 mb-6 rounded-xl bg-slate-100 p-1">
            <button type="button" onClick={() => { setMode('login'); setSuccessMessage(''); setErrorMessage('') }}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${mode === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              Entrar
            </button>
            <button type="button" onClick={() => { setMode('signup'); setSuccessMessage(''); setErrorMessage('') }}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${mode === 'signup' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              Criar conta
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5">Nome completo</label>
                  <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Digite seu nome completo" className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5">Função no sistema</label>
                  <select value={role} onChange={e => setRole(e.target.value as 'supervisor' | 'encarregado')} className={inputClass}>
                    <option value="supervisor">Supervisor</option>
                    <option value="encarregado">Encarregado</option>
                  </select>
                  <p className="mt-1 text-xs text-slate-400">O perfil poderá ser revisado pelo administrador.</p>
                </div>
              </>
            )}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5">E-mail</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seuemail@exemplo.com" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5">Senha</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className={inputClass} />
            </div>
            {mode === 'login' && (
              <div className="text-right">
                <Link href="/esqueci-senha" className="text-xs font-semibold text-indigo-600 hover:underline">Esqueci minha senha</Link>
              </div>
            )}
            <button type="submit" disabled={loading}
              className="w-full rounded-xl bg-indigo-600 text-white py-3 text-sm font-bold hover:bg-indigo-700 transition disabled:opacity-60 mt-2">
              {loading ? 'Processando...' : mode === 'login' ? 'Entrar' : 'Criar conta'}
            </button>
          </form>

          {successMessage && (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{successMessage}</div>
          )}
          {(errorMessage || urlErrorMessage) && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage || urlErrorMessage}</div>
          )}
        </div>
      </div>
    </main>
  )
}
