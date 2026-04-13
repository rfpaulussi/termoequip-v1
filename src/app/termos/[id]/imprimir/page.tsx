import Link from 'next/link'
import PrintButton from '@/components/print-button'
import { getTermById } from '@/lib/terms-supabase'

const COMPANY_NAME = 'Demax Serviços e Comércio LTDA'

type PageProps = {
  params: Promise<{
    id: string
  }>
}

function formatDate(value: string | null | undefined) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('pt-BR')
}

function conditionLabel(value: string) {
  switch (value) {
    case 'EM_PERFEITO_ESTADO':
      return 'Em perfeito estado'
    case 'COM_DEFEITO':
      return 'Com defeito'
    case 'FALTANDO_PECAS':
      return 'Faltando peças'
    default:
      return value
  }
}

function InfoRow({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wide text-gray-700">
        {label}
      </p>
      <p className="mt-1 text-sm text-black">{value || '-'}</p>
    </div>
  )
}

export default async function ImprimirTermoPage({ params }: PageProps) {
  const { id } = await params
  const { term, termReturn } = await getTermById(id)

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-6">
      <style>{`
        @page {
          size: A4 portrait;
          margin: 12mm;
        }

        .print-sheet {
          width: 210mm;
          min-height: 297mm;
        }

        @media print {
          .no-print { display: none !important; }
          html, body { background: white !important; }
          body { margin: 0 !important; }
          main { background: white !important; padding: 0 !important; }
          .print-sheet {
            width: 100% !important;
            min-height: auto !important;
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            max-width: 100% !important;
            border-radius: 0 !important;
            padding: 0 !important;
          }
        }
      `}</style>

      <div className="mx-auto w-full max-w-[210mm] print-sheet rounded-2xl border border-gray-300 bg-white p-8 shadow-sm">
        <div className="no-print mb-6 flex flex-wrap justify-between gap-3">
          <Link
            href={`/termos/${term.id}`}
            className="rounded-xl border border-green-200 bg-white px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-100"
          >
            Voltar
          </Link>

          <PrintButton />
        </div>

        <header className="border-b-2 border-black pb-5">
          <div className="text-center">
            <h1 className="text-2xl font-bold uppercase text-black">
              Termo de Responsabilidade de Equipamento
            </h1>
            <p className="mt-2 text-sm font-semibold text-black">
              {COMPANY_NAME}
            </p>
          </div>
        </header>

        <section className="mt-6 rounded-xl border border-gray-300 p-4">
          <div className="grid gap-4 md:grid-cols-2">
            <InfoRow label="Número do termo" value={term.numero_termo} />
            <InfoRow label="Data da entrega" value={formatDate(term.data_entrega)} />
            <InfoRow label="Colaborador" value={term.funcionario_nome} />
            <InfoRow label="Matrícula" value={term.matricula} />
            <InfoRow label="Função" value={term.funcao} />
            <InfoRow label="Supervisor" value={term.supervisor} />
            <InfoRow label="Contrato" value={term.contrato} />
            <InfoRow label="Centro de custo" value={term.centro_custo} />
          </div>
        </section>

        <section className="mt-6 rounded-xl border border-gray-300 p-4">
          <h2 className="text-base font-bold uppercase text-black">
            Dados do equipamento
          </h2>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <InfoRow label="Tipo do equipamento" value={term.tipo_equipamento} />
            <InfoRow label="Patrimônio" value={term.patrimonio} />
            <InfoRow label="Marca" value={term.marca || '-'} />
            <InfoRow label="Modelo" value={term.modelo || '-'} />
            <InfoRow label="Número de série" value={term.numero_serie || '-'} />
            <InfoRow label="Estado na entrega" value={term.estado_entrega || '-'} />
            <div className="md:col-span-2">
              <InfoRow label="Acessórios" value={term.acessorios || '-'} />
            </div>
            <div className="md:col-span-2">
              <InfoRow label="Observações" value={term.observacoes || '-'} />
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-xl border border-gray-300 p-4">
          <h2 className="text-base font-bold uppercase text-black">
            Declaração de responsabilidade
          </h2>

          <div className="mt-4 space-y-4 text-justify text-sm leading-7 text-black">
            <p>
              Declaro, para os devidos fins, que recebi da empresa <strong>{COMPANY_NAME}</strong> o
              equipamento acima descrito, em condições adequadas de uso, comprometendo-me a utilizá-lo
              exclusivamente para fins profissionais relacionados às minhas atividades.
            </p>

            <p>
              Comprometo-me a zelar pela guarda, conservação, uso correto e devolução do equipamento,
              responsabilizando-me por comunicar imediatamente qualquer defeito, dano, perda, extravio
              ou necessidade de manutenção identificada durante sua utilização.
            </p>

            <p>
              Declaro ainda estar ciente de que o equipamento permanece como patrimônio da empresa,
              devendo ser devolvido sempre que solicitado, em caso de substituição, desligamento,
              transferência de função ou encerramento da necessidade operacional.
            </p>
          </div>
        </section>

        <section className="mt-6 rounded-xl border border-gray-300 p-4">
          <h2 className="text-base font-bold uppercase text-black">
            Situação atual
          </h2>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <InfoRow label="Status do termo" value={term.status} />
            <InfoRow
              label="Manutenção"
              value={term.em_manutencao ? 'Equipamento em manutenção' : 'Sem manutenção registrada'}
            />

            {term.em_manutencao ? (
              <div className="md:col-span-2">
                <InfoRow
                  label="Observação da manutenção"
                  value={term.observacao_manutencao || '-'}
                />
              </div>
            ) : null}
          </div>
        </section>

        {termReturn ? (
          <section className="mt-6 rounded-xl border border-gray-300 p-4">
            <h2 className="text-base font-bold uppercase text-black">
              Registro de devolução
            </h2>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <InfoRow
                label="Data da devolução"
                value={formatDate(termReturn.data_devolucao)}
              />
              <InfoRow
                label="Condição"
                value={conditionLabel(termReturn.condicao)}
              />
              <InfoRow
                label="Responsável pelo recebimento"
                value={termReturn.responsavel_recebimento}
              />
              <InfoRow
                label="Observações"
                value={termReturn.observacoes || '-'}
              />
            </div>
          </section>
        ) : null}

        <section className="mt-12 grid gap-12 md:grid-cols-2">
          <div className="pt-12">
            <div className="border-t border-black pt-2 text-center text-sm text-black">
              Assinatura do colaborador
            </div>
          </div>

          <div className="pt-12">
            <div className="border-t border-black pt-2 text-center text-sm text-black">
              Assinatura do responsável pela entrega
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
