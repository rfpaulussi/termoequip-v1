import { redirect } from 'next/navigation'
import { getCurrentProfile } from '@/lib/auth/profile'
import { listEmployees } from '@/lib/terms-supabase'
import { createClient } from '@/lib/supabase/server'
import { toggleEmployeeStatusAction } from './actions'
import EmployeeForm from './employee-form'

type PageProps = {
  searchParams?: Promise<{ error?: string; success?: string; editar?: string }>
}

export default async function FuncionariosPage({ searchParams }: PageProps) {
  const query = (await searchParams) ?? {}
  const profile = await getCurrentProfile()
  if (!profile) redirect('/login')

  const isAdmin = profile.role === 'superadmin' || profile.role === 'admin'
  const centrosCusto = isAdmin ? undefined : (profile.centros_custo ?? [])

  const employees = await listEmployees(centrosCusto)

  const supabase = await createClient()

  // Contratos filtrados pelo acesso do usuário
  const contratosQuery = supabase
    .from('contracts')
    .select('centro_custo, contrato')
    .eq('ativo', true)
    .order('centro_custo')

  if (!isAdmin && centrosCusto && centrosCusto.length > 0) {
    contratosQuery.in('centro_custo', centrosCusto)
  }

  const { data: contratos } = await contratosQuery
  const contratosList = contratos ?? []

  const { data: funcoes } = await supabase
    .from('job_functions')
    .select('nome')
    .eq('ativo', true)
    .order('nome')
  const funcoesList = funcoes ?? []

  const editandoId = query.editar ?? null
  const editando = editandoId ? (employees.find(e => e.id === editandoId) ?? null) : null

  const successMessage =
    query.success === 'created' ? 'Funcionário cadastrado com sucesso.' :
    query.success === 'updated' ? 'Funcionário atualizado com sucesso.' : ''
  const errorMessage =
    query.error === 'required' ? 'Preencha todos os campos obrigatórios.' :
    query.error === 'cpf_duplicado' ? 'CPF já cadastrado para outro funcionário.' :
    query.error === 're_duplicado' ? 'RE já cadastrado para outro funcionário.' :
    query.error === 'save_failed' ? 'Erro ao salvar. Tente novamente.' : ''

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Cadastros</p>
        <h1 className="mt-1 text-3xl font-black text-slate-900">Funcionários</h1>
        <p className="mt-1 text-sm text-slate-500">
          Pré-cadastre colaboradores para agilizar o preenchimento dos termos de responsabilidade.
        </p>
      </div>

      {successMessage && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      <EmployeeForm
        contratos={contratosList}
        funcoes={funcoesList}
        editando={editando}
      />

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-800">Funcionários cadastrados</h2>
          <span className="text-xs text-slate-400">{employees.length} registro(s)</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <th className="px-4 py-3 text-left">Nome</th>
                <th className="px-4 py-3 text-left">RE</th>
                <th className="px-4 py-3 text-left">CPF</th>
                <th className="px-4 py-3 text-left">Função</th>
                <th className="px-4 py-3 text-left">Centro de custo</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {employees.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400 text-xs">
                    Nenhum funcionário cadastrado ainda.
                  </td>
                </tr>
              )}
              {employees.map(emp => (
                <tr key={emp.id} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3 font-medium text-slate-800">{emp.nome_completo}</td>
                  <td className="px-4 py-3 text-slate-600">{emp.re}</td>
                  <td className="px-4 py-3 text-slate-600">{emp.cpf}</td>
                  <td className="px-4 py-3 text-slate-600">{emp.funcao}</td>
                  <td className="px-4 py-3 text-slate-500">{emp.centro_custo ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      emp.ativo ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {emp.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <a
                        href={`/funcionarios?editar=${emp.id}`}
                        className="text-xs font-medium text-indigo-600 hover:underline"
                      >
                        Editar
                      </a>
                      <form action={toggleEmployeeStatusAction}>
                        <input type="hidden" name="id" value={emp.id} />
                        <input type="hidden" name="ativo" value={String(emp.ativo)} />
                        <button
                          type="submit"
                          className={`text-xs font-medium hover:underline ${
                            emp.ativo ? 'text-rose-500' : 'text-emerald-600'
                          }`}
                        >
                          {emp.ativo ? 'Inativar' : 'Reativar'}
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
