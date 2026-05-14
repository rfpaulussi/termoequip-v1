'use client'

import { jsPDF } from 'jspdf'
import { autoTable } from 'jspdf-autotable'
import { formatDisplayLabel } from '@/lib/format-display'

type PdfTerm = {
  numero_termo: string
  funcionario_nome: string
  matricula: string
  tipo_equipamento: string
  patrimonio: string
  supervisor: string
  contrato: string
  centro_custo: string
  status: string
  em_manutencao: boolean
  data_entrega: string
  is_draft?: boolean
}

type Props = {
  terms: PdfTerm[]
  filters: {
    q?: string
    status?: string
    manutencao?: string
    contrato?: string
    centro_custo?: string
    supervisor?: string
  }
}

function formatDate(value: string) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('pt-BR')
}

function formatStatus(term: PdfTerm) {
  if (term.is_draft) return 'RASCUNHO'
  const base = term.status === 'DEVOLVIDO' ? 'DEVOLVIDO À SEDE' : term.status
  return term.em_manutencao ? `${base} / EM MANUTENÇÃO` : base
}

function buildFilterLines(filters: Props['filters']) {
  const lines: string[] = []

  if (filters.q) lines.push(`Busca: ${filters.q}`)
  if (filters.status && filters.status !== 'todos') {
    lines.push(
      `Status: ${filters.status === 'DEVOLVIDO' ? 'Devolvido à sede' : filters.status}`
    )
  }
  if (filters.manutencao && filters.manutencao !== 'todos') {
    lines.push(
      `Manutenção: ${
        filters.manutencao === 'em_manutencao'
          ? 'Em manutenção'
          : 'Sem manutenção'
      }`
    )
  }
  if (filters.contrato && filters.contrato !== 'todos') {
    lines.push(`Contrato: ${formatDisplayLabel(filters.contrato)}`)
  }
  if (filters.centro_custo && filters.centro_custo !== 'todos') {
    lines.push(`Centro de custo: ${filters.centro_custo}`)
  }
  if (filters.supervisor && filters.supervisor !== 'todos') {
    lines.push(`Supervisor: ${filters.supervisor}`)
  }

  return lines
}

export default function ExportPdfButton({ terms, filters }: Props) {
  function handleExport() {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'pt',
      format: 'a4',
    })

    const generatedAt = new Date().toLocaleString('pt-BR')
    const filterLines = buildFilterLines(filters)

    doc.setFontSize(18)
    doc.text('Relatório de Termos Filtrados', 40, 40)

    doc.setFontSize(10)
    doc.text(`Gerado em: ${generatedAt}`, 40, 60)
    doc.text(`Total de registros: ${terms.length}`, 40, 75)

    let currentY = 95

    if (filterLines.length > 0) {
      doc.setFontSize(11)
      doc.text('Filtros aplicados:', 40, currentY)
      currentY += 16

      doc.setFontSize(10)
      filterLines.forEach((line) => {
        doc.text(`- ${line}`, 48, currentY)
        currentY += 14
      })

      currentY += 6
    }

    autoTable(doc, {
      startY: currentY,
      head: [[
        'Nº Termo',
        'Funcionário',
        'Matrícula',
        'Equipamento',
        'Patrimônio',
        'Supervisor',
        'Contrato',
        'CC',
        'Status',
        'Entrega',
      ]],
      body: terms.map((term) => [
        term.numero_termo,
        term.funcionario_nome,
        term.matricula,
        term.tipo_equipamento,
        term.patrimonio,
        term.supervisor,
        formatDisplayLabel(term.contrato),
        term.centro_custo,
        formatStatus(term),
        formatDate(term.data_entrega),
      ]),
      styles: {
        fontSize: 8,
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
      margin: { left: 40, right: 40 },
    })

    const fileDate = new Date().toISOString().slice(0, 10)
    doc.save(`relatorio-termos-${fileDate}.pdf`)
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={terms.length === 0}
      className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      Gerar PDF
    </button>
  )
}
