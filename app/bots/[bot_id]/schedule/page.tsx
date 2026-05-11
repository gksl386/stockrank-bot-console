'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { CronHelper } from '@/components/cron-helper';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  apiGetSchedule, apiCreateSchedule, apiDeleteSchedule,
  apiPauseSchedule, apiResumeSchedule, ApiError,
  type ScheduleMeta,
} from '@/lib/api';

export default function SchedulePage({ params }: { params: Promise<{ bot_id: string }> }) {
  const { bot_id } = use(params);
  const botId = decodeURIComponent(bot_id);

  const [cron, setCron] = useState('0 9 * * MON-FRI');
  const [enabled, setEnabled] = useState(true);
  const [description, setDescription] = useState('');
  const [current, setCurrent] = useState<ScheduleMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  const reload = async () => {
    setLoading(true);
    try {
      const s = await apiGetSchedule(botId);
      setCurrent(s);
      if (s) {
        setCron(s.cron);
        setEnabled(s.enabled);
        setDescription(s.description ?? '');
      }
    } catch (e) {
      setMsg({ kind: 'err', text: e instanceof ApiError ? e.detail : String(e) });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { reload(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [botId]);

  const wrap = async (fn: () => Promise<unknown>, okText: string) => {
    setBusy(true);
    setMsg(null);
    try {
      await fn();
      setMsg({ kind: 'ok', text: okText });
      await reload();
    } catch (e) {
      setMsg({ kind: 'err', text: e instanceof ApiError ? `${e.status}: ${e.detail}` : String(e) });
    } finally {
      setBusy(false);
    }
  };

  const onSave = () =>
    wrap(() => apiCreateSchedule(botId, { cron, enabled, description: description || null }), '스케줄을 저장했습니다.');
  const onDelete = () => wrap(() => apiDeleteSchedule(botId), '스케줄을 삭제했습니다.');
  const onPause = () => wrap(() => apiPauseSchedule(botId), '스케줄을 일시 정지했습니다.');
  const onResume = () => wrap(() => apiResumeSchedule(botId), '스케줄을 재개했습니다.');

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <Link href={`/bots/${encodeURIComponent(botId)}`} className="text-xs text-zinc-500 hover:text-zinc-900">← 봇 상세</Link>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">봇 스케줄 설정</h1>
        <p className="mt-1 font-mono text-xs text-zinc-500">{botId}</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">현재 스케줄</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          {loading ? (
            <span className="text-zinc-400">불러오는 중…</span>
          ) : current ? (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-xs">{current.cron}</code>
                <Badge variant="outline" className={current.enabled ? 'border-green-200 bg-green-50 text-green-700' : 'border-zinc-200 bg-zinc-100 text-zinc-600'}>
                  {current.state ?? (current.enabled ? 'ENABLED' : 'PAUSED')}
                </Badge>
                <span className="text-xs text-zinc-500">{current.timezone}</span>
              </div>
              {current.next_run_at && (
                <div className="text-xs text-zinc-500">
                  다음 실행: <span className="font-mono">{new Date(current.next_run_at).toLocaleString('ko-KR')}</span>
                </div>
              )}
            </div>
          ) : (
            <span className="text-zinc-500">등록된 스케줄이 없습니다.</span>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">스케줄 등록 / 갱신</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <CronHelper value={cron} onChange={setCron} />

          <div>
            <label className="mb-1 block text-sm font-medium">설명 (선택)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none"
              placeholder="예: 매주 화/금 콘텐츠 자동 생성"
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
            활성화 (체크 해제 시 PAUSED 상태로 생성)
          </label>

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={onSave}
              disabled={busy}
              className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50"
            >
              {busy ? '처리 중…' : '저장'}
            </button>
            {current && (
              <>
                {current.enabled ? (
                  <button type="button" onClick={onPause} disabled={busy} className="rounded-md border border-zinc-300 px-4 py-2 text-sm transition-colors hover:bg-zinc-50 disabled:opacity-50">일시 정지</button>
                ) : (
                  <button type="button" onClick={onResume} disabled={busy} className="rounded-md border border-zinc-300 px-4 py-2 text-sm transition-colors hover:bg-zinc-50 disabled:opacity-50">재개</button>
                )}
                <button type="button" onClick={onDelete} disabled={busy} className="rounded-md border border-red-200 px-4 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50">삭제</button>
              </>
            )}
          </div>

          {msg && (
            <div className={msg.kind === 'ok' ? 'text-xs text-green-600' : 'text-xs text-red-600'}>{msg.text}</div>
          )}
        </CardContent>
      </Card>

      <p className="text-[11px] text-zinc-400">
        스케줄은 Cloud Scheduler Job으로 등록되어 정해진 시각에 백엔드 <code>/bots/{botId}/run</code>을 OIDC 인증으로 호출합니다 (헌법 v1.1 조 17).
      </p>
    </div>
  );
}
