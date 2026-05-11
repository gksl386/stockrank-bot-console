'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ArrowRight, Bot as BotIcon, Coins, LayoutDashboard, Inbox, Network, HeartPulse, Calendar, GitCompare, BookOpen, Play } from 'lucide-react';
import { apiListBots, apiTriggerRun } from '@/lib/api';
import type { BotMeta } from '@/types/api';
import { Dialog } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

type Cmd =
  | { kind: 'nav'; label: string; href: string; icon: typeof Search }
  | { kind: 'bot'; label: string; bot_id: string; icon: typeof Search }
  | { kind: 'action'; label: string; run: () => Promise<void> | void; icon: typeof Search };

const STATIC_NAV: Cmd[] = [
  { kind: 'nav', label: '상황판',     href: '/',         icon: LayoutDashboard },
  { kind: 'nav', label: '비용',       href: '/budget',   icon: Coins },
  { kind: 'nav', label: '발행 큐',    href: '/queue',    icon: Inbox },
  { kind: 'nav', label: '봇 그래프',  href: '/graph',    icon: Network },
  { kind: 'nav', label: '헬스체크',   href: '/health',   icon: HeartPulse },
  { kind: 'nav', label: '캘린더',     href: '/calendar', icon: Calendar },
  { kind: 'nav', label: '봇 비교',    href: '/compare',  icon: GitCompare },
  { kind: 'nav', label: '카탈로그',   href: '/catalog',  icon: BookOpen },
];

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [bots, setBots] = useState<BotMeta[]>([]);
  const [highlight, setHighlight] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setHighlight(0);
      return;
    }
    inputRef.current?.focus();
    apiListBots()
      .then((r) => setBots(r.items))
      .catch(() => setBots([]));
  }, [open]);

  const items: Cmd[] = useMemo(() => {
    const navCmds = STATIC_NAV;
    const botNavCmds: Cmd[] = bots.map((b) => ({ kind: 'bot' as const, label: `봇 → ${b.bot_name} (${b.bot_id})`, bot_id: b.bot_id, icon: BotIcon }));
    const actionCmds: Cmd[] = bots
      .filter((b) => b.enabled)
      .map((b) => ({
        kind: 'action' as const,
        label: `mock 실행: ${b.bot_id}`,
        icon: Play,
        run: async () => {
          await apiTriggerRun(b.bot_id, { mode: 'mock', triggered_by: 'manual' });
          router.push(`/bots/${encodeURIComponent(b.bot_id)}`);
        },
      }));
    const all = [...navCmds, ...botNavCmds, ...actionCmds];
    if (!query.trim()) return all;
    const q = query.toLowerCase();
    return all.filter((c) => c.label.toLowerCase().includes(q));
  }, [bots, query, router]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlight((h) => Math.min(items.length - 1, h + 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlight((h) => Math.max(0, h - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const c = items[highlight];
        if (c) execute(c);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, items, highlight]);

  async function execute(c: Cmd) {
    onClose();
    if (c.kind === 'nav') router.push(c.href);
    else if (c.kind === 'bot') router.push(`/bots/${encodeURIComponent(c.bot_id)}`);
    else if (c.kind === 'action') await c.run();
  }

  return (
    <Dialog open={open} onClose={onClose} className="max-w-xl p-0">
      <div className="flex items-center gap-2 border-b border-zinc-200 px-4 py-3">
        <Search className="h-4 w-4 text-zinc-400" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setHighlight(0);
          }}
          placeholder="페이지 이동 / 봇 검색 / mock 실행…"
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-zinc-400"
        />
        <kbd className="rounded border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 text-[10px] text-zinc-500">ESC</kbd>
      </div>
      <ul className="max-h-80 overflow-y-auto p-2 text-sm">
        {items.length === 0 && <li className="px-3 py-6 text-center text-xs text-zinc-500">매칭 없음</li>}
        {items.map((c, i) => {
          const Icon = c.icon;
          return (
            <li key={`${c.kind}:${c.label}:${i}`}>
              <button
                type="button"
                onMouseEnter={() => setHighlight(i)}
                onClick={() => execute(c)}
                className={cn(
                  'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left',
                  highlight === i ? 'bg-zinc-100' : 'hover:bg-zinc-50',
                )}
              >
                <Icon className="h-4 w-4 text-zinc-500" />
                <span className="flex-1 truncate">{c.label}</span>
                <ArrowRight className="h-3 w-3 text-zinc-400" />
              </button>
            </li>
          );
        })}
      </ul>
    </Dialog>
  );
}
