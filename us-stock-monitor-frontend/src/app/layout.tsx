import type { Metadata } from 'next';
import localFont from 'next/font/local';

import { Sidebar } from '@/components/layout/Sidebar';

import './globals.css';

const inter = localFont({
  src: '../fonts/InterVariable.woff2',
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'US Stock Monitor · 美股事件监控',
  description: '美股市场事件监控与趋势分析',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${inter.className} bg-gray-950 text-gray-100`}>
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex min-h-screen flex-1 flex-col pt-14 lg:pl-[260px] lg:pt-0">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
