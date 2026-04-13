'use client'

type PrintButtonProps = {
  className?: string
}

export default function PrintButton({ className }: PrintButtonProps) {
  function handlePrint() {
    window.print()
  }

  return (
    <button
      type="button"
      onClick={handlePrint}
      className={
        className ??
        'rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700'
      }
    >
      Imprimir
    </button>
  )
}
