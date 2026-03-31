package com.usmonitor.ai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

@Data
public class ClaudeResponse {

    private String id;
    private List<ContentBlock> content;
    private Usage usage;

    @Data
    public static class ContentBlock {
        private String type;
        private String text;
    }

    @Data
    public static class Usage {
        @JsonProperty("input_tokens")
        private Integer inputTokens;
        @JsonProperty("output_tokens")
        private Integer outputTokens;
    }
}
