package com.usmonitor.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.usmonitor.config.AiProperties;
import com.usmonitor.service.UserAiConfigService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.reactive.function.client.WebClient;

@Slf4j
@RequiredArgsConstructor
public class DynamicAiClient implements AiClient {

    private final AiProperties aiProperties;
    private final UserAiConfigService userAiConfigService;
    private final ObjectMapper objectMapper;
    private final WebClient.Builder webClientBuilder;

    @Override
    public String chat(String systemPrompt, String userPrompt) {
        return chatWithMeta(systemPrompt, userPrompt).text();
    }

    @Override
    public ChatResult chatWithMeta(String systemPrompt, String userPrompt) {
        UserAiConfigService.ResolvedAiConfig runtimeConfig = userAiConfigService.getResolvedConfig();
        log.info("Using AI provider {} with model {}", runtimeConfig.provider(), runtimeConfig.model());
        return createDelegate(runtimeConfig).chatWithMeta(systemPrompt, userPrompt);
    }

    @Override
    public String getModelName() {
        return userAiConfigService.getResolvedConfig().model();
    }

    private AiClient createDelegate(UserAiConfigService.ResolvedAiConfig runtimeConfig) {
        AiProperties props = buildRuntimeProperties(runtimeConfig);
        return switch (runtimeConfig.provider()) {
            case "openai" -> new OpenAiClient(props, objectMapper, webClientBuilder);
            case "openrouter" -> new OpenRouterClient(props, objectMapper, webClientBuilder);
            case "gemini" -> new GeminiClient(props, objectMapper, webClientBuilder);
            default -> new ClaudeClient(props, objectMapper, webClientBuilder);
        };
    }

    private AiProperties buildRuntimeProperties(UserAiConfigService.ResolvedAiConfig runtimeConfig) {
        AiProperties props = new AiProperties();
        props.setProvider(runtimeConfig.provider());
        props.setMaxTokens(aiProperties.getMaxTokens());
        props.setTimeoutSeconds(aiProperties.getTimeoutSeconds());

        AiProperties.Claude claude = new AiProperties.Claude();
        claude.setApiUrl(aiProperties.getClaude().getApiUrl());
        claude.setModel(aiProperties.getClaude().getModel());
        claude.setApiKey(aiProperties.getClaude().getApiKey());
        props.setClaude(claude);

        AiProperties.OpenAi openAi = new AiProperties.OpenAi();
        openAi.setApiUrl(aiProperties.getOpenai().getApiUrl());
        openAi.setModel(aiProperties.getOpenai().getModel());
        openAi.setApiKey(aiProperties.getOpenai().getApiKey());
        props.setOpenai(openAi);

        AiProperties.OpenRouter openRouter = new AiProperties.OpenRouter();
        openRouter.setApiUrl(aiProperties.getOpenrouter().getApiUrl());
        openRouter.setModel(aiProperties.getOpenrouter().getModel());
        openRouter.setApiKey(aiProperties.getOpenrouter().getApiKey());
        props.setOpenrouter(openRouter);

        AiProperties.Gemini gemini = new AiProperties.Gemini();
        gemini.setApiUrl(aiProperties.getGemini().getApiUrl());
        gemini.setModel(aiProperties.getGemini().getModel());
        gemini.setApiKey(aiProperties.getGemini().getApiKey());
        props.setGemini(gemini);

        switch (runtimeConfig.provider()) {
            case "openai" -> {
                props.getOpenai().setModel(runtimeConfig.model());
                props.getOpenai().setApiKey(runtimeConfig.apiKey());
            }
            case "openrouter" -> {
                props.getOpenrouter().setModel(runtimeConfig.model());
                props.getOpenrouter().setApiKey(runtimeConfig.apiKey());
            }
            case "gemini" -> {
                props.getGemini().setModel(runtimeConfig.model());
                props.getGemini().setApiKey(runtimeConfig.apiKey());
            }
            default -> {
                props.getClaude().setModel(runtimeConfig.model());
                props.getClaude().setApiKey(runtimeConfig.apiKey());
            }
        }
        return props;
    }
}
