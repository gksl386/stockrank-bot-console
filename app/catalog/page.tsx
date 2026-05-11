import { Tier2Placeholder } from '@/components/tier2-placeholder';

export default function CatalogPage() {
  return (
    <Tier2Placeholder
      emoji="📚"
      title="봇 카탈로그"
      tierFeatureNo={16}
      description="모든 봇의 manifest 카드형 카탈로그. 검색/필터/정렬."
      activatesWhen="봇 20개 이상 등록 시 (의미있는 검색)"
      dataSource="bot_registry.manifest.* (description / capabilities / dependencies / triggers)"
      mockExample={
        <div className="grid grid-cols-3 gap-2 text-xs">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-md border border-zinc-200 bg-white p-3">
              <div className="font-mono text-zinc-400">bot_{i + 1}_v1</div>
              <div className="mt-1 text-[11px] text-zinc-500">category · phase 1</div>
            </div>
          ))}
        </div>
      }
    />
  );
}
