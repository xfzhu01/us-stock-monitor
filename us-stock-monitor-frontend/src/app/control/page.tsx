'use client';

import {
  AlertCircle,
  CheckCircle2,
  Landmark,
  Loader2,
  Newspaper,
  TrendingUp,
} from 'lucide-react';
import { useCallback, useState } from 'react';

import { TopBar } from '@/components/layout/TopBar';
import { triggerAnalysis, triggerFundCrawl, triggerNewsCrawl } from '@/lib/api';
import { cn } from '@/lib/utils';

type TaskStatus = 'idle' | 'running' | 'success' | 'error';

interface TaskResult {
  status: TaskStatus;
  message: string;
  detail?: Record<string, unknown>;
}

const initialResult: TaskResult = { status: 'idle', message: '' };

function StatusIcon({ status }: { status: TaskStatus }) {
  if (status === 'running')
    return <Loader2 className="h-5 w-5 animate-spin text-indigo-400" />;
  if (status === 'success')
    return <CheckCircle2 className="h-5 w-5 text-green-400" />;
  if (status === 'error')
    return <AlertCircle className="h-5 w-5 text-red-400" />;
  return null;
}

function ResultDetail({ detail }: { detail?: Record<string, unknown> }) {
  if (!detail || Object.keys(detail).length === 0) return null;
  return (
    <div className="mt-3 rounded-lg bg-gray-950 p-3 font-mono text-xs text-gray-400">
      {Object.entries(detail).map(([k, v]) => (
        <div key={k} className="flex justify-between py-0.5">
          <span className="text-gray-500">{k}</span>
          <span className="text-gray-200">{String(v)}</span>
        </div>
      ))}
    </div>
  );
}

export default function ControlPage() {
  const [newsResult, setNewsResult] = useState<TaskResult>(initialResult);
  const [fundResult, setFundResult] = useState<TaskResult>(initialResult);
  const [analysisResult, setAnalysisResult] = useState<TaskResult>(initialResult);

  const handleNewsCrawl = useCallback(async () => {
    setNewsResult({ status: 'running', message: '正在抓取新闻事件…' });
    try {
      const data = await triggerNewsCrawl();
      setNewsResult({
        status: 'success',
        message: `抓取完成：获取 ${data.totalFetched} 条，保存 ${data.totalSaved} 条，重复 ${data.totalDuplicate} 条`,
        detail: data,
      });
    } catch (e: unknown) {
      setNewsResult({
        status: 'error',
        message: e instanceof Error ? e.message : '抓取失败',
      });
    }
  }, []);

  const handleFundCrawl = useCallback(async () => {
    setFundResult({ status: 'running', message: '正在抓取基金持仓变动…' });
    try {
      const data = await triggerFundCrawl();
      setFundResult({
        status: 'success',
        message: `抓取完成：获取 ${data.totalFetched} 条，保存 ${data.totalSaved} 条`,
        detail: data,
      });
    } catch (e: unknown) {
      setFundResult({
        status: 'error',
        message: e instanceof Error ? e.message : '抓取失败',
      });
    }
  }, []);

  const handleAnalysis = useCallback(async () => {
    setAnalysisResult({ status: 'running', message: '正在生成 AI 分析报告…' });
    try {
      const msg = await triggerAnalysis();
      setAnalysisResult({ status: 'success', message: String(msg) });
    } catch (e: unknown) {
      setAnalysisResult({
        status: 'error',
        message: e instanceof Error ? e.message : '生成失败',
      });
    }
  }, []);

  const tasks = [
    {
      key: 'news',
      title: '事件抓取',
      description: '从 RSS 数据源抓取最新新闻事件并保存到数据库',
      icon: Newspaper,
      color: 'from-blue-600 to-blue-800',
      borderColor: 'border-blue-500/30',
      result: newsResult,
      onTrigger: handleNewsCrawl,
    },
    {
      key: 'fund',
      title: '基金持仓变动',
      description: '从 SEC EDGAR 抓取最新 13F 持仓变动数据',
      icon: Landmark,
      color: 'from-emerald-600 to-emerald-800',
      borderColor: 'border-emerald-500/30',
      result: fundResult,
      onTrigger: handleFundCrawl,
    },
    {
      key: 'analysis',
      title: 'AI 分析报告',
      description: '基于已抓取的事件和市场数据，调用 AI 生成当日趋势分析报告',
      icon: TrendingUp,
      color: 'from-purple-600 to-purple-800',
      borderColor: 'border-purple-500/30',
      result: analysisResult,
      onTrigger: handleAnalysis,
    },
  ];

  return (
    <div className="flex flex-1 flex-col">
      <TopBar title="控制面板" showDatePicker={false} />
      <main className="flex-1 space-y-6 p-4 lg:p-8">
        <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4">
          <p className="text-sm text-gray-400">
            手动触发数据抓取和 AI 分析任务。建议执行顺序：
            <span className="font-medium text-gray-200"> 事件抓取 → 基金持仓 → AI 分析</span>
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {tasks.map(({ key, title, description, icon: Icon, color, borderColor, result, onTrigger }) => (
            <div
              key={key}
              className={cn(
                'flex flex-col rounded-xl border bg-gray-900/90 shadow-lg transition',
                result.status === 'running' ? borderColor : 'border-gray-800'
              )}
            >
              <div className={cn('rounded-t-xl bg-gradient-to-r px-5 py-4', color)}>
                <div className="flex items-center gap-3">
                  <Icon className="h-6 w-6 text-white/90" />
                  <h3 className="text-lg font-semibold text-white">{title}</h3>
                </div>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <p className="text-sm leading-relaxed text-gray-400">{description}</p>

                <div className="mt-4 flex-1">
                  {result.status !== 'idle' && (
                    <div
                      className={cn(
                        'flex items-start gap-2 rounded-lg p-3',
                        result.status === 'running' && 'bg-indigo-950/50 text-indigo-300',
                        result.status === 'success' && 'bg-green-950/50 text-green-300',
                        result.status === 'error' && 'bg-red-950/50 text-red-300'
                      )}
                    >
                      <StatusIcon status={result.status} />
                      <span className="text-sm">{result.message}</span>
                    </div>
                  )}
                  <ResultDetail detail={result.detail} />
                </div>

                <button
                  type="button"
                  disabled={result.status === 'running'}
                  onClick={onTrigger}
                  className={cn(
                    'mt-4 w-full rounded-lg px-4 py-2.5 text-sm font-medium transition',
                    result.status === 'running'
                      ? 'cursor-not-allowed bg-gray-800 text-gray-500'
                      : 'bg-indigo-600 text-white hover:bg-indigo-500 active:bg-indigo-700'
                  )}
                >
                  {result.status === 'running' ? '执行中…' : '执行'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
