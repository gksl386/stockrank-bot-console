import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function Tier2Placeholder({
  emoji,
  title,
  tierFeatureNo,
  description,
  activatesWhen,
  dataSource,
  mockExample,
}: {
  emoji: string;
  title: string;
  tierFeatureNo: number;
  description: string;
  activatesWhen: string;
  dataSource: string;
  mockExample?: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">
          {emoji} {title} <span className="text-base font-normal text-zinc-400">(Tier 2 #{tierFeatureNo})</span>
        </h1>
        <p className="mt-1 text-sm text-zinc-500">{description}</p>
      </header>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">v18-E 골격</CardTitle>
            <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">Mock UI</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-zinc-600">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">활성화 시점</p>
            <p>{activatesWhen}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">데이터 소스</p>
            <p className="font-mono text-xs">{dataSource}</p>
          </div>
          {mockExample && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">Mock 미리보기</p>
              <div className="mt-2">{mockExample}</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
