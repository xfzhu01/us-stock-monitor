package com.usmonitor.scheduler;

import com.usmonitor.crawler.MarketDataCrawler;
import com.usmonitor.service.MarketDataService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class MarketDataScheduler {

    private final MarketDataCrawler marketDataCrawler;
    private final MarketDataService marketDataService;

    @Scheduled(cron = "0 0 6 * * TUE-SAT", zone = "Asia/Shanghai")
    public void ingestMarketData() {
        log.debug("MarketDataScheduler: fetching latest market data");
        marketDataService.save(marketDataCrawler.fetchLatestMarketData());
    }
}
