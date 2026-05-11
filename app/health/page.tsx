import { Tier2Placeholder } from '@/components/tier2-placeholder';

export default function HealthPage() {
  return (
    <Tier2Placeholder
      emoji="🩺"
      title="헬스체크 대시보드"
      tierFeatureNo={13}
      description="모든 봇의 success rate / p95 latency / cost trend 실시간 그리드."
      activatesWhen="봇 10개 이상 등록 시 (의미있는 grid)"
      dataSource="bot_runs (status / duration_seconds / cost_usd) 집계 + window query"
      mockExample={
        <div className="grid grid-cols-3 gap-2 text-xs">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-md border border-zinc-200 bg-white p-3">
              <div className="text-zinc-400">bot_{i + 1}</div>
              <div className="mt-1 font-semibold">99.{i + 1}%</div>
            </div>
          ))}
        </div>
      }
    />
  );
}
