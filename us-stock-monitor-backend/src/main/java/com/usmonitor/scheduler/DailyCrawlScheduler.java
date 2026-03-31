package com.usmonitor.scheduler;

import com.usmonitor.crawler.NewsCrawlerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DailyCrawlScheduler {

    private final NewsCrawlerService newsCrawlerService;

    @Scheduled(cron = "0 0 18 * * MON-FRI", zone = "Asia/Shanghai")
    public void runDailyCrawl() {
        log.debug("DailyCrawlScheduler: starting news crawl");
        newsCrawlerService.crawlAll();
    }
}
