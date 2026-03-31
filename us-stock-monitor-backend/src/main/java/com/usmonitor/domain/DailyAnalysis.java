package com.usmonitor.domain;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "daily_analysis")
public class DailyAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "analysis_date", nullable = false, unique = true)
    private LocalDate analysisDate;

    @Column(name = "spx_bull_prob_7d")
    private Integer spxBullProb7d;

    @Column(name = "spx_bull_prob_30d")
    private Integer spxBullProb30d;

    @Column(name = "ndx_bull_prob_7d")
    private Integer ndxBullProb7d;

    @Column(name = "ndx_bull_prob_30d")
    private Integer ndxBullProb30d;

    @Column(length = 15)
    private String signal;

    @Column(name = "key_risks", columnDefinition = "TEXT")
    private String keyRisks;

    @Column(name = "key_tailwinds", columnDefinition = "TEXT")
    private String keyTailwinds;

    @Column(name = "event_ids_used", columnDefinition = "TEXT")
    private String eventIdsUsed;

    @Lob
    @Column(name = "report_markdown", columnDefinition = "LONGTEXT")
    private String reportMarkdown;

    @Column(name = "model_version", length = 50)
    private String modelVersion;

    @Column(name = "token_count")
    private Integer tokenCount;

    @Column(name = "generated_at")
    private LocalDateTime generatedAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        if (generatedAt == null) {
            generatedAt = now;
        }
    }
}
