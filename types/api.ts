// types/api.ts
// 백엔드 backend/schemas/models.py 대응 TypeScript 타입.
// v18-E 시점: 5테이블 + budget + Tier 3 스키마 골격.

export type RunStatus = 'running' | 'success' | 'failed' | 'partial';
export type RunMode = 'mock' | 'real';
export type TriggeredBy = 'manual' | 'scheduled' | 'event';

// === bot_registry ===
export interface BotMeta {
  bot_id: string;
  bot_name: string;
  category: string;
  phase: number;
  version: string;
  description: string | null;
  owner: string | null;
  manifest: Record<string, unknown>;
  enabled: boolean;
  created_at: string | null;
  last_updated: string | null;
}

export interface BotListResponse {
  items: BotMeta[];
  count: number;
}

// === bot_runs ===
export interface RunRequest {
  mode?: RunMode;
  triggered_by?: TriggeredBy;
  triggered_event?: string | null;
  inputs?: Record<string, unknown> | null;
}

export interface RunMeta {
  run_id: string;
  bot_id: string;
  bot_name: string;
  bot_version: string;
  started_at: string;
  finished_at: string | null;
  duration_seconds: number;
  model: string | null;
  input_tokens: number;
  output_tokens: number;
  cost_usd: number;
  validation_passed: boolean;
  validation_violations: string[];
  status: RunStatus;
  error_message: string | null;
  triggered_by: string;
  trace_id: string | null;
  trace_url: string | null;
}

export interface RunListResponse {
  items: RunMeta[];
  count: number;
}

export interface RunStartedResponse {
  run_id: string;
  bot_id: string;
  status: 'queued' | 'running';
  mode: RunMode;
  started_at: string;
}

// === bot_costs ===
export interface CostMeta {
  cost_id: string;
  bot_id: string;
  run_id: string | null;
  model: string;
  input_tokens: number;
  output_tokens: number;
  cache_read_tokens: number;
  cache_write_tokens: number;
  cost_usd: number;
  cost_date: string;
  created_at: string | null;
}

// === bot_events ===
export interface EventMeta {
  event_id: string;
  run_id: string | null;
  bot_id: string;
  event_type: string;
  event_data: Record<string, unknown>;
  created_at: string | null;
}

// === bot_insights ===
export interface InsightMeta {
  insight_id: string;
  producer_bot_id: string;
  producer_run_id: string | null;
  insight_type: string;
  payload: Record<string, unknown>;
  consumed_by: string[];
  created_at: string | null;
  expires_at: string | null;
}

// === stats / health / budget ===
export interface StatsResponse {
  total_bots: number;
  enabled_bots: number;
  total_runs_24h: number;
  success_runs_24h: number;
  failed_runs_24h: number;
  total_cost_usd_24h: number;
  total_cost_usd_7d: number;
}

export interface HealthResponse {
  status: 'ok' | 'degraded';
  service: string;
  version: string;
  supabase_enabled: boolean;
  supabase_health: boolean;
  langfuse_enabled: boolean;
  timestamp: string;
}

export interface BudgetSnapshot {
  bot_id: string | null;
  as_of: string | null;
  limits: {
    daily_total_usd: number;
    monthly_total_usd: number;
    daily_per_bot_usd: number;
  };
  usage: {
    today_total_usd: number;
    month_total_usd: number;
    today_bot_usd: number;
  };
  remaining: {
    daily_total_usd: number;
    monthly_total_usd: number;
    daily_per_bot_usd: number;
  };
  supabase_enabled: boolean;
}
