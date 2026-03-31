package com.usmonitor.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.usmonitor.ai.dto.ClaudeRequest;
import com.usmonitor.ai.dto.ClaudeResponse;
import com.usmonitor.config.ClaudeProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class ClaudeClient {

    private final ClaudeProperties claudeProperties;
    private final ObjectMapper objectMapper;
    private final WebClient.Builder webClientBuilder;

    public String chat(String systemPrompt, String userPrompt) {
        return chatWithMeta(systemPrompt, userPrompt).text();
    }

    public ClaudeChatResult chatWithMeta(String systemPrompt, String userPrompt) {
        if (claudeProperties.getApiKey() == null || claudeProperties.getApiKey().isBlank()) {
            log.warn("Claude API key not configured; skipping chat call");
            return new ClaudeChatResult("", null, null);
        }

        ClaudeRequest body = ClaudeRequest.builder()
                .model(claudeProperties.getModel())
                .maxTokens(claudeProperties.getMaxTokens())
                .temperature(0)
                .system(systemPrompt)
                .messages(List.of(ClaudeRequest.Message.builder()
                        .role("user")
                        .content(userPrompt)
                        .build()))
                .build();

        WebClient client = webClientBuilder
                .baseUrl("")
                .build();

        Mono<String> mono = client.post()
                .uri(claudeProperties.getApiUrl())
                .header("x-api-key", claudeProperties.getApiKey())
                .header("anthropic-version", "2023-06-01")
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .bodyValue(body)
                .retrieve()
                .bodyToMono(String.class)
                .timeout(Duration.ofSeconds(claudeProperties.getTimeoutSeconds()));

        try {
            String raw = mono.block();
            if (raw == null || raw.isBlank()) {
                return new ClaudeChatResult("", null, null);
            }
            ClaudeResponse parsed = objectMapper.readValue(raw, ClaudeResponse.class);
            String text = extractText(parsed);
            Integer inTok = parsed.getUsage() != null ? parsed.getUsage().getInputTokens() : null;
            Integer outTok = parsed.getUsage() != null ? parsed.getUsage().getOutputTokens() : null;
            Integer total = (inTok != null && outTok != null) ? inTok + outTok : null;
            return new ClaudeChatResult(text, inTok, total);
        } catch (Exception e) {
            log.error("Claude API call failed", e);
            return new ClaudeChatResult("", null, null);
        }
    }

    public record ClaudeChatResult(String text, Integer inputTokens, Integer totalTokens) {
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
