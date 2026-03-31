package com.usmonitor.domain;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "crawl_logs")
public class CrawlLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "task_name", length = 100)
    private String taskName;

    @Column(name = "source_name", length = 100)
    private String sourceName;

    @Column(length = 10)
    private String status;

    @Column(name = "total_fetched")
    private Integer totalFetched = 0;

    @Column(name = "total_saved")
    private Integer totalSaved = 0;

    @Column(name = "total_duplicate")
    private Integer totalDuplicate = 0;

    @Lob
    @Column(name = "error_msg", columnDefinition = "TEXT")
    private String errorMsg;

    @Column(name = "duration_ms")
    private Integer durationMs;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        createdAt = LocalDateTime.now();
        if (totalFetched == null) {
            totalFetched = 0;
        }
        if (totalSaved == null) {
            totalSaved = 0;
        }
        if (totalDuplicate == null) {
            totalDuplicate = 0;
        }
    }
}
