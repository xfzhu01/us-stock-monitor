'use client';

import { cn } from '@/lib/utils';

interface FundSelectorProps {
  funds: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function FundSelector({
  funds,
  selected,
  onChange,
  disabled,
  placeholder = '选择基金',
}: FundSelectorProps) {
  const toggle = (name: string) => {
    const s = new Set(selected);
    if (s.has(name)) s.delete(name);
    else s.add(name);
    onChange(Array.from(s));
  };

  return (
    <div className="relative">
      <details className="group rounded-lg border border-gray-700 bg-gray-950">
        <summary
          className={cn(
            'cursor-pointer list-none px-3 py-2 text-sm text-gray-200',
            'marker:content-none [&::-webkit-details-marker]:hidden',
            disabled && 'cursor-not-allowed opacity-50'
          )}
        >
          {selected.length ? `已选 ${selected.length} 个基金` : placeholder}
        </summary>
        <div className="max-h-48 overflow-y-auto border-t border-gray-800 p-2">
          {funds.length === 0 ? (
            <p className="px-2 py-1 text-xs text-gray-500">暂无基金列表</p>
          ) : (
            funds.map((f) => (
              <label
                key={f}
                className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-gray-900"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(f)}
                  onChange={() => toggle(f)}
                  disabled={disabled}
                  className="rounded border-gray-600 bg-gray-900 text-indigo-600"
                />
                <span className="truncate text-gray-300">{f}</span>
              </label>
            ))
          )}
        </div>
      </details>
    </div>
  );
}
