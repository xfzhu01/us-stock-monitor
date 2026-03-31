package com.usmonitor.ai;

public interface AiClient {

    String chat(String systemPrompt, String userPrompt);

    ChatResult chatWithMeta(String systemPrompt, String userPrompt);

    String getModelName();

    record ChatResult(String text, Integer inputTokens, Integer totalTokens) {
    }
}
