'use client';

import { AlertTriangle, Leaf } from 'lucide-react';

interface RiskTailwindListProps {
  risks: string[];
  tailwinds: string[];
}

export function RiskTailwindList({ risks, tailwinds }: RiskTailwindListProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-xl border border-red-900/50 bg-red-950/30 p-4 shadow-lg">
        <div className="mb-3 flex items-center gap-2 text-red-400">
          <AlertTriangle className="h-5 w-5" aria-hidden />
          <h3 className="text-sm font-semibold">主要风险</h3>
        </div>
        {risks.length === 0 ? (
          <p className="text-sm text-gray-500">暂无</p>
        ) : (
          <ul className="space-y-2">
            {risks.map((r, i) => (
              <li
                key={i}
                className="rounded-lg border border-red-900/40 bg-red-950/40 px-3 py-2 text-sm text-red-100/90"
              >
                {r}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="rounded-xl border border-emerald-900/50 bg-emerald-950/30 p-4 shadow-lg">
        <div className="mb-3 flex items-center gap-2 text-emerald-400">
          <Leaf className="h-5 w-5" aria-hidden />
          <h3 className="text-sm font-semibold">顺风 / 利好</h3>
        </div>
        {tailwinds.length === 0 ? (
          <p className="text-sm text-gray-500">暂无</p>
        ) : (
          <ul className="space-y-2">
            {tailwinds.map((t, i) => (
              <li
                key={i}
                className="rounded-lg border border-emerald-900/40 bg-emerald-950/40 px-3 py-2 text-sm text-emerald-100/90"
              >
                {t}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
