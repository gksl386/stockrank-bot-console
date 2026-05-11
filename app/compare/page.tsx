import { Tier2Placeholder } from '@/components/tier2-placeholder';

export default function ComparePage() {
  return (
    <Tier2Placeholder
      emoji="🔍"
      title="봇 비교 (A/B)"
      tierFeatureNo={15}
      description="같은 카테고리 봇 2개 이상의 메트릭(비용/품질/latency)을 side-by-side."
      activatesWhen="같은 category 봇 2개 이상 등록 시"
      dataSource="bot_runs + bot_costs grouped by bot_id (window aggregate)"
      mockExample={
        <div className="grid grid-cols-2 gap-3 text-xs">
          {['bot_a_v1', 'bot_b_v1'].map((id) => (
            <div key={id} className="rounded-md border border-zinc-200 bg-white p-3">
              <div className="font-mono text-zinc-500">{id}</div>
              <div className="mt-1 grid grid-cols-2 gap-1 text-[11px]">
                <span className="text-zinc-500">success</span><span>97%</span>
                <span className="text-zinc-500">avg cost</span><span>$0.0023</span>
                <span className="text-zinc-500">p95 latency</span><span>1.2s</span>
              </div>
            </div>
          ))}
        </div>
      }
    />
  );
}
