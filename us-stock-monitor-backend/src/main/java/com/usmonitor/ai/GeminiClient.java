package com.usmonitor.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.usmonitor.config.AiProperties;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.List;
import java.util.Map;

@Slf4j
public class GeminiClient implements AiClient {

    private final AiProperties.Gemini config;
    private final int timeoutSeconds;
    private final int maxTokens;
    private final ObjectMapper objectMapper;
    private final WebClient webClient;

    public GeminiClient(AiProperties props, ObjectMapper objectMapper, WebClient.Builder webClientBuilder) {
        this.config = props.getGemini();
        this.timeoutSeconds = props.getTimeoutSeconds();
        this.maxTokens = props.getMaxTokens();
        this.objectMapper = objectMapper;
        this.webClient = webClientBuilder.build();
    }

    @Override
    public String chat(String systemPrompt, String userPrompt) {
        return chatWithMeta(systemPrompt, userPrompt).text();
    }

    @Override
    public ChatResult chatWithMeta(String systemPrompt, String userPrompt) {
        if (config.getApiKey() == null || config.getApiKey().isBlank()) {
            log.warn("Gemini API key not configured; skipping chat call");
            return new ChatResult("", null, null);
        }

        String url = config.getApiUrl() + "/" + config.getModel() + ":generateContent?key=" + config.getApiKey();

        Map<String, Object> body = Map.of(
                "system_instruction", Map.of(
                        "parts", List.of(Map.of("text", systemPrompt))
                ),
                "contents", List.of(
                        Map.of("parts", List.of(Map.of("text", userPrompt)))
                ),
                "generationConfig", Map.of(
                        "temperature", 0,
                        "maxOutputTokens", maxTokens
                )
        );

        Mono<String> mono = webClient.post()
                .uri(url)
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .bodyValue(body)
                .retrieve()
                .bodyToMono(String.class)
                .timeout(Duration.ofSeconds(timeoutSeconds));

        try {
            String raw = mono.block();
            if (raw == null || raw.isBlank()) {
                return new ChatResult("", null, null);
            }
            JsonNode root = objectMapper.readTree(raw);
            String text = "";
            JsonNode candidates = root.path("candidates");
            if (candidates.isArray() && !candidates.isEmpty()) {
                JsonNode parts = candidates.get(0).path("content").path("parts");
                if (parts.isArray() && !parts.isEmpty()) {
                    text = parts.get(0).path("text").asText("");
                }
            }
            Integer promptTokens = root.path("usageMetadata").path("promptTokenCount").canConvertToInt()
                    ? root.path("usageMetadata").path("promptTokenCount").asInt() : null;
            Integer totalTokens = root.path("usageMetadata").path("totalTokenCount").canConvertToInt()
                    ? root.path("usageMetadata").path("totalTokenCount").asInt() : null;
            return new ChatResult(text, promptTokens, totalTokens);
        } catch (Exception e) {
            log.error("Gemini API call failed", e);
            return new ChatResult("", null, null);
        }
    }

    @Override
    public String getModelName() {
        return config.getModel();
    }
}
