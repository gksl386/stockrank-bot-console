import { Tier2Placeholder } from '@/components/tier2-placeholder';

export default function GraphPage() {
  return (
    <Tier2Placeholder
      emoji="🕸️"
      title="봇 그래프 시각화"
      tierFeatureNo={12}
      description="봇 → 인사이트 → 봇 의존 관계를 그래프로 표시. LangGraph Studio 영감."
      activatesWhen="Stage 3 (봇 5개+ + insights 발행 시작)"
      dataSource="bot_registry / bot_insights.consumed_by / bot_runs.upstream_bots"
      mockExample={
        <div className="rounded-md border border-dashed border-zinc-300 bg-zinc-50 p-6 text-center text-xs text-zinc-500">
          Mock graph: 봇 노드 + 의존 엣지 (Stage 3 활성)
        </div>
      }
    />
  );
}
