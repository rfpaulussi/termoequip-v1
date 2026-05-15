export default function ImprimirLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`
        @page {
          size: A4 portrait;
          margin: 15mm 15mm 15mm 15mm;
        }

        @media print {
          * {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          body {
            background: white !important;
          }

          .print-avoid-break {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          .print-keep-together {
            break-inside: avoid;
            page-break-inside: avoid;
            break-before: auto;
          }

          /* Remove URL e título do browser no rodapé/cabeçalho */
          @page {
            margin-top: 15mm;
            margin-bottom: 15mm;
          }
        }
      `}</style>
      <div className="min-h-screen bg-slate-100 print:bg-white">
        {children}
      </div>
    </>
  )
}
