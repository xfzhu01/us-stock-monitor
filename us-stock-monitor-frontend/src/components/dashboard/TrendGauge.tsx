'use client';

import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';

import { cn } from '@/lib/utils';

function probColor(p: number): string {
  if (p <= 50) {
    const t = p / 50;
    const r = Math.round(239 + (234 - 239) * t);
    const g = Math.round(68 + (179 - 68) * t);
    const b = Math.round(68 + (8 - 68) * t);
    return `rgb(${r},${g},${b})`;
  }
  const t = (p - 50) / 50;
  const r = Math.round(234 + (34 - 234) * t);
  const g = Math.round(179 + (197 - 179) * t);
  const b = Math.round(8 + (94 - 8) * t);
  return `rgb(${r},${g},${b})`;
}

interface SemiGaugeProps {
  value: number;
  label: string;
}

function SemiGauge({ value, label }: SemiGaugeProps) {
  const v = Math.min(100, Math.max(0, value));
  const rest = 100 - v;
  const data = [
    { name: 'prob', value: v, fill: probColor(v) },
    { name: 'rest', value: rest, fill: '#1f2937' },
  ];

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-[110px] w-full max-w-[160px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              cx="50%"
              cy="100%"
              startAngle={180}
              endAngle={0}
              innerRadius={52}
              outerRadius={72}
              stroke="none"
              isAnimationActive
            >
              {data.map((entry, idx) => (
                <Cell key={idx} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
          <span className="text-2xl font-bold tabular-nums text-gray-100">
            {Math.round(v)}
          </span>
          <span className="text-[10px] text-gray-500">{label}</span>
        </div>
      </div>
    </div>
  );
}

interface TrendGaugeProps {
  title: string;
  prob7d: number | null | undefined;
  prob30d: number | null | undefined;
  className?: string;
}

export function TrendGauge({ title, prob7d, prob30d, className }: TrendGaugeProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-gray-800 bg-gray-900/90 p-4 shadow-lg',
        className
      )}
    >
      <p className="mb-4 text-center text-sm font-semibold text-gray-200">{title}</p>
      <div className="grid grid-cols-2 gap-2">
        <SemiGauge value={prob7d ?? 0} label="7日看涨概率" />
        <SemiGauge value={prob30d ?? 0} label="30日看涨概率" />
      </div>
    </div>
  );
}
