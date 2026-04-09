package com.usmonitor.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AiConfigVO {

    private String provider;
    private String model;
    private boolean hasApiKey;
    private String apiKeyMasked;
    private LocalDateTime updatedAt;
}
