'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Pause, RefreshCw, Power } from 'lucide-react';
import { apiTriggerRun, apiPauseBot, apiEnableBot, sseRunStreamUrl, sseBotEventsUrl } from '@/lib/api';
import { subscribeSSE } from '@/lib/sse';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn, formatRelative } from '@/lib/utils';

interface LogEntry {
  ts: string;
  event: string;
  data: unknown;
}

export function BotDetailClient({ botId, initialEnabled }: { botId: string; initialEnabled: boolean }) {
  const router = useRouter();
  const [enabled, setEnabled] = useState(initialEnabled);
  const [running, setRunning] = useState(false);
  const [currentRunId, setCurrentRunId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    return () => cleanupRef.current?.();
  }, []);

  // 봇별 이벤트 글로벌 구독 (run 트리거 외에도 cost_threshold 등)
  useEffect(() => {
    const off = subscribeSSE(sseBotEventsUrl(botId), {
      onMessage: (data, eventName) => {
        appendLog(`bot:${eventName}`, data);
      },
      onError: () => {
        /* 자동 reconnect */
      },
    });
    return off;
  }, [botId]);

  function appendLog(event: string, data: unknown) {
    setLogs((prev) => {
      const next = [{ ts: new Date().toISOString(), event, data }, ...prev];
      return next.slice(0, 200);
    });
  }

  async function trigger(mode: 'mock' | 'real') {
    setError(null);
    setRunning(true);
    cleanupRef.current?.();
    try {
      const started = await apiTriggerRun(botId, { mode, triggered_by: 'manual' });
      setCurrentRunId(started.run_id);
      appendLog('run:queued', started);

      const off = subscribeSSE(sseRunStreamUrl(botId, started.run_id), {
        onConnected: (d) => appendLog('run:connected', d),
        onMessage: (d, name) => appendLog(`run:${name}`, d),
        onClose: (d) => {
          appendLog('run:close', d);
          setRunning(false);
          router.refresh();
        },
        onError: () => {
          appendLog('run:error', 'sse error');
        },
      });
      cleanupRef.current = off;
    } catch (e) {
      const msg = String((e as { message?: string }).message || e);
      setError(msg);
      setRunning(false);
      appendLog('run:error', msg);
    }
  }

  async function togglePower() {
    try {
      const updated = enabled ? await apiPauseBot(botId) : await apiEnableBot(botId);
      setEnabled(updated.enabled);
      appendLog('power', { enabled: updated.enabled });
      router.refresh();
    } catch (e) {
      setError(String((e as { message?: string }).message || e));
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">▶️ 실행 (Tier 1 #3) · 🌊 SSE 실시간 로그 (Tier 1 #5)</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => router.refresh()}>
              <RefreshCw className="h-3.5 w-3.5" />
              새로고침
            </Button>
            <Button variant={enabled ? 'outline' : 'default'} size="sm" onClick={togglePower}>
              <Power className="h-3.5 w-3.5" />
              {enabled ? '일시정지' : '활성화'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={() => trigger('mock')} disabled={running || !enabled}>
            <Play className="h-4 w-4" />
            mock 실행
          </Button>
          <Button variant="secondary" onClick={() => trigger('real')} disabled={running || !enabled}>
            <Play className="h-4 w-4" />
            real 실행 (cost guard)
          </Button>
          {running && <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">running…</Badge>}
          {currentRunId && (
            <span className="text-xs text-zinc-500">run_id: <code className="font-mono">{currentRunId.slice(0, 8)}…</code></span>
          )}
        </div>

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-700">{error}</div>
        )}

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">실시간 로그 (최근 200건)</span>
            <Button variant="ghost" size="sm" onClick={() => setLogs([])}>
              <Pause className="h-3 w-3" />
              clear
            </Button>
          </div>
          <div className="h-72 overflow-y-auto rounded-md border border-zinc-200 bg-zinc-950 p-3 font-mono text-[11px] text-zinc-200">
            {logs.length === 0 ? (
              <p className="text-zinc-500">SSE 대기 중… (mock 실행 또는 봇 이벤트 발생 시 표시)</p>
            ) : (
              logs.map((l, i) => (
                <div key={i} className={cn('whitespace-pre-wrap break-all py-0.5', l.event.includes('error') && 'text-red-400')}>
                  <span className="text-zinc-500">[{formatRelative(l.ts)}]</span>{' '}
                  <span className="text-cyan-400">{l.event}</span>{' '}
                  {typeof l.data === 'string' ? l.data : JSON.stringify(l.data)}
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
