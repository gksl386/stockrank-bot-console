import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  apiGetBot, apiListBotRuns, apiBotBudget, apiListBotCosts,
} from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { formatUsd, formatRelative, statusColor, cn } from '@/lib/utils';
import type { BotMeta, RunMeta, BudgetSnapshot, CostMeta } from '@/types/api';
import { BotDetailClient } from './client';

export const dynamic = 'force-dynamic';

export default async function BotDetailPage({ params }: { params: Promise<{ bot_id: string }> }) {
  const { bot_id } = await params;
  const id = decodeURIComponent(bot_id);

  let bot: BotMeta | null = null;
  let runs: RunMeta[] = [];
  let budget: BudgetSnapshot | null = null;
  let costs: CostMeta[] = [];
  let backendDown = false;

  try {
    bot = await apiGetBot(id);
    [runs, budget, costs] = await Promise.all([
      apiListBotRuns(id, 20).then((r) => r.items).catch(() => []),
      apiBotBudget(id).catch(() => null),
      apiListBotCosts(id, 50).catch(() => []),
    ]);
  } catch (err) {
    const msg = String((err as { message?: string }).message || err);
    if (msg.includes('404')) notFound();
    backendDown = true;
  }

  if (backendDown) {
    return (
      <div className="space-y-4">
        <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-900">← 상황판</Link>
        <Card>
          <CardContent className="p-8 text-center text-sm text-zinc-500">
            백엔드 미연결입니다. <code className="rounded bg-zinc-100 px-1">uvicorn backend.main:app --port 8080</code>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!bot) {
    notFound();
  }

  const compliance = computeCompliance(runs);

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <Link href="/" className="text-xs text-zinc-500 hover:text-zinc-900">← 상황판</Link>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">{bot.bot_name}</h1>
          <p className="mt-1 font-mono text-xs text-zinc-500">{bot.bot_id} · v{bot.version} · Phase {bot.phase} · {bot.category}</p>
          {bot.description && <p className="mt-2 max-w-2xl text-sm text-zinc-600">{bot.description}</p>}
        </div>
        <div className="flex items-center gap-2">
          {bot.enabled ? (
            <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">enabled</Badge>
          ) : (
            <Badge variant="outline" className="border-zinc-200 bg-zinc-100 text-zinc-600">paused</Badge>
          )}
        </div>
      </header>

      <BotDetailClient botId={bot.bot_id} initialEnabled={bot.enabled} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <BudgetCard budget={budget} />
        <ComplianceCard
          totalRuns={runs.length}
          passRate={compliance.passRate}
          violationsTotal={compliance.violationsTotal}
        />
        <CostMiniCard costs={costs} />
      </div>

      <section className="space-y-2">
        <h2 className="text-base font-semibold">최근 실행 ({runs.length})</h2>
        <RunsTable items={runs} />
      </section>
    </div>
  );
}

function BudgetCard({ budget }: { budget: BudgetSnapshot | null }) {
  if (!budget) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">💰 비용 (Tier 1 #6)</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-zinc-500">budget 조회 실패</CardContent>
      </Card>
    );
  }
  const pct = budget.limits.daily_per_bot_usd > 0
    ? Math.min(100, (budget.usage.today_bot_usd / budget.limits.daily_per_bot_usd) * 100)
    : 0;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">💰 비용 (Tier 1 #6)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-zinc-500">오늘 (봇별)</span>
            <span className="text-sm font-semibold">{formatUsd(budget.usage.today_bot_usd, 4)} / {formatUsd(budget.limits.daily_per_bot_usd, 2)}</span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-zinc-100">
            <div className={cn('h-full rounded-full transition-all', pct > 80 ? 'bg-red-500' : pct > 50 ? 'bg-amber-500' : 'bg-green-500')} style={{ width: `${pct}%` }} />
          </div>
        </div>
        <div className="flex justify-between text-xs text-zinc-500">
          <span>전체 오늘: {formatUsd(budget.usage.today_total_usd, 4)} / {formatUsd(budget.limits.daily_total_usd, 2)}</span>
        </div>
        <div className="flex justify-between text-xs text-zinc-500">
          <span>전체 이번 달: {formatUsd(budget.usage.month_total_usd, 4)} / {formatUsd(budget.limits.monthly_total_usd, 2)}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function ComplianceCard({
  totalRuns,
  passRate,
  violationsTotal,
}: {
  totalRuns: number;
  passRate: number;
  violationsTotal: number;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">📜 헌법 준수율 (Tier 1 #7)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-3xl font-semibold tracking-tight">
          {totalRuns === 0 ? '—' : `${(passRate * 100).toFixed(1)}%`}
        </div>
        <p className="text-xs text-zinc-500">
          최근 {totalRuns}건 중 {Math.round(passRate * totalRuns)} 통과 / 위반 누계 {violationsTotal}건
        </p>
        <p className="text-[11px] text-zinc-400">
          KoreanLegalValidator 16 패턴 (ADVISORY/PREDICTION/STOCK_RECOMMEND/GUARANTEE) + 룰 #79
        </p>
      </CardContent>
    </Card>
  );
}

function CostMiniCard({ costs }: { costs: CostMeta[] }) {
  const total = costs.reduce((sum, c) => sum + (c.cost_usd || 0), 0);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">📊 최근 비용 ({costs.length}건)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold">{formatUsd(total, 6)}</div>
        <p className="mt-1 text-xs text-zinc-500">최근 {costs.length}건 누적</p>
      </CardContent>
    </Card>
  );
}

function RunsTable({ items }: { items: RunMeta[] }) {
  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-sm text-zinc-500">아직 실행 이력이 없습니다.</CardContent>
      </Card>
    );
  }
  return (
    <Card className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>run_id</TableHead>
            <TableHead>상태</TableHead>
            <TableHead>모델</TableHead>
            <TableHead>tokens</TableHead>
            <TableHead>비용</TableHead>
            <TableHead>검증</TableHead>
            <TableHead>시작</TableHead>
            <TableHead>duration</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((r) => (
            <TableRow key={r.run_id}>
              <TableCell className="font-mono text-[11px]">{r.run_id.slice(0, 8)}…</TableCell>
              <TableCell>
                <Badge variant="outline" className={statusColor(r.status)}>{r.status}</Badge>
              </TableCell>
              <TableCell className="text-xs">{r.model || '—'}</TableCell>
              <TableCell className="text-xs">in {r.input_tokens} / out {r.output_tokens}</TableCell>
              <TableCell className="text-xs">{formatUsd(r.cost_usd, 6)}</TableCell>
              <TableCell>
                {r.validation_passed ? (
                  <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">PASS</Badge>
                ) : (
                  <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700">{r.validation_violations.length}건 위반</Badge>
                )}
              </TableCell>
              <TableCell className="text-xs text-zinc-500">{formatRelative(r.started_at)}</TableCell>
              <TableCell className="text-xs text-zinc-500">{r.duration_seconds.toFixed(2)}s</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

function computeCompliance(runs: RunMeta[]): { passRate: number; violationsTotal: number } {
  if (runs.length === 0) return { passRate: 0, violationsTotal: 0 };
  const passed = runs.filter((r) => r.validation_passed).length;
  const violationsTotal = runs.reduce((s, r) => s + r.validation_violations.length, 0);
  return { passRate: passed / runs.length, violationsTotal };
}
