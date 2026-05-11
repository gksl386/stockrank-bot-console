import { apiGlobalBudget } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatUsd, cn } from '@/lib/utils';
import type { BudgetSnapshot } from '@/types/api';

export const dynamic = 'force-dynamic';

export default async function BudgetPage() {
  let budget: BudgetSnapshot | null = null;
  try {
    budget = await apiGlobalBudget();
  } catch {
    /* graceful */
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">💰 비용 (Tier 1 #6)</h1>
        <p className="mt-1 text-sm text-zinc-500">글로벌 한도 + 누적 사용량. 한도 초과 시 자동 차단 (헌법 4.2).</p>
      </header>

      {!budget ? (
        <Card>
          <CardContent className="p-8 text-center text-sm text-zinc-500">백엔드 미연결.</CardContent>
        </Card>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={budget.supabase_enabled ? 'border-green-200 bg-green-50 text-green-700' : 'border-amber-200 bg-amber-50 text-amber-700'}>
              {budget.supabase_enabled ? 'Supabase 연결' : 'Supabase off (한도만 표시)'}
            </Badge>
            {budget.as_of && <span className="text-xs text-zinc-500">as of {budget.as_of}</span>}
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <BudgetBar
              label="일 전체 한도"
              usage={budget.usage.today_total_usd}
              limit={budget.limits.daily_total_usd}
              remaining={budget.remaining.daily_total_usd}
            />
            <BudgetBar
              label="월 전체 한도"
              usage={budget.usage.month_total_usd}
              limit={budget.limits.monthly_total_usd}
              remaining={budget.remaining.monthly_total_usd}
            />
            <BudgetBar
              label="봇별 일 한도 (default)"
              usage={budget.usage.today_bot_usd}
              limit={budget.limits.daily_per_bot_usd}
              remaining={budget.remaining.daily_per_bot_usd}
              note="봇별 누적은 /bots/{id}/budget"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">한도 변경 가이드</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-zinc-600">
              <p>한도는 백엔드 <code className="rounded bg-zinc-100 px-1">.env</code>로 조정:</p>
              <pre className="overflow-x-auto rounded-md bg-zinc-950 p-3 text-xs text-zinc-100">
{`DAILY_COST_LIMIT_USD=5.00       # 전체 일 한도
MONTHLY_COST_LIMIT_USD=50.00    # 전체 월 한도
BOT_DAILY_COST_LIMIT_USD=1.00   # 봇별 일 한도`}
              </pre>
              <p className="text-xs text-zinc-500">초과 시: 봇별 = 자동 일시정지 / 전체 = bot_events에 cost_threshold 기록.</p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function BudgetBar({
  label,
  usage,
  limit,
  remaining,
  note,
}: {
  label: string;
  usage: number;
  limit: number;
  remaining: number;
  note?: string;
}) {
  const pct = limit > 0 ? Math.min(100, (usage / limit) * 100) : 0;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{label}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-2xl font-semibold tracking-tight">{formatUsd(usage, 4)}</div>
        <div className="text-xs text-zinc-500">한도 {formatUsd(limit, 2)} · 잔여 {formatUsd(remaining, 4)}</div>
        <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
          <div className={cn('h-full rounded-full', pct > 80 ? 'bg-red-500' : pct > 50 ? 'bg-amber-500' : 'bg-green-500')} style={{ width: `${pct}%` }} />
        </div>
        {note && <p className="text-[11px] text-zinc-400">{note}</p>}
      </CardContent>
    </Card>
  );
}
