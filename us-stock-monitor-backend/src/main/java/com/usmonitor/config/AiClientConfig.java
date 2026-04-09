package com.usmonitor.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.usmonitor.ai.AiClient;
import com.usmonitor.ai.DynamicAiClient;
import com.usmonitor.service.UserAiConfigService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class AiClientConfig {

    @Bean
    public AiClient aiClient(
            AiProperties aiProperties,
            UserAiConfigService userAiConfigService,
            ObjectMapper objectMapper,
            WebClient.Builder webClientBuilder) {
        return new DynamicAiClient(aiProperties, userAiConfigService, objectMapper, webClientBuilder);
    }
}
