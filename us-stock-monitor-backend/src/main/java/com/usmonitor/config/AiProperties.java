package com.usmonitor.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "app.ai")
public class AiProperties {

    private String provider = "claude";
    private int maxTokens = 4096;
    private int timeoutSeconds = 120;

    private Claude claude = new Claude();
    private OpenAi openai = new OpenAi();
    private OpenRouter openrouter = new OpenRouter();
    private Gemini gemini = new Gemini();

    @Data
    public static class Claude {
        private String apiKey = "";
        private String apiUrl = "https://api.anthropic.com/v1/messages";
        private String model = "claude-sonnet-4-20250514";
    }

    @Data
    public static class OpenAi {
        private String apiKey = "";
        private String apiUrl = "https://api.openai.com/v1/chat/completions";
        private String model = "gpt-4o";
    }

    @Data
    public static class OpenRouter {
        private String apiKey = "";
        private String apiUrl = "https://openrouter.ai/api/v1/chat/completions";
        private String model = "google/gemma-4-26b-a4b-it:free";
    }

    @Data
    public static class Gemini {
        private String apiKey = "";
        private String apiUrl = "https://generativelanguage.googleapis.com/v1beta/models";
        private String model = "gemini-2.0-flash";
    }
}
