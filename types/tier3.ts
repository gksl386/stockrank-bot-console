// types/tier3.ts
// Tier 3 스키마 골격 (v18-E는 type만, 구현은 Stage 3+).
//
// 17. 자가 진화 제안 (Meta 봇)
// 18. 인사이트 그래프 (Knowledge Graph)
// 19. SLO/SLA Burn-down

// === 17. 자가 진화 제안 ===
export interface EvolutionProposal {
  proposal_id: string;
  target_bot_id: string;
  target_field: 'prompt' | 'config' | 'manifest';
  current_value: string;
  proposed_value: string;
  rationale: string;
  source_runs: string[];     // 학습 입력이 된 run_id 목록
  expected_metric_delta: Record<string, number>;
  status: 'draft' | 'reviewing' | 'approved' | 'rejected' | 'applied';
  created_by: string;        // meta_bot_id
  created_at: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
}

// === 18. 인사이트 그래프 ===
export interface InsightNode {
  insight_id: string;
  insight_type: string;
  producer_bot_id: string;
  payload_summary: string;
  created_at: string;
}

export interface InsightEdge {
  source_insight_id: string;
  target_insight_id: string;
  relation: 'derived_from' | 'contradicts' | 'confirms' | 'consumed_by_bot';
  weight: number;            // 0.0 ~ 1.0
}

export interface InsightGraph {
  nodes: InsightNode[];
  edges: InsightEdge[];
  generated_at: string;
}

// === 19. SLO / SLA Burn-down ===
export interface SLOTarget {
  slo_id: string;
  bot_id: string;
  metric: 'success_rate' | 'p95_latency_ms' | 'cost_per_run_usd' | 'compliance_rate';
  target: number;            // 예: success_rate >= 0.95
  comparator: '>=' | '<=' | '==';
  window_days: number;       // rolling window
}

export interface SLOBurndownPoint {
  date: string;              // ISO date
  observed: number;
  target: number;
  burn_rate: number;         // 0.0 ~ 1.0 (1.0 = budget 소진)
}

export interface SLOBurndown {
  slo: SLOTarget;
  current: number;
  remaining_budget_pct: number;
  series: SLOBurndownPoint[];
}
