'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
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
  return (
    <aside className="flex h-screen w-60 flex-col border-r border-zinc-200 bg-white">
      <div className="flex h-14 items-center border-b border-zinc-200 px-4">
        <span className="text-base font-semibold tracking-tight">StockRank BotConsole</span>
      </div>
      <nav className="flex-1 overflow-y-auto p-3">
        <SidebarSection title="Tier 1" items={TIER1} pathname={pathname} />
        <SidebarSection title="Tier 2 (골격)" items={TIER2} pathname={pathname} muted />
        <p className="mt-6 px-3 text-[10px] uppercase tracking-wider text-zinc-400">Tier 3 (스키마만)</p>
        <p className="px-3 pt-1 text-xs text-zinc-400">자가진화 / 인사이트 그래프 / SLO Burn-down — Stage 3+</p>
      </nav>
      <div className="border-t border-zinc-200 p-3 text-[11px] text-zinc-500">
        헌법 v1.1 / Phase 0
      </div>
    </aside>
  );
}

function SidebarSection({
  title,
  items,
  pathname,
  muted = false,
}: {
  title: string;
  items: ReadonlyArray<{ href: string; label: string; icon: typeof LayoutDashboard }>;
  pathname: string;
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
                className={cn(
                  'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
                  active
                    ? 'bg-zinc-900 text-white'
                    : muted
                    ? 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900'
                    : 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900',
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{it.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
