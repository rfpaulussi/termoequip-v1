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

      <div className="mx-auto w-full max-w-[210mm] print-sheet rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="no-print mb-6 flex flex-wrap justify-between gap-3">
          <Link
            href={`/termos/${term.id}`}
            className="rounded-xl border border-green-200 bg-white px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-100"
          >
            Voltar
          </Link>

          <PrintButton />
        </div>

        <header className="border-b border-gray-300 pb-6">
          <h1 className="text-center text-2xl font-bold text-black">
            TERMO DE RESPONSABILIDADE DE EQUIPAMENTO
          </h1>
          <p className="mt-2 text-center text-sm text-black">{COMPANY_NAME}</p>
        </header>

        <section className="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm font-semibold text-black">Número do termo</p>
            <p className="text-black">{term.numero_termo}</p>
          </div>

          <div>
            <p className="text-sm font-semibold text-black">Data da entrega</p>
            <p className="text-black">{formatDate(term.data_entrega)}</p>
          </div>

          <div>
            <p className="text-sm font-semibold text-black">Colaborador</p>
            <p className="text-black">{term.funcionario_nome}</p>
          </div>

          <div>
            <p className="text-sm font-semibold text-black">Matrícula</p>
            <p className="text-black">{term.matricula}</p>
          </div>

          <div>
            <p className="text-sm font-semibold text-black">Função</p>
            <p className="text-black">{term.funcao}</p>
          </div>

          <div>
            <p className="text-sm font-semibold text-black">Supervisor</p>
            <p className="text-black">{term.supervisor}</p>
          </div>

          <div>
            <p className="text-sm font-semibold text-black">Contrato</p>
            <p className="text-black">{term.contrato}</p>
          </div>

          <div>
            <p className="text-sm font-semibold text-black">Centro de custo</p>
            <p className="text-black">{term.centro_custo}</p>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-bold text-black">Dados do equipamento</h2>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-semibold text-black">Tipo do equipamento</p>
              <p className="text-black">{term.tipo_equipamento}</p>
            </div>

            <div>
              <p className="text-sm font-semibold text-black">Patrimônio</p>
              <p className="text-black">{term.patrimonio}</p>
            </div>

            <div>
              <p className="text-sm font-semibold text-black">Marca</p>
              <p className="text-black">{term.marca || '-'}</p>
            </div>

            <div>
              <p className="text-sm font-semibold text-black">Modelo</p>
              <p className="text-black">{term.modelo || '-'}</p>
            </div>

            <div>
              <p className="text-sm font-semibold text-black">Número de série</p>
              <p className="text-black">{term.numero_serie || '-'}</p>
            </div>

            <div>
              <p className="text-sm font-semibold text-black">Estado na entrega</p>
              <p className="text-black">{term.estado_entrega || '-'}</p>
            </div>

            <div className="md:col-span-2">
              <p className="text-sm font-semibold text-black">Acessórios</p>
              <p className="text-black">{term.acessorios || '-'}</p>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-bold text-black">Declaração</h2>

          <div className="mt-4 space-y-4 text-justify text-sm leading-7 text-black">
            <p>
              Declaro, para os devidos fins, que recebi da empresa <strong>{COMPANY_NAME}</strong>
              {' '}o equipamento acima descrito, em condições adequadas de uso, comprometendo-me
              a utilizá-lo exclusivamente para fins profissionais relacionados às minhas atividades.
            </p>

            <p>
              Comprometo-me a zelar pela guarda, conservação, uso correto e devolução do equipamento,
              responsabilizando-me por comunicar imediatamente qualquer defeito, dano, perda,
              extravio ou necessidade de manutenção identificada durante sua utilização.
            </p>

            <p>
              Declaro ainda estar ciente de que o equipamento permanece como patrimônio da empresa,
              devendo ser devolvido sempre que solicitado, em caso de substituição, desligamento,
              transferência de função ou encerramento da necessidade operacional.
            </p>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-bold text-black">Situação atual</h2>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-semibold text-black">Status do termo</p>
              <p className="text-black">{term.status}</p>
            </div>

            <div>
              <p className="text-sm font-semibold text-black">Manutenção</p>
              <p className="text-black">
                {term.em_manutencao ? 'Equipamento em manutenção' : 'Sem manutenção registrada'}
              </p>
            </div>

            {term.em_manutencao ? (
              <div className="md:col-span-2">
                <p className="text-sm font-semibold text-black">Observação da manutenção</p>
                <p className="text-black">{term.observacao_manutencao || '-'}</p>
              </div>
            ) : null}
          </div>
        </section>

        {termReturn ? (
          <section className="mt-8">
            <h2 className="text-lg font-bold text-black">Registro de devolução</h2>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-semibold text-black">Data da devolução</p>
                <p className="text-black">{formatDate(termReturn.data_devolucao)}</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-black">Condição</p>
                <p className="text-black">{conditionLabel(termReturn.condicao)}</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-black">Responsável pelo recebimento</p>
                <p className="text-black">{termReturn.responsavel_recebimento}</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-black">Observações</p>
                <p className="text-black">{termReturn.observacoes || '-'}</p>
              </div>
            </div>
          </section>
        ) : null}

        <section className="mt-12 grid gap-12 md:grid-cols-2">
          <div className="pt-10">
            <div className="border-t border-black pt-2 text-center text-sm text-black">
              Assinatura do colaborador
            </div>
          </div>

          <div className="pt-10">
            <div className="border-t border-black pt-2 text-center text-sm text-black">
              Assinatura do responsável pela entrega
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
