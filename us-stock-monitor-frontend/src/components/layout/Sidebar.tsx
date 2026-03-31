'use client';

import {
  CandlestickChart,
  Landmark,
  LayoutDashboard,
  Menu,
  Newspaper,
  Settings2,
  TrendingUp,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import { cn } from '@/lib/utils';

const nav = [
  { href: '/dashboard', label: '仪表盘', icon: LayoutDashboard },
  { href: '/events', label: '事件监控', icon: Newspaper },
  { href: '/analysis', label: '趋势分析', icon: TrendingUp },
  { href: '/funds', label: '基金动向', icon: Landmark },
  { href: '/control', label: '控制面板', icon: Settings2 },
];

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const NavLinks = (
    <nav className="flex flex-1 flex-col gap-1 p-3">
      {nav.map(({ href, label, icon: Icon }) => {
        const active =
          pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              active
                ? 'bg-indigo-600/90 text-white shadow-lg shadow-indigo-900/40'
                : 'text-gray-400 hover:bg-gray-800/80 hover:text-gray-100'
            )}
          >
            <Icon className="h-5 w-5 shrink-0" aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      <button
        type="button"
        className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-lg border border-gray-800 bg-gray-900 text-gray-100 shadow-lg lg:hidden"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? '关闭菜单' : '打开菜单'}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-[260px] flex-col border-r border-gray-800 bg-gray-900/95 backdrop-blur transition-transform lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex items-center gap-3 border-b border-gray-800 px-5 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 shadow-lg shadow-indigo-900/50">
            <CandlestickChart className="h-6 w-6 text-white" aria-hidden />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-100">US Stock Monitor</p>
            <p className="text-xs text-gray-500">美股事件监控</p>
          </div>
        </div>
        {NavLinks}
        <div className="mt-auto border-t border-gray-800 p-4 text-xs text-gray-500">
          v1.0.0 · 仅供研究参考
        </div>
      </aside>

      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          aria-label="关闭菜单"
          onClick={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}
