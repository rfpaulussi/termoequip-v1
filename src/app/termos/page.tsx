'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import LogoutButton from '@/components/logout-button'

type AnyTerm = Record<string, any>

const STORAGE_KEY = 'termoequip_terms_v1'

function pickValue(obj: AnyTerm, keys: string[]) {
  for (const key of keys) {
    const value = obj?.[key]
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      return String(value)
    }
  }
  return ''
}

function getId(term: AnyTerm, index: number) {
  return pickValue(term, ['id', 'termId', 'uuid']) || `registro-${index + 1}`
}

function getCollaborator(term: AnyTerm) {
  return (
    pickValue(term, [
      'employeeName',
      'employee',
      'collaboratorName',
      'nomeColaborador',
      'nomeFuncionario',
      'nome',
      'responsavel',
    ]) || 'Não informado'
  )
}

function getEquipment(term: AnyTerm) {
  return (
    pickValue(term, [
      'equipmentName',
      'equipamento',
      'equipment',
      'itemName',
      'item',
      'descricaoEquipamento',
    ]) || 'Equipamento não informado'
  )
}

function getCreatedAt(term: AnyTerm) {
  return (
    pickValue(term, [
      'createdAt',
      'issueDate',
      'issuedAt',
      'data',
      'date',
      'termDate',
    ]) || 'Sem data'
  )
}

function getStatus(term: AnyTerm) {
  const returned =
    term?.returnedAt ||
    term?.returnDate ||
    term?.devolvidoEm ||
    term?.devolucao ||
    term?.returned

  return returned ? 'Devolvido' : 'Ativo'
}

export default function TermosPage() {
  const [terms, setTerms] = useState<AnyTerm[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) {
        setTerms([])
        return
      }

      const parsed = JSON.parse(raw)
      setTerms(Array.isArray(parsed) ? parsed : [])
    } catch (error) {
      console.error('Erro ao carregar histórico:', error)
      setTerms([])
    }
  }, [])

  const filteredTerms = useMemo(() => {
    const term = search.trim().toLowerCase()

    if (!term) return terms

    return terms.filter((item, index) => {
      const id = getId(item, index).toLowerCase()
      const collaborator = getCollaborator(item).toLowerCase()
      const equipment = getEquipment(item).toLowerCase()
      const status = getStatus(item).toLowerCase()

      return (
        id.includes(term) ||
        collaborator.includes(term) ||
        equipment.includes(term) ||
        status.includes(term)
      )
    })
  }, [terms, search])

  return (
    <main className="min-h-screen bg-green-50 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-green-700">
              Histórico de Termos
            </h1>
            <p className="mt-2 text-black">
              Consulte os termos cadastrados no navegador e acompanhe os registros já lançados.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="rounded-xl border border-green-200 bg-white px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-100"
            >
              Dashboard
            </Link>

            <Link
              href="/termos/novo"
              className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
            >
              Novo termo
            </Link>

            <LogoutButton />
          </div>
        </div>

        <div className="mb-6 rounded-2xl border border-green-200 bg-white p-4 shadow-sm">
          <label className="mb-2 block text-sm font-semibold text-green-700">
            Buscar no histórico
          </label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, equipamento, status ou ID"
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-black placeholder:text-gray-400 outline-none focus:border-green-500"
          />
        </div>

        <div className="mb-4 text-sm text-black">
          Total de registros encontrados: <strong>{filteredTerms.length}</strong>
        </div>

        <div className="overflow-hidden rounded-2xl border border-green-200 bg-white shadow-sm">
          <div className="grid grid-cols-4 gap-4 bg-green-100 px-4 py-3 text-sm font-semibold text-green-800">
            <div>ID</div>
            <div>Colaborador</div>
            <div>Equipamento</div>
            <div>Status</div>
          </div>

          {filteredTerms.length === 0 ? (
            <div className="px-4 py-10 text-sm text-black">
              Nenhum termo encontrado.
              Cadastre alguns termos em <strong>Novo termo</strong> para testar o histórico.
            </div>
          ) : (
            filteredTerms.map((term, index) => {
              const id = getId(term, index)
              const collaborator = getCollaborator(term)
              const equipment = getEquipment(term)
              const status = getStatus(term)
              const createdAt = getCreatedAt(term)

              return (
                <Link
                  key={`${id}-${index}`}
                  href={id.startsWith('registro-') ? '/termos' : `/termos/${id}`}
                  className="grid grid-cols-4 gap-4 border-t border-green-100 px-4 py-4 text-sm text-black hover:bg-green-50"
                >
                  <div>
                    <div className="font-semibold text-green-700">{id}</div>
                    <div className="mt-1 text-xs text-gray-500">{createdAt}</div>
                  </div>

                  <div>{collaborator}</div>
                  <div>{equipment}</div>
                  <div>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        status === 'Devolvido'
                          ? 'bg-gray-200 text-gray-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {status}
                    </span>
                  </div>
                </Link>
              )
            })
          )}
        </div>
      </div>
    </main>
  )
}
