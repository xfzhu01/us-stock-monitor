package com.usmonitor.domain;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "events", indexes = {
        @Index(name = "idx_events_event_date", columnList = "event_date"),
        @Index(name = "idx_events_category", columnList = "category"),
        @Index(name = "idx_events_sentiment", columnList = "sentiment"),
        @Index(name = "idx_events_is_verified", columnList = "is_verified")
})
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "event_date", nullable = false)
    private LocalDate eventDate;

    @Column(length = 100)
    private String category;

    @Column(length = 300, nullable = false)
    private String title;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String summary;

    @Column(name = "source_url", length = 500)
    private String sourceUrl;

    @Column(name = "source_name", length = 100)
    private String sourceName;

    @Column(name = "credibility_score")
    private Integer credibilityScore;

    @Column(name = "impact_score")
    private Integer impactScore;

    @Column(length = 10)
    private String sentiment;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String sources;

    @Column(name = "is_verified", nullable = false)
    private Boolean isVerified = false;

    @Lob
    @Column(name = "raw_content", columnDefinition = "LONGTEXT")
    private String rawContent;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
        if (isVerified == null) {
            isVerified = false;
        }
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
