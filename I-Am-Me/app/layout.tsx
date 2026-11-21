import type { Metadata, Viewport } from 'next';
import { Fraunces, Instrument_Sans } from 'next/font/google';
import { site } from '@/site.config';
import './globals.css';

const display = Fraunces({ subsets: ['latin'], axes: ['SOFT', 'WONK', 'opsz'], variable: '--font-display', display: 'swap' });
const body = Instrument_Sans({ subsets: ['latin'], variable: '--font-body', display: 'swap' });

export const metadata: Metadata = {
  title: `${site.user} | Código bonito. Intenciones serias.`,
  description: `Proyectos públicos de ${site.user} en GitHub, ordenados y siempre al día.`,
};

export const viewport: Viewport = { themeColor: '#F7F0FB' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
