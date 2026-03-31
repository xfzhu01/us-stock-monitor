package com.usmonitor.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventVO {

    private Long id;
    private LocalDate eventDate;
    private String category;
    private String title;
    private String summary;
    private String sourceUrl;
    private String sourceName;
    private Integer credibilityScore;
    private Integer impactScore;
    private String sentiment;
    private Boolean isVerified;
    private String rawContent;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
