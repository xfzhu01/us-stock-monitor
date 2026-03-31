'use client';

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { formatDate } from '@/lib/utils';
import type { AnalysisVO } from '@/types/analysis';

interface ProbabilityChartProps {
  data: AnalysisVO[];
  className?: string;
}

export function ProbabilityChart({ data, className }: ProbabilityChartProps) {
  const chartData = [...data]
    .sort(
      (a, b) =>
        new Date(a.analysisDate).getTime() - new Date(b.analysisDate).getTime()
    )
    .map((row) => ({
      date: row.analysisDate,
      label: formatDate(row.analysisDate, 'MM-dd'),
      spx7: row.spxBullProb7d,
      spx30: row.spxBullProb30d,
      ndx7: row.ndxBullProb7d,
      ndx30: row.ndxBullProb30d,
    }));

  if (!chartData.length) {
    return (
      <div
        className={`flex h-[320px] items-center justify-center rounded-xl border border-dashed border-gray-700 bg-gray-900/50 text-sm text-gray-500 ${className ?? ''}`}
      >
        暂无趋势数据
      </div>
    );
  }

  return (
    <div
      className={`h-[320px] w-full rounded-xl border border-gray-800 bg-gray-900/80 p-4 shadow-lg ${className ?? ''}`}
    >
      <p className="mb-2 text-sm font-medium text-gray-300">概率趋势（30 日）</p>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="label"
            tick={{ fill: '#9ca3af', fontSize: 11 }}
            stroke="#4b5563"
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: '#9ca3af', fontSize: 11 }}
            stroke="#4b5563"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#111827',
              border: '1px solid #374151',
              borderRadius: '8px',
            }}
            labelStyle={{ color: '#e5e7eb' }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <ReferenceLine y={50} stroke="#6b7280" strokeDasharray="4 4" />
          <Line
            type="monotone"
            dataKey="spx7"
            name="SPX 7d"
            stroke="#3b82f6"
            dot={false}
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="spx30"
            name="SPX 30d"
            stroke="#22c55e"
            dot={false}
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="ndx7"
            name="NDX 7d"
            stroke="#f97316"
            dot={false}
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="ndx30"
            name="NDX 30d"
            stroke="#ea580c"
            dot={false}
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
