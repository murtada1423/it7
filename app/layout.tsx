import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Vertical Digital Signage',
  description: 'Real-time vertical signage system optimized for 9:16 portrait displays',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-black text-white">
      <body className="antialiased overflow-hidden bg-black">{children}</body>
    </html>
  );
}
