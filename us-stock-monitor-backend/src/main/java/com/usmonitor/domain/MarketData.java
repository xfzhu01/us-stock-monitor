package com.usmonitor.domain;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "market_data")
public class MarketData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "trade_date", nullable = false, unique = true)
    private LocalDate tradeDate;

    @Column(name = "spx_open", precision = 10, scale = 2)
    private BigDecimal spxOpen;

    @Column(name = "spx_close", precision = 10, scale = 2)
    private BigDecimal spxClose;

    @Column(name = "spx_change_pct", precision = 6, scale = 3)
    private BigDecimal spxChangePct;

    @Column(name = "ndx_open", precision = 10, scale = 2)
    private BigDecimal ndxOpen;

    @Column(name = "ndx_close", precision = 10, scale = 2)
    private BigDecimal ndxClose;

    @Column(name = "ndx_change_pct", precision = 6, scale = 3)
    private BigDecimal ndxChangePct;

    @Column(name = "vix_close", precision = 6, scale = 2)
    private BigDecimal vixClose;

    @Column(name = "us10y_yield", precision = 5, scale = 3)
    private BigDecimal us10yYield;

    @Column(name = "dxy", precision = 7, scale = 3)
    private BigDecimal dxy;

    @Column(name = "fed_funds_rate", precision = 5, scale = 3)
    private BigDecimal fedFundsRate;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
