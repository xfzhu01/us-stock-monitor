export interface AiConfigVO {
  provider: 'claude' | 'openai' | 'openrouter' | 'gemini';
  model: string;
  hasApiKey: boolean;
  apiKeyMasked: string;
  updatedAt: string | null;
}

export interface AiConfigUpdatePayload {
  provider: AiConfigVO['provider'];
  model: string;
  apiKey?: string;
}
