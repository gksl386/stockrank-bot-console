'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { CronHelper } from '@/components/cron-helper';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  apiListBots, apiGetSchedule, apiCreateSchedule,
  apiDeleteSchedule, apiPauseSchedule, apiResumeSchedule, ApiError,
  type ScheduleMeta,
} from '@/lib/api';
import type { BotMeta } from '@/types/api';

interface BotWithSchedule extends BotMeta {
  schedule: ScheduleMeta | null;
}

export default function SchedulesPage() {
  const [bots, setBots] = useState<BotWithSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [backendDown, setBackendDown] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [cron, setCron] = useState('0 9 * * MON-FRI');
  const [enabled, setEnabled] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setBackendDown(false);
    try {
      const resp = await apiListBots();
      const items = resp.items ?? [];
      const withSchedules = await Promise.all(
        items.map(async (b): Promise<BotWithSchedule> => {
          try {
            const s = await apiGetSchedule(b.bot_id);
            return { ...b, schedule: s };
          } catch {
            return { ...b, schedule: null };
          }
        }),
      );
      setBots(withSchedules);
    } catch {
      setBackendDown(true);
      setBots([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const wrap = async (fn: () => Promise<unknown>, okText: string) => {
    setBusy(true);
    setMsg(null);
    try {
      await fn();
      setMsg({ kind: 'ok', text: okText });
      setEditing(null);
      await reload();
    } catch (e) {
      setMsg({ kind: 'err', text: e instanceof ApiError ? `${e.status}: ${e.detail}` : String(e) });
    } finally {
      setBusy(false);
    }
  };

  const startEdit = (b: BotWithSchedule) => {
    setEditing(b.bot_id);
    setCron(b.schedule?.cron ?? '0 9 * * MON-FRI');
    setEnabled(b.schedule?.enabled ?? true);
    setMsg(null);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <div className="text-[10px] uppercase tracking-wider text-zinc-400">Tier 1 #4 — Cloud Scheduler</div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">봇 스케줄 관리</h1>
        <p className="mt-1 text-sm text-zinc-600">
          각 봇의 자동 실행 시각을 cron 표현식으로 정의합니다 (Asia/Seoul). 스케줄은 Cloud Scheduler Job으로 등록되어 정시에 백엔드를 OIDC 인증으로 호출합니다.
        </p>
      </header>

      {loading ? (
        <Card><CardContent className="p-8 text-center text-sm text-zinc-400">불러오는 중…</CardContent></Card>
      ) : backendDown ? (
        <Card>
          <CardContent className="p-8 text-center text-sm text-zinc-500">
            백엔드 미연결입니다. Cloud Run 상태를 확인하세요.
          </CardContent>
        </Card>
      ) : bots.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-sm text-zinc-500">
            <p>등록된 봇이 없습니다.</p>
            <p className="mt-2">
              <Link href="/bots" className="text-zinc-900 underline underline-offset-2 hover:text-zinc-600">봇 목록</Link>
              에서 봇을 먼저 등록하세요. (Phase 1 첫 봇 등록 시 여기에 카드가 표시됩니다.)
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {bots.map((b) => (
            <Card key={b.bot_id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-base">{b.bot_name}</CardTitle>
                    <p className="mt-0.5 font-mono text-xs text-zinc-500">{b.bot_id}</p>
                  </div>
                  <div className="text-right">
                    {b.schedule ? (
                      <div className="space-y-1">
                        <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-xs">{b.schedule.cron}</code>
                        <div>
                          <Badge variant="outline" className={b.schedule.enabled ? 'border-green-200 bg-green-50 text-green-700' : 'border-zinc-200 bg-zinc-100 text-zinc-600'}>
                            {b.schedule.state ?? (b.schedule.enabled ? 'ENABLED' : 'PAUSED')}
                          </Badge>
                        </div>
                        {b.schedule.next_run_at && (
                          <div className="text-[11px] text-zinc-500">다음: {new Date(b.schedule.next_run_at).toLocaleString('ko-KR')}</div>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-zinc-400">스케줄 없음</span>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {editing === b.bot_id ? (
                  <div className="space-y-3 rounded-md bg-zinc-50 p-4">
                    <CronHelper value={cron} onChange={setCron} />
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
                      활성화
                    </label>
                    <div className="flex gap-2">
                      <button type="button" disabled={busy} onClick={() => wrap(() => apiCreateSchedule(b.bot_id, { cron, enabled, timezone: 'Asia/Seoul' }), '스케줄을 저장했습니다.')} className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50">{busy ? '처리 중…' : '저장'}</button>
                      <button type="button" disabled={busy} onClick={() => { setEditing(null); setMsg(null); }} className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50 disabled:opacity-50">취소</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => startEdit(b)} className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50">{b.schedule ? '수정' : '스케줄 등록'}</button>
                    <Link href={`/bots/${encodeURIComponent(b.bot_id)}/schedule`} className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50">상세 설정</Link>
                    {b.schedule && (
                      <>
                        {b.schedule.enabled ? (
                          <button type="button" disabled={busy} onClick={() => wrap(() => apiPauseSchedule(b.bot_id), '일시 정지했습니다.')} className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50 disabled:opacity-50">일시 정지</button>
                        ) : (
                          <button type="button" disabled={busy} onClick={() => wrap(() => apiResumeSchedule(b.bot_id), '재개했습니다.')} className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50 disabled:opacity-50">재개</button>
                        )}
                        <button type="button" disabled={busy} onClick={() => wrap(() => apiDeleteSchedule(b.bot_id), '삭제했습니다.')} className="rounded-md border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50">삭제</button>
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {msg && (
        <div className={msg.kind === 'ok' ? 'text-sm text-green-600' : 'text-sm text-red-600'}>{msg.text}</div>
      )}
    </div>
  );
}
