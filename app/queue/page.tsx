import Link from 'next/link';
import { apiListInsights } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { formatRelative } from '@/lib/utils';
import type { InsightMeta } from '@/types/api';

export const dynamic = 'force-dynamic';

export default async function QueuePage() {
  let insights: InsightMeta[] = [];
  let backendDown = false;
  let error: string | null = null;

  try {
    const res = await apiListInsights({ limit: 100 });
    insights = res.items;
  } catch (e) {
    const msg = String((e as { message?: string }).message || e);
    if (msg.includes('503')) {
      error = 'Supabase DDL 미실행 — bot_insights 테이블 없음.';
    } else if (msg.includes('Failed to fetch') || msg.includes('ECONNREFUSED')) {
      backendDown = true;
    } else {
      error = msg;
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">📥 발행 큐 (Tier 1 #8)</h1>
        <p className="mt-1 text-sm text-zinc-500">봇이 발행한 인사이트 + 다른 봇이 구독한 이력 (bot_insights).</p>
      </header>

      {backendDown && (
        <Card>
          <CardContent className="p-8 text-center text-sm text-zinc-500">
            백엔드 미연결. <code className="rounded bg-zinc-100 px-1">uvicorn backend.main:app --port 8080</code>
          </CardContent>
        </Card>
      )}

      {!backendDown && error && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">알림</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-amber-700">
            <p>{error}</p>
            <p className="mt-2 text-xs text-zinc-500">
              v18-B DDL을 Supabase SQL Editor에서 실행하면 즉시 활성화됩니다.
            </p>
          </CardContent>
        </Card>
      )}

      {!backendDown && !error && insights.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-sm text-zinc-500">
            아직 발행된 인사이트가 없습니다.<br />
            <span className="text-xs">v18-F generic_bot_example mock 실행 시 1건 자동 발행 (Vertical Slice).</span>
          </CardContent>
        </Card>
      )}

      {!backendDown && insights.length > 0 && (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>insight_type</TableHead>
                <TableHead>producer</TableHead>
                <TableHead>payload</TableHead>
                <TableHead>구독 봇</TableHead>
                <TableHead>발행 시각</TableHead>
                <TableHead>만료</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {insights.map((it) => (
                <TableRow key={it.insight_id}>
                  <TableCell>
                    <Badge variant="outline">{it.insight_type}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-[11px]">
                    <Link href={`/bots/${encodeURIComponent(it.producer_bot_id)}`} className="hover:underline">
                      {it.producer_bot_id}
                    </Link>
                  </TableCell>
                  <TableCell className="max-w-md truncate font-mono text-[11px] text-zinc-600">
                    {JSON.stringify(it.payload)}
                  </TableCell>
                  <TableCell className="text-xs">
                    {it.consumed_by.length === 0 ? (
                      <span className="text-zinc-400">아직 없음</span>
                    ) : (
                      <span>{it.consumed_by.length}봇 ({it.consumed_by.join(', ')})</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-zinc-500">{formatRelative(it.created_at)}</TableCell>
                  <TableCell className="text-xs text-zinc-500">
                    {it.expires_at ? formatRelative(it.expires_at) : '영구'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
