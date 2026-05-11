import { Tier2Placeholder } from '@/components/tier2-placeholder';

export default function CalendarPage() {
  return (
    <Tier2Placeholder
      emoji="📅"
      title="캘린더 뷰"
      tierFeatureNo={14}
      description="cron 스케줄 + 과거 실행 기록을 캘린더로 한판 표시."
      activatesWhen="Phase 1 종료 (스케줄 봇 등장 시)"
      dataSource="bot_registry.manifest.triggers.scheduled.cron + bot_runs (started_at)"
      mockExample={
        <div className="grid grid-cols-7 gap-1 text-center text-[11px]">
          {Array.from({ length: 28 }).map((_, i) => (
            <div key={i} className="aspect-square rounded border border-zinc-200 bg-white p-1 text-zinc-400">
              {i + 1}
            </div>
          ))}
        </div>
      }
    />
  );
}
