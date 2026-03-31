package com.usmonitor.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "app.claude")
public class ClaudeProperties {

    private String apiKey = "";
    private String apiUrl = "https://api.anthropic.com/v1/messages";
    private String model = "claude-sonnet-4-20250514";
    private int maxTokens = 4096;
    private int timeoutSeconds = 120;
}
