import { redirect } from 'next/navigation'
import { getCurrentProfile } from '@/lib/auth/profile'
import { listEmployees, listTerms } from '@/lib/terms-supabase'
import { createClient } from '@/lib/supabase/server'
import TransferPanel from './transfer-panel'

type PageProps = {
  searchParams?: Promise<{ error?: string; success?: string; ok?: string; falhas?: string; novo?: string }>
}

export default async function TransferenciasPage({ searchParams }: PageProps) {
  const query = (await searchParams) ?? {}
  const profile = await getCurrentProfile()
  if (!profile) redirect('/login')

  const isAdmin = profile.role === 'superadmin' || profile.role === 'admin'
  const [allTerms, employees, { data: funcoes }] = await Promise.all([
    listTerms(isAdmin ? undefined : profile.centros_custo),
    listEmployees(),
    (await createClient()).from('job_functions').select('nome').eq('ativo', true).order('nome'),
  ])

  const terms = allTerms
    .filter(t => t.status === 'ENTREGUE' && !t.is_draft && !t.is_reserva)
    .map(t => ({
      id: t.id,
      patrimonio: t.patrimonio,
      tipo_equipamento: t.tipo_equipamento,
      funcionario_nome: t.funcionario_nome,
      matricula: t.matricula,
      funcao: t.funcao,
      centro_custo: t.centro_custo,
      em_manutencao: !!t.em_manutencao,
      marca_modelo: [t.marca, t.modelo].filter(Boolean).join(' '),
      data_entrega: t.data_entrega,
    }))

  const ok = Number(query.ok ?? 0)
  const falhas = Number(query.falhas ?? 0)
  const successMessage =
    query.success === 'transferred' ? `${ok} patrimônio(s) transferido(s). Os novos termos já estão ativos.` :
    query.success === 'employee_created' ? 'Operador cadastrado e já selecionado em "Novo responsável".' : ''
  const errorMessage =
    query.error === 'transfer_required' ? 'Selecione os patrimônios, o novo responsável e a data.' :
    query.error === 'transfer_employee' ? 'Funcionário de destino não encontrado ou inativo.' :
    query.error === 'transfer_partial' ? `${ok} transferido(s), ${falhas} falharam. Os que falharam continuam com o responsável atual.` :
    query.error === 'employee_required' ? 'Preencha todos os campos do novo operador.' :
    query.error === 'employee_cpf' ? 'CPF do novo operador é inválido.' :
    query.error === 'employee_cpf_dup' ? 'CPF já cadastrado para outro funcionário.' :
    query.error === 'employee_re_dup' ? 'RE já cadastrado para outro funcionário.' :
    query.error === 'employee_failed' ? 'Não foi possível cadastrar o operador.' : ''

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Operação</p>
        <h1 className="mt-1 text-3xl font-black text-slate-900">Transferência de patrimônio</h1>
        <p className="mt-1 text-sm text-slate-500">
          Escolha quem entrega, marque os patrimônios e informe quem recebe. O termo atual é encerrado como
          &quot;transferido&quot; e o novo termo já nasce finalizado, com o histórico preservado.
        </p>
      </div>

      {successMessage && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{successMessage}</div>
      )}
      {errorMessage && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</div>
      )}

      <TransferPanel
        terms={terms}
        employees={employees
          .filter(e => e.ativo)
          .map(e => ({ id: e.id, nome_completo: e.nome_completo, re: e.re, funcao: e.funcao }))}
        funcoes={funcoes ?? []}
        preselectEmployee={query.novo ?? ''}
      />
    </div>
  )
}
