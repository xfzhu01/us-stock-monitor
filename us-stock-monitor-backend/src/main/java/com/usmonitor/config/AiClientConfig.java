package com.usmonitor.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.usmonitor.ai.AiClient;
import com.usmonitor.ai.ClaudeClient;
import com.usmonitor.ai.GeminiClient;
import com.usmonitor.ai.OpenAiClient;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Slf4j
@Configuration
public class AiClientConfig {

    @Bean
    public AiClient aiClient(AiProperties aiProperties, ObjectMapper objectMapper, WebClient.Builder webClientBuilder) {
        String provider = aiProperties.getProvider().toLowerCase().trim();
        AiClient client = switch (provider) {
            case "openai", "chatgpt" -> new OpenAiClient(aiProperties, objectMapper, webClientBuilder);
            case "gemini", "google" -> new GeminiClient(aiProperties, objectMapper, webClientBuilder);
            default -> new ClaudeClient(aiProperties, objectMapper, webClientBuilder);
        };
        log.info("AI provider configured: {} (model: {})", provider, client.getModelName());
        return client;
    }
}
