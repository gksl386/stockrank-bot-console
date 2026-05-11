'use client';

import { cn } from '@/lib/utils';

interface Props {
  value: string;
  onChange: (v: string) => void;
}

const PRESETS: { label: string; cron: string }[] = [
  { label: '매일 09:00', cron: '0 9 * * *' },
  { label: '매주 월~금 09:00', cron: '0 9 * * MON-FRI' },
  { label: '매주 화/금 10:00', cron: '0 10 * * TUE,FRI' },
  { label: '매일 18:00', cron: '0 18 * * *' },
  { label: '매시간 정각', cron: '0 * * * *' },
  { label: '매주 일요일 23:00', cron: '0 23 * * SUN' },
];

export function CronHelper({ value, onChange }: Props) {
  return (
    <div className="space-y-3">
      <div>
        <label className="mb-1 block text-sm font-medium">Cron 표현식 (분 시 일 월 요일)</label>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-md border border-zinc-300 px-3 py-2 font-mono text-sm focus:border-zinc-900 focus:outline-none"
          placeholder="0 9 * * MON-FRI"
          spellCheck={false}
        />
        <p className="mt-1 text-[11px] text-zinc-400">예: <code>0 9 * * MON-FRI</code> = 평일 오전 9시 / 시간대 Asia/Seoul</p>
      </div>

      <div>
        <div className="mb-2 text-xs text-zinc-500">자주 쓰는 패턴</div>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.cron}
              type="button"
              onClick={() => onChange(p.cron)}
              className={cn(
                'rounded-md px-3 py-1 text-xs font-medium transition-colors',
                value === p.cron ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200',
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
