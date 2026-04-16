'use client'

import { jsPDF } from 'jspdf'
import { autoTable } from 'jspdf-autotable'

type AuditRow = {
  data_hora: string
  evento: string
  descricao: string
  numero_termo: string
  funcionario_nome: string
  matricula: string
  equipamento: string
  patrimonio: string
  contrato: string
  centro_custo: string
  supervisor: string
  status: string
  em_manutencao: boolean
}

type Props = {
  rows: AuditRow[]
  filters: {
    inicio?: string
    fim?: string
    tipo_evento?: string
    contratos?: string[]
    centros_custo?: string[]
    supervisor?: string
    status?: string
    manutencao?: string
    q?: string
  }
}

function statusLabel(status: string, em_manutencao: boolean) {
  const base = status === 'DEVOLVIDO' ? 'DEVOLVIDO À SEDE' : status
  return em_manutencao ? `${base} / EM MANUTENÇÃO` : base
}

function buildFilterLines(filters: Props['filters']) {
  const lines: string[] = []

  if (filters.inicio) lines.push(`Data inicial: ${filters.inicio}`)
  if (filters.fim) lines.push(`Data final: ${filters.fim}`)

  if (filters.tipo_evento && filters.tipo_evento !== 'todos') {
    const map: Record<string, string> = {
      TERM_CREATED: 'Termo criado',
      DELIVERY_REGISTERED: 'Entrega registrada',
      MAINTENANCE_ON: 'Entrou em manutenção',
      MAINTENANCE_OFF: 'Saiu de manutenção',
      RETURN_REGISTERED: 'Devolução registrada',
    }
    lines.push(`Tipo de evento: ${map[filters.tipo_evento] ?? filters.tipo_evento}`)
  }

  if (filters.contratos && filters.contratos.length > 0) {
    lines.push(`Contratos: ${filters.contratos.join(' | ')}`)
  }

  if (filters.centros_custo && filters.centros_custo.length > 0) {
    lines.push(`Centros de custo: ${filters.centros_custo.join(' | ')}`)
  }

  if (filters.supervisor && filters.supervisor !== 'todos') {
    lines.push(`Supervisor: ${filters.supervisor}`)
  }

  if (filters.status && filters.status !== 'todos') {
    lines.push(`Status: ${filters.status === 'DEVOLVIDO' ? 'Devolvido à sede' : filters.status}`)
  }

  if (filters.manutencao && filters.manutencao !== 'todos') {
    lines.push(
      `Manutenção: ${
        filters.manutencao === 'em_manutencao' ? 'Em manutenção' : 'Sem manutenção'
      }`
    )
  }

  if (filters.q) {
    lines.push(`Busca: ${filters.q}`)
  }

  return lines
}

export default function ExportAuditoriaPdfButton({ rows, filters }: Props) {
  function handleExport() {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'pt',
      format: 'a4',
    })

    const generatedAt = new Date().toLocaleString('pt-BR')
    const filterLines = buildFilterLines(filters)

    doc.setFontSize(18)
    doc.text('Relatório de Auditoria Operacional', 40, 40)

    doc.setFontSize(10)
    doc.text(`Gerado em: ${generatedAt}`, 40, 60)
    doc.text(`Total de eventos: ${rows.length}`, 40, 75)

    let currentY = 95

    if (filterLines.length > 0) {
      doc.setFontSize(11)
      doc.text('Filtros aplicados:', 40, currentY)
      currentY += 16

      doc.setFontSize(9)
      filterLines.forEach((line) => {
        doc.text(`- ${line}`, 48, currentY)
        currentY += 13
      })

      currentY += 6
    }

    autoTable(doc, {
      startY: currentY,
      head: [[
        'Data/Hora',
        'Evento',
        'Termo',
        'Funcionário',
        'Equipamento',
        'Patrimônio',
        'Contrato',
        'CC',
        'Supervisor',
        'Situação',
      ]],
      body: rows.map((row) => [
        row.data_hora,
        row.evento,
        row.numero_termo,
        `${row.funcionario_nome} / ${row.matricula}`,
        row.equipamento,
        row.patrimonio,
        row.contrato,
        row.centro_custo,
        row.supervisor,
        statusLabel(row.status, row.em_manutencao),
      ]),
      styles: {
        fontSize: 7,
        cellPadding: 4,
        overflow: 'linebreak',
      },
      headStyles: {
        fillColor: [22, 163, 74],
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      margin: { left: 32, right: 32 },
    })

    const fileDate = new Date().toISOString().slice(0, 10)
    doc.save(`auditoria-operacional-${fileDate}.pdf`)
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={rows.length === 0}
      className="rounded-xl border border-green-200 bg-white px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-50"
    >
      Gerar PDF
    </button>
  )
}
