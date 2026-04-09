'use client';

import {
  AlertCircle,
  CheckCircle2,
  Landmark,
  Loader2,
  Newspaper,
  Save,
  TrendingUp,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { TopBar } from '@/components/layout/TopBar';
import {
  fetchAiConfig,
  triggerAnalysis,
  triggerFundCrawl,
  triggerNewsCrawl,
  updateAiConfig,
} from '@/lib/api';
import { cn } from '@/lib/utils';
import type { AiConfigVO } from '@/types/ai';

type TaskStatus = 'idle' | 'running' | 'success' | 'error';
type Provider = AiConfigVO['provider'];

interface TaskResult {
  status: TaskStatus;
  message: string;
  detail?: Record<string, unknown>;
}

interface AiConfigFormState {
  provider: Provider;
  model: string;
  apiKey: string;
}

const initialResult: TaskResult = { status: 'idle', message: '' };
const PROVIDER_LABELS: Record<Provider, string> = {
  claude: 'Claude',
  openai: 'OpenAI',
  openrouter: 'OpenRouter',
  gemini: 'Gemini',
};
const MODEL_OPTIONS: Record<Provider, string[]> = {
  claude: ['claude-sonnet-4-20250514', 'claude-3-7-sonnet-latest', 'claude-3-5-sonnet-latest'],
  openai: ['gpt-4o', 'gpt-4.1', 'gpt-4.1-mini'],
  openrouter: [
    'google/gemma-4-26b-a4b-it:free',
    'anthropic/claude-3.7-sonnet',
    'openai/gpt-4o-mini',
  ],
  gemini: ['gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-1.5-pro'],
};

function StatusIcon({ status }: { status: TaskStatus }) {
  if (status === 'running') {
    return <Loader2 className="h-5 w-5 animate-spin text-indigo-400" />;
  }
  if (status === 'success') {
    return <CheckCircle2 className="h-5 w-5 text-green-400" />;
  }
  if (status === 'error') {
    return <AlertCircle className="h-5 w-5 text-red-400" />;
  }
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
  const [configInfo, setConfigInfo] = useState<AiConfigVO | null>(null);
  const [configForm, setConfigForm] = useState<AiConfigFormState>({
    provider: 'openrouter',
    model: MODEL_OPTIONS.openrouter[0],
    apiKey: '',
  });
  const [configResult, setConfigResult] = useState<TaskResult>({
    status: 'running',
    message: '正在加载当前 AI 配置…',
  });

  const modelSuggestions = useMemo(
    () => MODEL_OPTIONS[configForm.provider] ?? [],
    [configForm.provider]
  );

  const loadAiConfig = useCallback(async () => {
    setConfigResult({ status: 'running', message: '正在加载当前 AI 配置…' });
    try {
      const data = await fetchAiConfig();
      setConfigInfo(data);
      setConfigForm({ provider: data.provider, model: data.model, apiKey: '' });
      setConfigResult({
        status: 'success',
        message: data.hasApiKey
          ? `当前使用 ${PROVIDER_LABELS[data.provider]} / ${data.model}`
          : `当前使用 ${PROVIDER_LABELS[data.provider]} / ${data.model}，但尚未配置 API Key`,
      });
    } catch (e: unknown) {
      setConfigResult({
        status: 'error',
        message: e instanceof Error ? e.message : '加载 AI 配置失败',
      });
    }
  }, []);

  useEffect(() => {
    void loadAiConfig();
  }, [loadAiConfig]);

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
    const modelLabel = configInfo
      ? `${PROVIDER_LABELS[configInfo.provider]} / ${configInfo.model}`
      : '当前保存配置';
    setAnalysisResult({
      status: 'running',
      message: `正在使用 ${modelLabel} 生成 AI 分析报告…`,
    });
    try {
      const msg = await triggerAnalysis();
      setAnalysisResult({
        status: 'success',
        message: `${modelLabel}：${String(msg)}`,
      });
    } catch (e: unknown) {
      setAnalysisResult({
        status: 'error',
        message: e instanceof Error ? e.message : '生成失败',
      });
    }
  }, [configInfo]);

  const handleProviderChange = useCallback((provider: Provider) => {
    setConfigForm((prev) => ({
      provider,
      model: MODEL_OPTIONS[provider].includes(prev.model)
        ? prev.model
        : MODEL_OPTIONS[provider][0],
      apiKey: prev.apiKey,
    }));
  }, []);

  const handleSaveAiConfig = useCallback(async () => {
    const model = configForm.model.trim();
    if (!model) {
      setConfigResult({ status: 'error', message: '请先填写模型 ID' });
      return;
    }

    setConfigResult({ status: 'running', message: '正在保存 AI 配置…' });
    try {
      const saved = await updateAiConfig({
        provider: configForm.provider,
        model,
        apiKey: configForm.apiKey.trim() || undefined,
      });
      setConfigInfo(saved);
      setConfigForm((prev) => ({ ...prev, model, apiKey: '' }));
      setConfigResult({
        status: 'success',
        message: `已保存 ${PROVIDER_LABELS[saved.provider]} / ${saved.model}`,
      });
    } catch (e: unknown) {
      setConfigResult({
        status: 'error',
        message: e instanceof Error ? e.message : '保存 AI 配置失败',
      });
    }
  }, [configForm]);

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
      description: '基于已抓取的事件和市场数据，按当前保存的模型与 API Key 生成趋势分析报告',
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

        <section className="rounded-xl border border-gray-800 bg-gray-900/90 p-5 shadow-lg">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">AI 模型配置</h2>
              <p className="text-sm text-gray-400">
                在这里保存当前用户使用的大模型配置。后端后续所有大模型请求都会读取这份配置。
              </p>
            </div>
            {configInfo && (
              <div className="rounded-lg border border-gray-800 bg-gray-950/70 px-3 py-2 text-xs text-gray-400">
                当前配置：{PROVIDER_LABELS[configInfo.provider]} / {configInfo.model}
                <br />
                API Key：{configInfo.hasApiKey ? configInfo.apiKeyMasked || '已保存' : '未配置'}
              </div>
            )}
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            <label className="space-y-2 text-sm text-gray-300">
              <span>服务商</span>
              <select
                value={configForm.provider}
                onChange={(e) => handleProviderChange(e.target.value as Provider)}
                className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-gray-100 outline-none transition focus:border-indigo-500"
              >
                {Object.entries(PROVIDER_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2 text-sm text-gray-300 lg:col-span-2">
              <span>模型 ID</span>
              <input
                list="ai-model-options"
                value={configForm.model}
                onChange={(e) =>
                  setConfigForm((prev) => ({ ...prev, model: e.target.value }))
                }
                placeholder="输入模型名称，例如 gpt-4o"
                className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-gray-100 outline-none transition focus:border-indigo-500"
              />
              <datalist id="ai-model-options">
                {modelSuggestions.map((model) => (
                  <option key={model} value={model} />
                ))}
              </datalist>
            </label>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
            <label className="space-y-2 text-sm text-gray-300">
              <span>API Key</span>
              <input
                type="password"
                value={configForm.apiKey}
                onChange={(e) =>
                  setConfigForm((prev) => ({ ...prev, apiKey: e.target.value }))
                }
                placeholder={
                  configInfo?.hasApiKey
                    ? `留空则保留当前 Key（${configInfo.apiKeyMasked}）`
                    : '输入当前模型服务商的 API Key'
                }
                className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-gray-100 outline-none transition focus:border-indigo-500"
              />
            </label>

            <button
              type="button"
              onClick={handleSaveAiConfig}
              disabled={configResult.status === 'running'}
              className={cn(
                'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition',
                configResult.status === 'running'
                  ? 'cursor-not-allowed bg-gray-800 text-gray-500'
                  : 'bg-indigo-600 text-white hover:bg-indigo-500 active:bg-indigo-700'
              )}
            >
              {configResult.status === 'running' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  保存中…
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  保存配置
                </>
              )}
            </button>
          </div>

          {configResult.status !== 'idle' && (
            <div
              className={cn(
                'mt-4 flex items-start gap-2 rounded-lg p-3',
                configResult.status === 'running' && 'bg-indigo-950/50 text-indigo-300',
                configResult.status === 'success' && 'bg-green-950/50 text-green-300',
                configResult.status === 'error' && 'bg-red-950/50 text-red-300'
              )}
            >
              <StatusIcon status={configResult.status} />
              <span className="text-sm">{configResult.message}</span>
            </div>
          )}
        </section>

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
