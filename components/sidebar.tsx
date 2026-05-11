'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  LayoutDashboard,
  Bot,
  CalendarClock,
  Coins,
  Inbox,
  Network,
  HeartPulse,
  Calendar,
  GitCompare,
  BookOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const TIER1 = [
  { href: '/',          label: '상황판',    icon: LayoutDashboard },
  { href: '/bots',      label: '봇 목록',   icon: Bot },
  { href: '/schedules', label: '스케줄',    icon: CalendarClock },
  { href: '/budget',    label: '비용',      icon: Coins },
  { href: '/queue',     label: '발행 큐',   icon: Inbox },
] as const;

const TIER2 = [
  { href: '/graph',    label: '봇 그래프',     icon: Network },
  { href: '/health',   label: '헬스체크',      icon: HeartPulse },
  { href: '/calendar', label: '캘린더',        icon: Calendar },
  { href: '/compare',  label: '봇 비교 (A/B)', icon: GitCompare },
  { href: '/catalog',  label: '카탈로그',      icon: BookOpen },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  // 경로 변경 시 모바일 메뉴 자동 닫기
  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <>
      {/* 모바일 햄버거 버튼 */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="메뉴 열기"
        className="fixed left-3 top-3 z-50 flex h-11 w-11 items-center justify-center rounded-md border border-zinc-200 bg-white shadow-sm md:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* 모바일 백드롭 */}
      {open && (
        <div
          onClick={close}
          aria-hidden="true"
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-zinc-200 bg-white transition-transform duration-200 md:static md:z-0 md:h-screen md:w-60 md:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-zinc-200 px-4">
          <Link href="/" onClick={close} className="text-base font-semibold tracking-tight">
            StockRank BotConsole
          </Link>
          <button
            type="button"
            onClick={close}
            aria-label="메뉴 닫기"
            className="flex h-9 w-9 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-100 md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-3">
          <SidebarSection title="Tier 1" items={TIER1} pathname={pathname} onNavigate={close} />
          <SidebarSection title="Tier 2 (골격)" items={TIER2} pathname={pathname} onNavigate={close} muted />
          <p className="mt-6 px-3 text-[10px] uppercase tracking-wider text-zinc-400">Tier 3 (스키마만)</p>
          <p className="px-3 pt-1 text-xs text-zinc-400">자가진화 / 인사이트 그래프 / SLO Burn-down — Stage 3+</p>
        </nav>
        <div className="border-t border-zinc-200 p-3 text-[11px] text-zinc-500">
          헌법 v1.1 / Phase 0
        </div>
      </aside>
    </>
  );
}

function SidebarSection({
  title,
  items,
  pathname,
  onNavigate,
  muted = false,
}: {
  title: string;
  items: ReadonlyArray<{ href: string; label: string; icon: typeof LayoutDashboard }>;
  pathname: string;
  onNavigate: () => void;
  muted?: boolean;
}) {
  return (
    <div className="mb-2">
      <p className="px-3 pb-1 pt-2 text-[10px] uppercase tracking-wider text-zinc-400">{title}</p>
      <ul className="flex flex-col gap-0.5">
        {items.map((it) => {
          const active = pathname === it.href || (it.href !== '/' && pathname.startsWith(it.href));
          const Icon = it.icon;
          return (
            <li key={it.href}>
              <Link
                href={it.href}
                onClick={onNavigate}
                className={cn(
                  'flex min-h-[44px] items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
                  active
                    ? 'bg-zinc-900 text-white'
                    : muted
                    ? 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900'
                    : 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900',
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span>{it.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
