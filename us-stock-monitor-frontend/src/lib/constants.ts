export const CATEGORIES = {
  FED: { label: '美联储', color: 'bg-purple-500' },
  MACRO: { label: '宏观数据', color: 'bg-blue-500' },
  GEOPOLITICAL: { label: '地缘政治', color: 'bg-red-500' },
  EARNINGS: { label: '财报', color: 'bg-amber-500' },
  FUND: { label: '基金动向', color: 'bg-emerald-500' },
  TECH_POLICY: { label: '科技政策', color: 'bg-cyan-500' },
  OTHER: { label: '其他', color: 'bg-gray-500' },
};

export const SIGNALS = {
  strong_bull: { label: '强烈看涨', color: 'bg-green-600', textColor: 'text-green-600' },
  bull: { label: '偏多', color: 'bg-green-400', textColor: 'text-green-500' },
  neutral: { label: '中性', color: 'bg-gray-400', textColor: 'text-gray-500' },
  bear: { label: '偏空', color: 'bg-red-400', textColor: 'text-red-500' },
  strong_bear: { label: '强烈看跌', color: 'bg-red-600', textColor: 'text-red-600' },
};

export const SENTIMENTS = {
  BULLISH: { label: '看涨', color: 'text-green-500', bg: 'bg-green-100' },
  BEARISH: { label: '看跌', color: 'text-red-500', bg: 'bg-red-100' },
  NEUTRAL: { label: '中性', color: 'text-gray-500', bg: 'bg-gray-100' },
};

export const ACTIONS = {
  NEW: { label: '新建仓', color: 'text-green-400', bg: 'bg-green-500/20' },
  ADD: { label: '加仓', color: 'text-green-400', bg: 'bg-green-500/20' },
  REDUCE: { label: '减仓', color: 'text-red-400', bg: 'bg-red-500/20' },
  CLOSE: { label: '清仓', color: 'text-red-500', bg: 'bg-red-500/30' },
};
