package com.usmonitor.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FundPositionVO {

    private Long id;
    private String fundName;
    private String managerName;
    private String ticker;
    private String companyName;
    private String action;
    private Long sharesChange;
    private Long sharesTotal;
    private Long valueUsd;
    private BigDecimal portfolioPct;
    private String quarter;
    private LocalDate filingDate;
    private String sourceUrl;
    private LocalDateTime createdAt;
}
