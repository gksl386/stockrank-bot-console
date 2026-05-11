import Link from 'next/link';
import { apiStats, apiListBots, apiHealth } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { formatUsd, formatRelative } from '@/lib/utils';
import type { StatsResponse, BotMeta, HealthResponse } from '@/types/api';

export const dynamic = 'force-dynamic';

const PHASES = [0, 1, 2, 3, 4, 5] as const;

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ phase?: string }> }) {
  const sp = await searchParams;
  const phaseFilter = sp.phase ? Number(sp.phase) : null;

  const [stats, bots, health] = await Promise.all([
    apiStats().catch(() => null),
    apiListBots().catch(() => ({ items: [] as BotMeta[], count: 0 })),
    apiHealth().catch(() => null),
  ]);

  const filtered = phaseFilter === null ? bots.items : bots.items.filter((b) => b.phase === phaseFilter);

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">상황판</h1>
          <p className="mt-1 text-sm text-zinc-500">BotConsole Tier 1 #1 — 5초 한판 조망</p>
        </div>
        <HealthIndicator health={health} />
      </header>

      <StatsCards stats={stats} />

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">봇 목록 ({bots.count})</h2>
          <PhaseTabs current={phaseFilter} />
        </div>
        <BotsTable items={filtered} backendDown={!stats && bots.count === 0} />
      </section>
    </div>
  );
}

function HealthIndicator({ health }: { health: HealthResponse | null }) {
  if (!health) {
    return (
      <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700">
        백엔드 연결 X
      </Badge>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <Badge variant="outline" className={health.status === 'ok' ? 'border-green-200 bg-green-50 text-green-700' : 'border-amber-200 bg-amber-50 text-amber-700'}>
        {health.status}
      </Badge>
      <span className="text-xs text-zinc-500">
        Supabase {health.supabase_health ? 'OK' : 'down'} · Langfuse {health.langfuse_enabled ? 'on' : 'off'}
      </span>
    </div>
  );
}

function StatsCards({ stats }: { stats: StatsResponse | null }) {
  const cards = [
    { label: '총 봇', value: stats ? `${stats.enabled_bots} / ${stats.total_bots}` : '—', sub: '활성 / 전체' },
    { label: '24h Runs', value: stats ? stats.total_runs_24h.toString() : '—', sub: stats ? `success ${stats.success_runs_24h} · fail ${stats.failed_runs_24h}` : '백엔드 미연결' },
    { label: '24h 비용', value: stats ? formatUsd(stats.total_cost_usd_24h, 4) : '—', sub: '오늘 누적' },
    { label: '7d 비용', value: stats ? formatUsd(stats.total_cost_usd_7d, 4) : '—', sub: '주간 누적' },
  ];
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => (
        <Card key={c.label}>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-zinc-500">{c.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold tracking-tight">{c.value}</div>
            <p className="mt-1 text-xs text-zinc-500">{c.sub}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function PhaseTabs({ current }: { current: number | null }) {
  return (
    <div className="flex flex-wrap gap-1 rounded-md border border-zinc-200 bg-white p-1">
      <PhaseTabLink href="/" label="All" active={current === null} />
      {PHASES.map((p) => (
        <PhaseTabLink key={p} href={`/?phase=${p}`} label={`Phase ${p}`} active={current === p} />
      ))}
    </div>
  );
}

function PhaseTabLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
        active ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:bg-zinc-100'
      }`}
    >
      {label}
    </Link>
  );
}

function BotsTable({ items, backendDown }: { items: BotMeta[]; backendDown: boolean }) {
  if (backendDown) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-sm text-zinc-500">
          백엔드 미연결입니다. <code className="rounded bg-zinc-100 px-1">uvicorn backend.main:app --port 8080</code> 실행 후 새로고침.
        </CardContent>
      </Card>
    );
  }
  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-sm text-zinc-500">
          등록된 봇이 없습니다. POST <code className="rounded bg-zinc-100 px-1">/bots/generic_bot_example/run</code> 1회 실행 시 자동 등록됩니다.
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>봇 ID</TableHead>
            <TableHead>이름</TableHead>
            <TableHead>카테고리</TableHead>
            <TableHead>Phase</TableHead>
            <TableHead>버전</TableHead>
            <TableHead>상태</TableHead>
            <TableHead>최종 갱신</TableHead>
            <TableHead className="text-right">액션</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((b) => (
            <TableRow key={b.bot_id}>
              <TableCell className="font-mono text-xs">{b.bot_id}</TableCell>
              <TableCell>{b.bot_name}</TableCell>
              <TableCell>
                <Badge variant="outline">{b.category}</Badge>
              </TableCell>
              <TableCell>P{b.phase}</TableCell>
              <TableCell className="text-xs text-zinc-500">v{b.version}</TableCell>
              <TableCell>
                {b.enabled ? (
                  <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">enabled</Badge>
                ) : (
                  <Badge variant="outline" className="border-zinc-200 bg-zinc-100 text-zinc-600">paused</Badge>
                )}
              </TableCell>
              <TableCell className="text-xs text-zinc-500">{formatRelative(b.last_updated)}</TableCell>
              <TableCell className="text-right">
                <Link href={`/bots/${encodeURIComponent(b.bot_id)}`} className="text-xs font-medium text-zinc-900 underline-offset-4 hover:underline">
                  상세 →
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
