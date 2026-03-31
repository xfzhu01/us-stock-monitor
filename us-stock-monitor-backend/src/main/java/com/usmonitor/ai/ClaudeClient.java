package com.usmonitor.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.usmonitor.ai.dto.ClaudeRequest;
import com.usmonitor.ai.dto.ClaudeResponse;
import com.usmonitor.config.AiProperties;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.List;

@Slf4j
public class ClaudeClient implements AiClient {

    private final AiProperties.Claude config;
    private final int timeoutSeconds;
    private final int maxTokens;
    private final ObjectMapper objectMapper;
    private final WebClient webClient;

    public ClaudeClient(AiProperties props, ObjectMapper objectMapper, WebClient.Builder webClientBuilder) {
        this.config = props.getClaude();
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
            log.warn("Claude API key not configured; skipping chat call");
            return new ChatResult("", null, null);
        }

        ClaudeRequest body = ClaudeRequest.builder()
                .model(config.getModel())
                .maxTokens(maxTokens)
                .temperature(0)
                .system(systemPrompt)
                .messages(List.of(ClaudeRequest.Message.builder()
                        .role("user")
                        .content(userPrompt)
                        .build()))
                .build();

        Mono<String> mono = webClient.post()
                .uri(config.getApiUrl())
                .header("x-api-key", config.getApiKey())
                .header("anthropic-version", "2023-06-01")
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
            ClaudeResponse parsed = objectMapper.readValue(raw, ClaudeResponse.class);
            String text = extractText(parsed);
            Integer inTok = parsed.getUsage() != null ? parsed.getUsage().getInputTokens() : null;
            Integer outTok = parsed.getUsage() != null ? parsed.getUsage().getOutputTokens() : null;
            Integer total = (inTok != null && outTok != null) ? inTok + outTok : null;
            return new ChatResult(text, inTok, total);
        } catch (Exception e) {
            log.error("Claude API call failed", e);
            return new ChatResult("", null, null);
        }
    }

    @Override
    public String getModelName() {
        return config.getModel();
    }

    private String extractText(ClaudeResponse response) {
        if (response == null || response.getContent() == null) {
            return "";
        }
        StringBuilder sb = new StringBuilder();
        for (ClaudeResponse.ContentBlock block : response.getContent()) {
            if ("text".equals(block.getType()) && block.getText() != null) {
                sb.append(block.getText());
            }
        }
        return sb.toString();
    }
}
