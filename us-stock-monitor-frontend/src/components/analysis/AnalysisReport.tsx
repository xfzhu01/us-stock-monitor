'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { cn } from '@/lib/utils';

interface AnalysisReportProps {
  markdown: string;
  className?: string;
}

export function AnalysisReport({ markdown, className }: AnalysisReportProps) {
  return (
    <div
      className={cn(
        'prose prose-invert max-w-none rounded-xl border border-gray-800 bg-gray-900/60 p-6 shadow-inner',
        'prose-headings:text-gray-100 prose-p:text-gray-300 prose-li:text-gray-300',
        'prose-a:text-indigo-400 prose-strong:text-gray-100',
        'prose-code:rounded prose-code:bg-gray-800 prose-code:px-1 prose-code:text-amber-200',
        'prose-pre:bg-gray-950 prose-pre:border prose-pre:border-gray-800',
        className
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
    </div>
  );
}
