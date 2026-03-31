package com.usmonitor.domain;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "fund_positions", indexes = {
        @Index(name = "idx_fund_positions_fund_quarter", columnList = "fund_name, quarter"),
        @Index(name = "idx_fund_positions_ticker", columnList = "ticker"),
        @Index(name = "idx_fund_positions_filing_date", columnList = "filing_date")
})
public class FundPosition {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "fund_name", length = 100)
    private String fundName;

    @Column(name = "manager_name", length = 100)
    private String managerName;

    @Column(length = 10)
    private String ticker;

    @Column(name = "company_name", length = 200)
    private String companyName;

    @Column(length = 10)
    private String action;

    @Column(name = "shares_change")
    private Long sharesChange;

    @Column(name = "shares_total")
    private Long sharesTotal;

    @Column(name = "value_usd")
    private Long valueUsd;

    @Column(name = "portfolio_pct", precision = 5, scale = 2)
    private BigDecimal portfolioPct;

    @Column(length = 6)
    private String quarter;

    @Column(name = "filing_date")
    private LocalDate filingDate;

    @Column(name = "source_url", length = 500)
    private String sourceUrl;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
