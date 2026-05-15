import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer'

// Usa fonte padrão Helvetica — sem necessidade de carregar arquivos externos
const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    paddingTop: 40,
    paddingBottom: 50,
    paddingHorizontal: 50,
    color: '#1e293b',
  },

  // Cabeçalho
  headerCompany: {
    fontSize: 8,
    fontFamily: 'Helvetica',
    color: '#94a3b8',
    textAlign: 'center',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#0f172a',
    marginBottom: 6,
  },
  headerMeta: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    fontSize: 9,
    color: '#475569',
    marginBottom: 2,
  },
  headerDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#cbd5e1',
    marginTop: 10,
    marginBottom: 16,
  },

  // Seções
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    color: '#64748b',
    borderBottomWidth: 0.5,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 3,
    marginBottom: 8,
  },

  // Grid de dados
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridItem: {
    width: '50%',
    marginBottom: 5,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridItemFull: {
    width: '100%',
    marginBottom: 5,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  label: {
    fontFamily: 'Helvetica-Bold',
    color: '#475569',
    fontSize: 9,
  },
  value: {
    color: '#0f172a',
    fontSize: 9,
  },

  // Cláusulas
  clausulaTitle: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    color: '#64748b',
    borderBottomWidth: 0.5,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 3,
    marginBottom: 8,
  },
  clausulaIntro: {
    fontSize: 9.5,
    lineHeight: 1.55,
    color: '#334155',
    marginBottom: 6,
  },
  clausula: {
    fontSize: 9.5,
    lineHeight: 1.55,
    color: '#334155',
    marginBottom: 5,
  },
  clausulaBold: {
    fontFamily: 'Helvetica-Bold',
  },

  // Assinaturas
  signaturesSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 36,
  },
  signatureBox: {
    width: '44%',
    alignItems: 'center',
  },
  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: '#94a3b8',
    width: '100%',
    marginBottom: 5,
    marginTop: 4,
  },
  signatureDate: {
    fontSize: 8,
    color: '#94a3b8',
    marginBottom: 20,
  },
  signatureName: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#334155',
    textAlign: 'center',
  },
  signatureRole: {
    fontSize: 8,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 2,
  },
})

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function TermoPDF({ term }: { term: any }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* Cabeçalho */}
        <Text style={styles.headerCompany}>Demax Serviços e Comércio LTDA</Text>
        <Text style={styles.headerTitle}>Termo de Responsabilidade de Equipamento</Text>
        <View style={styles.headerMeta}>
          <Text><Text style={styles.clausulaBold}>Nº: </Text>{term.numero_termo}</Text>
          <Text><Text style={styles.clausulaBold}>Data: </Text>{formatDate(term.data_entrega)}</Text>
        </View>
        <View style={styles.headerDivider} />

        {/* Dados do colaborador */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dados do Colaborador</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Colaborador: </Text>
              <Text style={styles.value}>{term.funcionario_nome}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>CPF: </Text>
              <Text style={styles.value}>{formatCpf(term.cpf)}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Matrícula: </Text>
              <Text style={styles.value}>{term.matricula}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Função: </Text>
              <Text style={styles.value}>{term.funcao}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Supervisor: </Text>
              <Text style={styles.value}>{term.supervisor}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Centro de custo: </Text>
              <Text style={styles.value}>{term.centro_custo}</Text>
            </View>
            <View style={styles.gridItemFull}>
              <Text style={styles.label}>Contrato: </Text>
              <Text style={styles.value}>{term.contrato}</Text>
            </View>
          </View>
        </View>

        {/* Dados do equipamento */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dados do Equipamento</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Tipo: </Text>
              <Text style={styles.value}>{term.tipo_equipamento}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Patrimônio: </Text>
              <Text style={styles.value}>{term.patrimonio}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Marca / Modelo: </Text>
              <Text style={styles.value}>{term.marca || '-'} / {term.modelo || '-'}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Nº de série: </Text>
              <Text style={styles.value}>{term.numero_serie || '-'}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Estado na entrega: </Text>
              <Text style={styles.value}>{term.estado_entrega || '-'}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Acessórios: </Text>
              <Text style={styles.value}>{term.acessorios || '-'}</Text>
            </View>
            {term.observacoes && (
              <View style={styles.gridItemFull}>
                <Text style={styles.label}>Observações: </Text>
                <Text style={styles.value}>{term.observacoes}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Cláusulas */}
        <View>
          <Text style={styles.clausulaTitle}>Declaração e Condições de Responsabilidade</Text>
          <Text style={styles.clausulaIntro}>
            Pelo presente instrumento, a <Text style={styles.clausulaBold}>DEMAX Serviços e Comércio LTDA</Text>, doravante denominada <Text style={styles.clausulaBold}>EMPRESA</Text>, entrega ao colaborador acima identificado o equipamento descrito neste termo, para uso exclusivo no exercício de suas atividades profissionais.
          </Text>
          <Text style={styles.clausula}><Text style={styles.clausulaBold}>1. Objeto</Text> — O presente termo formaliza a entrega do equipamento ao colaborador, que declara recebê-lo em condições adequadas de uso, responsabilizando-se por sua guarda, conservação e utilização correta.</Text>
          <Text style={styles.clausula}><Text style={styles.clausulaBold}>2. Condições de uso</Text> — O colaborador compromete-se a: (a) utilizar o bem exclusivamente para fins profissionais; (b) zelar por sua conservação e segurança; (c) não emprestar ou ceder a terceiros sem autorização; (d) comunicar imediatamente qualquer dano, perda ou necessidade de manutenção.</Text>
          <Text style={styles.clausula}><Text style={styles.clausulaBold}>3. Responsabilidade</Text> — O colaborador será responsável pelos danos causados quando comprovado uso inadequado, negligência, imprudência, imperícia ou dolo.</Text>
          <Text style={styles.clausula}><Text style={styles.clausulaBold}>4. Manutenção</Text> — Compete à EMPRESA providenciar manutenção preventiva e corretiva, arcar com taxas e licenças vinculadas ao bem.</Text>
          <Text style={styles.clausula}><Text style={styles.clausulaBold}>5. Sinistros</Text> — Na ocorrência de acidente, furto ou perda, o colaborador obriga-se a comunicar imediatamente a EMPRESA e adotar as providências cabíveis, inclusive registro de boletim de ocorrência quando necessário.</Text>
          <Text style={styles.clausula}><Text style={styles.clausulaBold}>6. Devolução</Text> — O equipamento deverá ser devolvido nas mesmas condições em que recebido, ressalvado o desgaste natural, sempre que solicitado pela EMPRESA, na substituição do bem, no desligamento ou na transferência de função.</Text>
          <Text style={styles.clausula}><Text style={styles.clausulaBold}>7. Descontos</Text> — Eventuais prejuízos causados por dolo ou culpa do colaborador poderão ser objeto de desconto em folha, observados os limites legais, inclusive o art. 462 da CLT.</Text>
          <Text style={styles.clausula}><Text style={styles.clausulaBold}>8. Disposições finais</Text> — O equipamento permanece como patrimônio exclusivo da EMPRESA. Fica eleito o foro da Comarca de Mogi das Cruzes/SP. O colaborador declara estar ciente de todas as condições acima, comprometendo-se a cumpri-las integralmente.</Text>
        </View>

        {/* Assinaturas */}
        <View style={styles.signaturesSection}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureDate}>Mogi das Cruzes, {formatDate(term.data_entrega)}</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureName}>{term.funcionario_nome}</Text>
            <Text style={styles.signatureRole}>Colaborador — Mat. {term.matricula}</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureDate}> </Text>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureName}>{term.supervisor}</Text>
            <Text style={styles.signatureRole}>Responsável pela entrega</Text>
          </View>
        </View>

      </Page>
    </Document>
  )
}
