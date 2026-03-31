'use client';

import { TopBar } from '@/components/layout/TopBar';
import { EventSummaryList } from '@/components/dashboard/EventSummaryList';
import { MarketSnapshot } from '@/components/dashboard/MarketSnapshot';
import { ProbabilityChart } from '@/components/analysis/ProbabilityChart';
import { SignalBadge } from '@/components/dashboard/SignalBadge';
import { TrendGauge } from '@/components/dashboard/TrendGauge';
import { useDashboard } from '@/hooks/useDashboard';

export default function DashboardPage() {
  const { data, error, isLoading } = useDashboard();

  if (error) {
    return (
      <div className="flex flex-1 flex-col">
        <TopBar title="仪表盘" />
        <div className="flex flex-1 items-center justify-center p-8 text-red-400">
          加载失败：{error.message}
        </div>
      </div>
    );
  }

  const analysis = data?.latestAnalysis;
  const market = data?.latestMarket;
  const events = data?.todayTopEvents ?? [];
  const trend = data?.recentProbTrend ?? [];

  return (
    <div className="flex flex-1 flex-col">
      <TopBar title="仪表盘" />
      <main className="flex-1 space-y-6 p-4 lg:p-8">
        {isLoading ? (
          <div className="space-y-6 animate-pulse">
            <div className="grid gap-4 lg:grid-cols-6">
              <div className="h-40 rounded-2xl bg-gray-800 lg:col-span-2" />
              <div className="grid grid-cols-2 gap-3 lg:col-span-4 lg:grid-cols-5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-28 rounded-xl bg-gray-800" />
                ))}
              </div>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="h-64 rounded-xl bg-gray-800" />
              <div className="h-64 rounded-xl bg-gray-800" />
            </div>
            <div className="h-80 rounded-xl bg-gray-800" />
            <div className="h-48 rounded-xl bg-gray-800" />
          </div>
        ) : (
          <>
            <div className="grid gap-4 lg:grid-cols-6">
              <div className="lg:col-span-2">
                {analysis ? (
                  <SignalBadge signal={analysis.signal} className="h-full min-h-[160px]" />
                ) : (
                  <div className="flex h-full min-h-[160px] items-center justify-center rounded-2xl border border-dashed border-gray-700 bg-gray-900/50 text-sm text-gray-500">
                    暂无分析信号
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3 lg:col-span-4 lg:grid-cols-5">
                {market ? (
                  <>
                    <MarketSnapshot
                      name="S&P 500"
                      subtitle="SPX"
                      value={market.spxClose}
                      changePct={market.spxChangePct}
                      format="index"
                    />
                    <MarketSnapshot
                      name="纳斯达克 100"
                      subtitle="NDX"
                      value={market.ndxClose}
                      changePct={market.ndxChangePct}
                      format="index"
                    />
                    <MarketSnapshot
                      name="VIX"
                      value={market.vixClose}
                      changePct={0}
                      format="index"
                    />
                    <MarketSnapshot
                      name="美国 10Y"
                      value={market.us10yYield}
                      changePct={0}
                      format="yield"
                    />
                    <MarketSnapshot
                      name="DXY"
                      value={market.dxy}
                      changePct={0}
                      format="index"
                    />
                  </>
                ) : (
                  <div className="col-span-full flex min-h-[120px] items-center justify-center rounded-xl border border-dashed border-gray-700 bg-gray-900/50 text-sm text-gray-500 lg:col-span-5">
                    暂无市场行情
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              {analysis ? (
                <>
                  <TrendGauge
                    title="标普 500 (SPX)"
                    prob7d={analysis.spxBullProb7d}
                    prob30d={analysis.spxBullProb30d}
                  />
                  <TrendGauge
                    title="纳斯达克 100 (NDX)"
                    prob7d={analysis.ndxBullProb7d}
                    prob30d={analysis.ndxBullProb30d}
                  />
                </>
              ) : (
                <div className="col-span-full rounded-xl border border-dashed border-gray-700 bg-gray-900/50 p-8 text-center text-sm text-gray-500">
                  暂无概率仪表盘数据
                </div>
              )}
            </div>

            <ProbabilityChart data={trend} />

            <EventSummaryList events={events} />
          </>
        )}
      </main>
    </div>
  );
}
