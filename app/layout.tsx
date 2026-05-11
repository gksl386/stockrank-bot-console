import type { Metadata, Viewport } from 'next';
import { Sidebar } from '@/components/sidebar';
import { CmdKProvider } from '@/components/cmd-k-provider';
import { ServiceWorkerRegister } from '@/components/sw-register';
import './globals.css';

export const metadata: Metadata = {
  title: 'StockRank BotConsole',
  description: '봇 군단 사령탑 — 헌법 v1.1 / Phase 0',
  manifest: '/manifest.webmanifest',
};

export const viewport: Viewport = {
  themeColor: '#18181b',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="antialiased">
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 overflow-x-hidden">
            <div className="flex h-14 items-center justify-between border-b border-zinc-200 bg-white pl-16 pr-4 md:px-6">
              <div className="hidden text-sm text-zinc-500 md:block">
                Tier 1 완성 / Tier 2 골격 / Tier 3 스키마
              </div>
              <div className="text-sm font-medium text-zinc-700 md:hidden">BotConsole</div>
              <kbd className="hidden rounded border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs text-zinc-500 sm:inline-block">
                ⌘K · Ctrl+K
              </kbd>
            </div>
            <div className="p-4 md:p-6">{children}</div>
          </main>
        </div>
        <CmdKProvider />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
