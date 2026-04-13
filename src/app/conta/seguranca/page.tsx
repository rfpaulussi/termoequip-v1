'use client'

import Link from 'next/link'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function SegurancaPage() {
  const supabase = createClient()

  const [current_password: currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')

    try {
      if (!currentPassword || !newPassword || !confirmPassword) {
        setError('Preencha todos os campos.')
        setLoading(false)
        return
      }

      if (newPassword.length < 6) {
        setError('A nova senha precisa ter pelo menos 6 caracteres.')
        setLoading(false)
        return
      }

      if (newPassword !== confirmPassword) {
        setError('As novas senhas não coincidem.')
        setLoading(false)
        return
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
        current_password: currentPassword,
      })

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

      setMessage('Senha alterada com sucesso.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      console.error(err)
      setError('Não foi possível alterar a senha.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-green-50 p-6">
      <div className="mx-auto max-w-2xl rounded-2xl border border-green-100 bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-green-700">Trocar minha senha</h1>
            <p className="mt-2 text-sm text-black">
              Atualize sua senha de acesso com segurança.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="rounded-xl border border-green-200 bg-white px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-100"
          >
            Dashboard
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-black">
              Senha atual
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-black outline-none focus:border-green-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-black">
              Nova senha
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-black outline-none focus:border-green-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-black">
              Confirmar nova senha
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-black outline-none focus:border-green-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
          >
            {loading ? 'Salvando...' : 'Atualizar senha'}
          </button>
        </form>

        {message ? (
          <div className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            {message}
          </div>
        ) : null}

        {error ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}
      </div>
    </main>
  )
}
