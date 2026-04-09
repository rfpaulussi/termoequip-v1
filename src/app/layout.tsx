import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TermoEquip",
  description:
    "Aplicativo web para geração, controle, impressão e histórico de Termos de Responsabilidade de Equipamentos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-green-50 text-slate-900">
        <div className="min-h-screen flex flex-col">
          <header className="print:hidden border-b border-green-100 bg-white/95 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
              <Link href="/" className="text-2xl font-bold text-green-800">
                TermoEquip
              </Link>

              <nav className="flex flex-wrap items-center gap-2">
                <Link
                  href="/"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-green-50 hover:text-green-800"
                >
                  Início
                </Link>
                <Link
                  href="/login"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-green-50 hover:text-green-800"
                >
                  Login
                </Link>
                <Link
                  href="/dashboard"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-green-50 hover:text-green-800"
                >
                  Dashboard
                </Link>
                <Link
                  href="/termos"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-green-50 hover:text-green-800"
                >
                  Termos
                </Link>
                <Link
                  href="/termos/novo"
                  className="rounded-xl bg-green-700 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-800"
                >
                  Novo termo
                </Link>
              </nav>
            </div>
          </header>

          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}