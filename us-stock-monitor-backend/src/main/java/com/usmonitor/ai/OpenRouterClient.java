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
public class OpenRouterClient implements AiClient {

    private final AiProperties.OpenRouter config;
    private final int timeoutSeconds;
    private final int maxTokens;
    private final ObjectMapper objectMapper;
    private final WebClient webClient;

    public OpenRouterClient(AiProperties props, ObjectMapper objectMapper, WebClient.Builder webClientBuilder) {
        this.config = props.getOpenrouter();
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
            log.warn("OpenRouter API key not configured; skipping chat call");
            return new ChatResult("", null, null);
        }

        Map<String, Object> body = Map.of(
                "model", config.getModel(),
                "max_tokens", maxTokens,
                "temperature", 0,
                "messages", List.of(
                        Map.of("role", "system", "content", systemPrompt),
                        Map.of("role", "user", "content", userPrompt)
                )
        );

        Mono<String> mono = webClient.post()
                .uri(config.getApiUrl())
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + config.getApiKey())
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .header("HTTP-Referer", "https://us-stock-monitor")
                .header("X-Title", "US Stock Monitor")
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
            JsonNode choices = root.path("choices");
            if (choices.isArray() && !choices.isEmpty()) {
                text = choices.get(0).path("message").path("content").asText("");
            }
            Integer promptTokens = root.path("usage").path("prompt_tokens").canConvertToInt()
                    ? root.path("usage").path("prompt_tokens").asInt() : null;
            Integer totalTokens = root.path("usage").path("total_tokens").canConvertToInt()
                    ? root.path("usage").path("total_tokens").asInt() : null;
            return new ChatResult(text, promptTokens, totalTokens);
        } catch (Exception e) {
            log.error("OpenRouter API call failed", e);
            return new ChatResult("", null, null);
        }
    }

    @Override
    public String getModelName() {
        return config.getModel();
    }
}
