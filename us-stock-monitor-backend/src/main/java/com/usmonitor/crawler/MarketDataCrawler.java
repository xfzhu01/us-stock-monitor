package com.usmonitor.crawler;

import com.usmonitor.domain.MarketData;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;

@Slf4j
@Component
public class MarketDataCrawler {

    public MarketData fetchLatestMarketData() {
        log.info("MarketDataCrawler.fetchLatestMarketData: stub — would call Yahoo Finance (or similar) for SPX/NDX/VIX");
        MarketData m = new MarketData();
        m.setTradeDate(LocalDate.now());
        m.setSpxClose(BigDecimal.valueOf(0));
        m.setNdxClose(BigDecimal.valueOf(0));
        m.setVixClose(BigDecimal.valueOf(0));
        return m;
    }
}
