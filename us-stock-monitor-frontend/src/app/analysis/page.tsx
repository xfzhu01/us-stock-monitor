'use client';

import { AnalysisWorkspace } from '@/components/analysis/AnalysisWorkspace';
import { TopBar } from '@/components/layout/TopBar';
import { useLatestAnalysis } from '@/hooks/useAnalysis';

export default function AnalysisPage() {
  const { data, error, isLoading } = useLatestAnalysis();

  if (error) {
    return (
      <div className="flex flex-1 flex-col">
        <TopBar title="趋势分析" />
        <div className="p-8 text-center text-red-400">{error.message}</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col">
        <TopBar title="趋势分析" />
        <div className="animate-pulse space-y-6 p-4 lg:p-8">
          <div className="h-10 w-48 rounded bg-gray-800" />
          <div className="h-96 rounded-xl bg-gray-800" />
        </div>
      </div>
    );
  }

  if (!data?.analysisDate) {
    return (
      <div className="flex flex-1 flex-col">
        <TopBar title="趋势分析" />
        <div className="flex flex-1 items-center justify-center p-8 text-gray-500">
          暂无分析报告，请稍后再试或前往仪表盘查看。
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <TopBar title="趋势分析" />
      <main className="flex-1 p-4 lg:p-8">
        <AnalysisWorkspace date={data.analysisDate} />
      </main>
    </div>
  );
}
