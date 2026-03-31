'use client';

import { AnalysisWorkspace } from '@/components/analysis/AnalysisWorkspace';
import { TopBar } from '@/components/layout/TopBar';

export default function AnalysisByDatePage({
  params,
}: {
  params: { date: string };
}) {
  const date = decodeURIComponent(params.date);

  return (
    <div className="flex flex-1 flex-col">
      <TopBar title="趋势分析" />
      <main className="flex-1 p-4 lg:p-8">
        <AnalysisWorkspace date={date} />
      </main>
    </div>
  );
}
