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
public class MarketDataVO {

    private Long id;
    private LocalDate tradeDate;
    private BigDecimal spxOpen;
    private BigDecimal spxClose;
    private BigDecimal spxChangePct;
    private BigDecimal ndxOpen;
    private BigDecimal ndxClose;
    private BigDecimal ndxChangePct;
    private BigDecimal vixClose;
    private BigDecimal us10yYield;
    private BigDecimal dxy;
    private BigDecimal fedFundsRate;
    private LocalDateTime createdAt;
}
