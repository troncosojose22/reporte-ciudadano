import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Reporte Ciudadano",
  description: "Reporta y busca personas desaparecidas en Venezuela. Cada reporte puede salvar una vida.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🇻🇪</text></svg>",
  },
  openGraph: {
    title: "Reporte Ciudadano",
    description: "Reporta y busca personas desaparecidas en Venezuela.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${geist.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <header className="border-b border-gray-200 sticky top-0 z-50 bg-white">
          <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
            <Link href="/" className="font-semibold text-sm tracking-tight text-gray-900 hover:text-red-700 transition-colors">
              Reporte Ciudadano
            </Link>
            <Link
              href="/reportar"
              className="bg-red-700 hover:bg-red-800 text-white text-sm font-medium px-4 py-1.5 rounded transition-colors"
            >
              Reportar
            </Link>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-gray-200 py-6 mt-12">
          <div className="max-w-5xl mx-auto px-4 text-center text-xs text-gray-400 space-y-1">
            <p>Si encontraste a alguien, puedes contactar al familiar a través del caso.</p>
            <p>
              Los reportes son publicados directamente. Para remover un caso incorrecto, escríbenos{' '}
              <a href="mailto:troncosojose22@gmail.com" className="underline hover:text-gray-600 transition-colors">
                aquí
              </a>.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
