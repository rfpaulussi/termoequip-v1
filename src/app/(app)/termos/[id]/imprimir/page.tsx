import Link from 'next/link'
import { getTermById } from '@/lib/terms-supabase'


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
          <p className="mt-2 text-sm text-slate-600">Finalize o termo antes de imprimir.</p>
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
        <Link href={`/termos/${term.id}`} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition">
          ← Voltar
        </Link>
        <div className="flex items-center gap-3">
          <a
            href={`/api/termos/${term.id}/pdf`}
            download
            className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-bold text-white hover:bg-indigo-700 transition"
          >
            ↓ Baixar PDF
          </a>
        </div>
      </div>

      {/* Documento */}
      <div className="termo-print-body rounded-2xl border border-slate-200 bg-white p-10 shadow-sm print:shadow-none print:border-none print:rounded-none print:p-0">

        {/* Cabeçalho */}
        <div className="print-avoid-break mb-6 border-b border-slate-300 pb-5 text-center">
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
        <div className="print-avoid-break mb-5">
          <h2 className="mb-3 border-b border-slate-100 pb-1 text-xs font-black uppercase tracking-widest text-slate-500">Dados do Colaborador</h2>
          <div className="grid grid-cols-2 gap-x-10 gap-y-2 text-sm">
            <div><span className="font-semibold text-slate-600">Colaborador: </span><span className="text-slate-800">{term.funcionario_nome}</span></div>
            <div><span className="font-semibold text-slate-600">CPF: </span><span className="text-slate-800">{formatCpf(term.cpf)}</span></div>
            <div><span className="font-semibold text-slate-600">Matrícula: </span><span className="text-slate-800">{term.matricula}</span></div>
            <div><span className="font-semibold text-slate-600">Função: </span><span className="text-slate-800">{term.funcao}</span></div>
            <div><span className="font-semibold text-slate-600">Supervisor: </span><span className="text-slate-800">{term.supervisor}</span></div>
            <div><span className="font-semibold text-slate-600">Centro de custo: </span><span className="text-slate-800">{term.centro_custo}</span></div>
            <div className="col-span-2"><span className="font-semibold text-slate-600">Contrato: </span><span className="text-slate-800">{term.contrato}</span></div>
          </div>
        </div>

        {/* Dados do equipamento */}
        <div className="print-avoid-break mb-5 border-t border-slate-200 pt-5">
          <h2 className="mb-3 border-b border-slate-100 pb-1 text-xs font-black uppercase tracking-widest text-slate-500">Dados do Equipamento</h2>
          <div className="grid grid-cols-2 gap-x-10 gap-y-2 text-sm">
            <div><span className="font-semibold text-slate-600">Tipo: </span><span className="text-slate-800">{term.tipo_equipamento}</span></div>
            <div><span className="font-semibold text-slate-600">Patrimônio: </span><span className="text-slate-800">{term.patrimonio}</span></div>
            <div><span className="font-semibold text-slate-600">Marca / Modelo: </span><span className="text-slate-800">{term.marca || '-'} / {term.modelo || '-'}</span></div>
            <div><span className="font-semibold text-slate-600">Nº de série: </span><span className="text-slate-800">{term.numero_serie || '-'}</span></div>
            <div><span className="font-semibold text-slate-600">Estado na entrega: </span><span className="text-slate-800">{term.estado_entrega || '-'}</span></div>
            <div><span className="font-semibold text-slate-600">Acessórios: </span><span className="text-slate-800">{term.acessorios || '-'}</span></div>
            {term.observacoes && (
              <div className="col-span-2"><span className="font-semibold text-slate-600">Observações: </span><span className="text-slate-800">{term.observacoes}</span></div>
            )}
          </div>
        </div>

        {/* Cláusulas */}
        <div className="border-t border-slate-200 pt-5 text-slate-700" style={{fontSize:'11px', lineHeight:'1.5'}}>
          <h2 className="mb-3 border-b border-slate-100 pb-1 text-xs font-black uppercase tracking-widest text-slate-500">Declaração e Condições de Responsabilidade</h2>
          <p className="mb-2">Pelo presente instrumento, a <strong>DEMAX Serviços e Comércio LTDA</strong>, doravante denominada <strong>EMPRESA</strong>, entrega ao colaborador acima identificado o equipamento descrito neste termo, para uso exclusivo no exercício de suas atividades profissionais.</p>
          <p className="mb-2"><strong>1. Objeto</strong> — O presente termo formaliza a entrega do equipamento ao colaborador, que declara recebê-lo em condições adequadas de uso, responsabilizando-se por sua guarda, conservação e utilização correta.</p>
          <p className="mb-2"><strong>2. Condições de uso</strong> — O colaborador compromete-se a: (a) utilizar o bem exclusivamente para fins profissionais; (b) zelar por sua conservação e segurança; (c) não emprestar ou ceder a terceiros sem autorização; (d) comunicar imediatamente qualquer dano, perda ou necessidade de manutenção.</p>
          <p className="mb-2"><strong>3. Responsabilidade</strong> — O colaborador será responsável pelos danos causados quando comprovado uso inadequado, negligência, imprudência, imperícia ou dolo.</p>
          <p className="mb-2"><strong>4. Manutenção</strong> — Compete à EMPRESA providenciar manutenção preventiva e corretiva, arcar com taxas e licenças vinculadas ao bem.</p>
          <p className="mb-2"><strong>5. Sinistros</strong> — Na ocorrência de acidente, furto ou perda, o colaborador obriga-se a comunicar imediatamente a EMPRESA e adotar as providências cabíveis, inclusive registro de boletim de ocorrência quando necessário.</p>
          <p className="mb-2"><strong>6. Devolução</strong> — O equipamento deverá ser devolvido nas mesmas condições em que recebido, ressalvado o desgaste natural, sempre que solicitado pela EMPRESA, na substituição do bem, no desligamento ou na transferência de função.</p>
          <p className="mb-2"><strong>7. Descontos</strong> — Eventuais prejuízos causados por dolo ou culpa do colaborador poderão ser objeto de desconto em folha, observados os limites legais, inclusive o art. 462 da CLT.</p>
          <p className="mb-2"><strong>8. Disposições finais</strong> — O equipamento permanece como patrimônio exclusivo da EMPRESA. Fica eleito o foro da Comarca de Mogi das Cruzes/SP. O colaborador declara estar ciente de todas as condições acima, comprometendo-se a cumpri-las integralmente.</p>
        </div>

        {/* Assinaturas */}
        <div className="print-signatures mt-8 grid grid-cols-2 gap-10 text-sm">
          <div className="text-center">
            <div className="mb-1 text-xs text-slate-400">Mogi das Cruzes, {formatDate(term.data_entrega)}</div>
            <div className="border-t border-slate-400 pt-3 font-medium text-slate-700">{term.funcionario_nome}</div>
            <div className="text-xs text-slate-500">Colaborador — Mat. {term.matricula}</div>
          </div>
          <div className="text-center">
            <div className="mb-1 text-xs text-slate-400">&nbsp;</div>
            <div className="border-t border-slate-400 pt-3 font-medium text-slate-700">{term.supervisor}</div>
            <div className="text-xs text-slate-500">Responsável pela entrega</div>
          </div>
        </div>

      </div>
    </div>
  )
}
