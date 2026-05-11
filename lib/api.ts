// lib/api.ts
// BotConsole 백엔드 (FastAPI) 16 엔드포인트 클라이언트.

import type {
  BotMeta, BotListResponse,
  RunRequest, RunMeta, RunListResponse, RunStartedResponse,
  CostMeta, EventMeta, InsightMeta,
  StatsResponse, HealthResponse, BudgetSnapshot,
} from '@/types/api';

interface InsightListResponse {
  items: InsightMeta[];
  count: number;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080';

class ApiError extends Error {
  constructor(public status: number, public detail: string, message?: string) {
    super(message || `API ${status}: ${detail}`);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    cache: 'no-store',
  });
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = typeof body?.detail === 'string' ? body.detail : JSON.stringify(body?.detail ?? body);
    } catch {
      /* ignore */
    }
    throw new ApiError(res.status, detail);
  }
  if (res.status === 204) return undefined as unknown as T;
  return (await res.json()) as T;
}

// === health / stats ===
export const apiHealth = (): Promise<HealthResponse> => request('/health');
export const apiStats = (): Promise<StatsResponse> => request('/stats');

// === bots ===
export const apiListBots = (enabledOnly = false): Promise<BotListResponse> =>
  request(`/bots${enabledOnly ? '?enabled_only=true' : ''}`);

export const apiGetBot = (botId: string): Promise<BotMeta> =>
  request(`/bots/${encodeURIComponent(botId)}`);

export const apiTriggerRun = (botId: string, body: RunRequest = {}): Promise<RunStartedResponse> =>
  request(`/bots/${encodeURIComponent(botId)}/run`, {
    method: 'POST',
    body: JSON.stringify(body),
  });

export const apiPauseBot = (botId: string): Promise<BotMeta> =>
  request(`/bots/${encodeURIComponent(botId)}/pause`, { method: 'POST' });

export const apiEnableBot = (botId: string): Promise<BotMeta> =>
  request(`/bots/${encodeURIComponent(botId)}/enable`, { method: 'POST' });

export const apiListBotRuns = (botId: string, limit = 50): Promise<RunListResponse> =>
  request(`/bots/${encodeURIComponent(botId)}/runs?limit=${limit}`);

export const apiListBotCosts = (botId: string, limit = 100): Promise<CostMeta[]> =>
  request(`/bots/${encodeURIComponent(botId)}/costs?limit=${limit}`);

// === runs ===
export const apiGetRun = (runId: string): Promise<RunMeta> =>
  request(`/runs/${encodeURIComponent(runId)}`);

// === budget ===
export const apiGlobalBudget = (): Promise<BudgetSnapshot> => request('/budget');
export const apiBotBudget = (botId: string): Promise<BudgetSnapshot> =>
  request(`/bots/${encodeURIComponent(botId)}/budget`);

// === insights (v18-F 신규) ===
export const apiListInsights = (params?: { insight_type?: string; producer_bot_id?: string; limit?: number }): Promise<InsightListResponse> => {
  const q = new URLSearchParams();
  if (params?.insight_type) q.set('insight_type', params.insight_type);
  if (params?.producer_bot_id) q.set('producer_bot_id', params.producer_bot_id);
  if (params?.limit) q.set('limit', String(params.limit));
  const qs = q.toString();
  return request(`/insights${qs ? '?' + qs : ''}`);
};

export const apiListBotInsights = (botId: string, limit = 50): Promise<InsightListResponse> =>
  request(`/bots/${encodeURIComponent(botId)}/insights?limit=${limit}`);

export const apiConsumeInsight = (insightId: string, consumerBotId: string): Promise<InsightMeta> =>
  request(`/insights/${encodeURIComponent(insightId)}/consume`, {
    method: 'POST',
    body: JSON.stringify({ consumer_bot_id: consumerBotId }),
  });

// === SSE URL builders (EventSource는 lib/sse.ts) ===
export const sseRunStreamUrl = (botId: string, runId: string) =>
  `${API_BASE}/bots/${encodeURIComponent(botId)}/runs/${encodeURIComponent(runId)}/stream`;
export const sseBotEventsUrl = (botId: string, eventType?: string) =>
  `${API_BASE}/bots/${encodeURIComponent(botId)}/events/stream${eventType ? `?event_type=${encodeURIComponent(eventType)}` : ''}`;
export const sseGlobalEventsUrl = (eventType?: string) =>
  `${API_BASE}/events/stream${eventType ? `?event_type=${encodeURIComponent(eventType)}` : ''}`;

export { ApiError };
