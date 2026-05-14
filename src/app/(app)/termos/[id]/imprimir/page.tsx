import Link from 'next/link'
import { getTermById } from '@/lib/terms-supabase'
import PrintButton from './print-button'

type PageProps = {
  params: Promise<{ id: string }>
}

function formatDate(value: string | null | undefined) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('pt-BR')
}

function formatCpf(value: string | null | undefined) {
  if (!value) return '-'
  const digits = value.replace(/\D/g, '')
  if (digits.length !== 11) return value
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

export default async function ImprimirTermoPage({ params }: PageProps) {
  const { id } = await params
  const { term } = await getTermById(id)

  if (term.is_draft) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="max-w-lg rounded-2xl border border-amber-200 bg-white p-8 shadow-sm">
          <h1 className="text-xl font-bold text-amber-800">Rascunho não pode ser impresso</h1>
          <p className="mt-2 text-sm text-slate-600">
            Finalize o termo antes de imprimir.
          </p>
          <div className="mt-5 flex gap-3">
            <Link href="/termos" className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition">
              Voltar
            </Link>
            <Link href={`/termos/${term.id}/editar`} className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-bold text-white hover:bg-amber-600 transition">
              Editar rascunho
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      {/* Barra de ações — some na impressão */}
      <div className="mb-6 flex items-center justify-between print:hidden">
        <div className="flex items-center gap-2">
          <Link href={`/termos/${term.id}`} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition">
            ← Voltar
          </Link>
        </div>
        <PrintButton />
      </div>

      {/* Documento — aparece na impressão */}
      <div className="rounded-2xl border border-slate-200 bg-white p-10 shadow-sm print:shadow-none print:border-none print:rounded-none print:p-0">

        {/* Cabeçalho */}
        <div className="mb-8 border-b border-slate-300 pb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Demax Serviços e Comércio LTDA</p>
          <h1 className="mt-2 text-xl font-black uppercase tracking-wide text-slate-900">
            Termo de Responsabilidade de Equipamento
          </h1>
          <div className="mt-3 flex items-center justify-center gap-6 text-sm text-slate-600">
            <span><strong>Nº:</strong> {term.numero_termo}</span>
            <span><strong>Data:</strong> {formatDate(term.data_entrega)}</span>
          </div>
        </div>

        {/* Dados do colaborador */}
        <div className="mb-6">
          <h2 className="mb-3 text-sm font-black uppercase tracking-widest text-slate-500">Dados do Colaborador</h2>
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
            <div><span className="font-semibold text-slate-700">Colaborador: </span>{term.funcionario_nome}</div>
            <div><span className="font-semibold text-slate-700">CPF: </span>{formatCpf(term.cpf)}</div>
            <div><span className="font-semibold text-slate-700">Matrícula: </span>{term.matricula}</div>
            <div><span className="font-semibold text-slate-700">Função: </span>{term.funcao}</div>
            <div><span className="font-semibold text-slate-700">Supervisor: </span>{term.supervisor}</div>
            <div><span className="font-semibold text-slate-700">Centro de custo: </span>{term.centro_custo}</div>
            <div className="col-span-2"><span className="font-semibold text-slate-700">Contrato: </span>{term.contrato}</div>
          </div>
        </div>

        {/* Dados do equipamento */}
        <div className="mb-6 border-t border-slate-200 pt-6">
          <h2 className="mb-3 text-sm font-black uppercase tracking-widest text-slate-500">Dados do Equipamento</h2>
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
            <div><span className="font-semibold text-slate-700">Tipo: </span>{term.tipo_equipamento}</div>
            <div><span className="font-semibold text-slate-700">Patrimônio: </span>{term.patrimonio}</div>
            <div><span className="font-semibold text-slate-700">Marca / Modelo: </span>{term.marca || '-'} / {term.modelo || '-'}</div>
            <div><span className="font-semibold text-slate-700">Nº de série: </span>{term.numero_serie || '-'}</div>
            <div><span className="font-semibold text-slate-700">Estado na entrega: </span>{term.estado_entrega || '-'}</div>
            <div><span className="font-semibold text-slate-700">Acessórios: </span>{term.acessorios || '-'}</div>
            {term.observacoes && (
              <div className="col-span-2"><span className="font-semibold text-slate-700">Observações: </span>{term.observacoes}</div>
            )}
          </div>
        </div>

        {/* Cláusulas */}
        <div className="border-t border-slate-200 pt-6 space-y-3 text-sm leading-6 text-slate-700">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-500">Declaração e Condições de Responsabilidade</h2>

          <p>Pelo presente instrumento, a <strong>DEMAX Serviços e Comércio LTDA</strong>, doravante denominada <strong>EMPRESA</strong>, entrega ao colaborador acima identificado o equipamento descrito neste termo, para uso exclusivo no exercício de suas atividades profissionais.</p>

          <p><strong>1. Objeto</strong> — O presente termo formaliza a entrega do equipamento ao colaborador, que declara recebê-lo em condições adequadas de uso, responsabilizando-se por sua guarda, conservação e utilização correta.</p>

          <p><strong>2. Condições de uso</strong> — O colaborador compromete-se a: (a) utilizar o bem exclusivamente para fins profissionais; (b) zelar por sua conservação e segurança; (c) não emprestar ou ceder a terceiros sem autorização; (d) comunicar imediatamente qualquer dano, perda ou necessidade de manutenção.</p>

          <p><strong>3. Responsabilidade</strong> — O colaborador será responsável pelos danos causados quando comprovado uso inadequado, negligência, imprudência, imperícia ou dolo.</p>

          <p><strong>4. Manutenção</strong> — Compete à EMPRESA providenciar manutenção preventiva e corretiva, arcar com taxas e licenças vinculadas ao bem.</p>

          <p><strong>5. Sinistros</strong> — Na ocorrência de acidente, furto ou perda, o colaborador obriga-se a comunicar imediatamente a EMPRESA e adotar as providências cabíveis, inclusive registro de boletim de ocorrência quando necessário.</p>

          <p><strong>6. Devolução</strong> — O equipamento deverá ser devolvido nas mesmas condições em que recebido, ressalvado o desgaste natural, sempre que solicitado pela EMPRESA, na substituição do bem, no desligamento ou na transferência de função.</p>

          <p><strong>7. Descontos</strong> — Eventuais prejuízos causados por dolo ou culpa do colaborador poderão ser objeto de desconto em folha, observados os limites legais, inclusive o art. 462 da CLT.</p>

          <p><strong>8. Disposições finais</strong> — O equipamento permanece como patrimônio exclusivo da EMPRESA. Fica eleito o foro da Comarca de Mogi das Cruzes/SP. O colaborador declara estar ciente de todas as condições acima, comprometendo-se a cumpri-las integralmente.</p>
        </div>

        {/* Assinaturas */}
        <div className="mt-12 grid grid-cols-2 gap-10 text-sm">
          <div className="text-center">
            <div className="mb-1 text-xs text-slate-400">Mogi das Cruzes, {formatDate(term.data_entrega)}</div>
            <div className="border-t border-slate-400 pt-3 font-medium text-slate-700">
              {term.funcionario_nome}
            </div>
            <div className="text-xs text-slate-500">Colaborador — Mat. {term.matricula}</div>
          </div>
          <div className="text-center">
            <div className="mb-1 text-xs text-slate-400">&nbsp;</div>
            <div className="border-t border-slate-400 pt-3 font-medium text-slate-700">
              {term.supervisor}
            </div>
            <div className="text-xs text-slate-500">Responsável pela entrega</div>
          </div>
        </div>

      </div>
    </div>
  )
}
