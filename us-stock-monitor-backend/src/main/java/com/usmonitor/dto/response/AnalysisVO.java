package com.usmonitor.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalysisVO {

    private Long id;
    private LocalDate analysisDate;
    private Integer spxBullProb7d;
    private Integer spxBullProb30d;
    private Integer ndxBullProb7d;
    private Integer ndxBullProb30d;
    private String trendSignal;
    private List<String> keyRisks;
    private List<String> keyTailwinds;
    private List<Long> eventIdsUsed;
    private String reportMarkdown;
    private String modelVersion;
    private Integer tokenCount;
    private LocalDateTime generatedAt;
    private LocalDateTime createdAt;
}
