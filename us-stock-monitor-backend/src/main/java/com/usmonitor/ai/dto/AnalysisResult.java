package com.usmonitor.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalysisResult {

    private Integer spxBullProb7d;
    private Integer spxBullProb30d;
    private Integer ndxBullProb7d;
    private Integer ndxBullProb30d;
    private String signal;
    private List<String> keyRisks;
    private List<String> keyTailwinds;
    private String report;
}
