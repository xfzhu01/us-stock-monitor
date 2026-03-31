package com.usmonitor.repository;

import com.usmonitor.domain.MarketData;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface MarketDataRepository extends JpaRepository<MarketData, Long> {

    Optional<MarketData> findByTradeDate(LocalDate tradeDate);

    Optional<MarketData> findTopByOrderByTradeDateDesc();

    List<MarketData> findByTradeDateBetweenOrderByTradeDateAsc(LocalDate start, LocalDate end);
}
