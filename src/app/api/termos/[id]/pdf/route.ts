import { NextRequest, NextResponse } from 'next/server'
import { getTermById } from '@/lib/terms-supabase'
import { renderToBuffer } from '@react-pdf/renderer'
import { TermoPDF } from '@/components/termo-pdf'
import React from 'react'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { term } = await getTermById(id)

  if (term.is_draft) {
    return NextResponse.json({ error: 'Rascunho não pode ser exportado.' }, { status: 400 })
  }

  const buffer = await renderToBuffer(React.createElement(TermoPDF, { term }))

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="termo-${term.numero_termo}.pdf"`,
    },
  })
}
