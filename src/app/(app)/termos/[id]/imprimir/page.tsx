import Link from 'next/link'
import { getTermById } from '@/lib/terms-supabase'
import PrintButton from './print-button'

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
      <main className="min-h-screen bg-green-50 px-6 py-10">
        <div className="mx-auto max-w-4xl rounded-3xl border border-amber-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-amber-700">Rascunho não pode ser impresso</h1>
          <p className="mt-3 text-slate-700">
            Este termo ainda está em modo rascunho. Edite e finalize primeiro para liberar a impressão oficial.
          </p>

          <div className="mt-6 flex gap-3">
            <Link
              href="/termos"
              className="rounded-xl border border-green-200 bg-white px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-50"
            >
              Voltar para termos
            </Link>

            <Link
              href={`/termos/${term.id}/editar`}
              className="rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
            >
              Editar rascunho
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white px-6 py-8 text-black">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between print:hidden">
          <Link
            href={`/termos/${term.id}`}
            className="rounded-xl border border-green-200 bg-white px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-50"
          >
            Voltar
          </Link>

          <PrintButton />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm print:shadow-none print:border-none">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold">TERMO DE RESPONSABILIDADE DE EQUIPAMENTO</h1>
            <p className="mt-2 text-sm">Demax Serviços e Comércio LTDA</p>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-b border-slate-300 py-4 text-sm">
            <div>
              <div className="font-semibold">Número do termo</div>
              <div>{term.numero_termo}</div>
            </div>
            <div>
              <div className="font-semibold">Data da entrega</div>
              <div>{formatDate(term.data_entrega)}</div>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="mb-3 text-lg font-bold">Dados do colaborador</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-semibold">Colaborador</div>
                <div>{term.funcionario_nome}</div>
              </div>
              <div>
                <div className="font-semibold">CPF</div>
                <div>{formatCpf(term.cpf)}</div>
              </div>
              <div>
                <div className="font-semibold">Matrícula</div>
                <div>{term.matricula}</div>
              </div>
              <div>
                <div className="font-semibold">Função</div>
                <div>{term.funcao}</div>
              </div>
              <div>
                <div className="font-semibold">Supervisor</div>
                <div>{term.supervisor}</div>
              </div>
              <div>
                <div className="font-semibold">Centro de custo</div>
                <div>{term.centro_custo}</div>
              </div>
              <div className="col-span-2">
                <div className="font-semibold">Contrato</div>
                <div>{term.contrato}</div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="mb-3 text-lg font-bold">Dados do equipamento</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-semibold">Tipo do equipamento</div>
                <div>{term.tipo_equipamento}</div>
              </div>
              <div>
                <div className="font-semibold">Patrimônio</div>
                <div>{term.patrimonio}</div>
              </div>
              <div>
                <div className="font-semibold">Marca / Modelo</div>
                <div>
                  {term.marca || '-'} / {term.modelo || '-'}
                </div>
              </div>
              <div>
                <div className="font-semibold">Número de série</div>
                <div>{term.numero_serie || '-'}</div>
              </div>
              <div>
                <div className="font-semibold">Estado na entrega</div>
                <div>{term.estado_entrega || '-'}</div>
              </div>
              <div>
                <div className="font-semibold">Acessórios</div>
                <div>{term.acessorios || '-'}</div>
              </div>
              <div className="col-span-2">
                <div className="font-semibold">Observações</div>
                <div>{term.observacoes || '-'}</div>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-4 text-sm leading-6">
            <h2 className="text-lg font-bold">DECLARAÇÃO E CONDIÇÕES DE RESPONSABILIDADE</h2>

            <p>
              Pelo presente instrumento, a <strong>DEMAX Serviços e Comércio LTDA</strong>,
              doravante denominada <strong>EMPRESA</strong>, entrega ao colaborador acima
              identificado o equipamento descrito neste termo, para uso exclusivo no exercício
              de suas atividades profissionais.
            </p>

            <div>
              <p><strong>1. Objeto</strong></p>
              <p>
                O presente termo tem por finalidade formalizar a entrega do equipamento ao
                colaborador, que declara recebê-lo em condições adequadas de uso,
                responsabilizando-se por sua guarda, conservação e utilização correta durante
                o período em que permanecer sob sua posse ou responsabilidade.
              </p>
            </div>

            <div>
              <p><strong>2. Condições de uso</strong></p>
              <p>O colaborador compromete-se a:</p>
              <p>a) utilizar o bem exclusivamente para fins profissionais relacionados às suas atividades na EMPRESA;</p>
              <p>b) zelar por sua conservação, segurança e uso adequado;</p>
              <p>c) não emprestar, ceder, transferir ou permitir o uso por terceiros sem autorização da EMPRESA;</p>
              <p>d) comunicar imediatamente à EMPRESA qualquer dano, defeito, perda, extravio, furto, roubo ou necessidade de manutenção.</p>
            </div>

            <div>
              <p><strong>3. Responsabilidade</strong></p>
              <p>
                O colaborador será responsável pelos danos causados ao equipamento quando
                comprovado uso inadequado, negligência, imprudência, imperícia ou dolo,
                sem prejuízo das apurações internas cabíveis.
              </p>
            </div>

            <div>
              <p><strong>4. Manutenção e despesas</strong></p>
              <p>Compete à EMPRESA, quando aplicável ao bem entregue:</p>
              <p>a) providenciar a manutenção preventiva e corretiva;</p>
              <p>b) arcar com taxas, licenças e demais encargos vinculados ao bem;</p>
              <p>c) custear despesas operacionais autorizadas, quando aplicável.</p>
            </div>

            <div>
              <p><strong>5. Sinistros</strong></p>
              <p>
                Na ocorrência de acidente, furto, roubo, perda ou qualquer outro sinistro
                envolvendo o bem, o colaborador obriga-se a:
              </p>
              <p>a) comunicar imediatamente a EMPRESA;</p>
              <p>b) adotar as providências cabíveis, inclusive registro de boletim de ocorrência, quando necessário;</p>
              <p>c) fornecer todas as informações e documentos necessários para apuração dos fatos.</p>
            </div>

            <div>
              <p><strong>6. Devolução</strong></p>
              <p>
                O equipamento deverá ser devolvido pelo colaborador, nas mesmas condições em
                que recebido, ressalvado o desgaste natural do uso regular, sempre que:
              </p>
              <p>a) for solicitado pela EMPRESA;</p>
              <p>b) houver substituição do bem;</p>
              <p>c) ocorrer desligamento do colaborador;</p>
              <p>d) houver transferência de função ou cessação da necessidade operacional.</p>
            </div>

            <div>
              <p><strong>7. Descontos</strong></p>
              <p>
                Eventuais prejuízos causados ao bem, quando decorrentes de dolo ou culpa do
                colaborador e devidamente apurados, poderão ser objeto de desconto em folha,
                observados os limites e requisitos legais aplicáveis, inclusive o disposto no
                art. 462 da CLT.
              </p>
            </div>

            <div>
              <p><strong>8. Disposições finais</strong></p>
              <p>
                O equipamento permanece, em qualquer hipótese, como patrimônio exclusivo da EMPRESA.
              </p>
              <p>
                Fica eleito o foro da Comarca de Mogi das Cruzes/SP para resolução de eventuais
                conflitos oriundos deste termo.
              </p>
              <p>
                O colaborador declara estar ciente de todas as condições acima,
                comprometendo-se a cumpri-las integralmente.
              </p>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-10 text-sm">
            <div className="pt-10 text-center">
              <div className="border-t border-slate-400 pt-2">
                Assinatura do colaborador
              </div>
            </div>

            <div className="pt-10 text-center">
              <div className="border-t border-slate-400 pt-2">
                Assinatura do responsável pela entrega
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
