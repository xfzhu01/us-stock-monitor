package com.usmonitor.scheduler;

import com.usmonitor.domain.DailyAnalysis;
import com.usmonitor.service.AiAnalysisService;
import com.usmonitor.service.AnalysisService;
import com.usmonitor.service.EventService;
import com.usmonitor.service.FundPositionService;
import com.usmonitor.service.MarketDataService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Slf4j
@Component
@RequiredArgsConstructor
public class DailyAnalysisScheduler {

    private final EventService eventService;
    private final FundPositionService fundPositionService;
    private final MarketDataService marketDataService;
    private final AiAnalysisService aiAnalysisService;
    private final AnalysisService analysisService;

    @Scheduled(cron = "0 0 20 * * MON-FRI", zone = "Asia/Shanghai")
    public void runDailyAnalysis() {
        LocalDate today = LocalDate.now();
        if (analysisService.existsByDate(today)) {
            log.info("DailyAnalysisScheduler: analysis already exists for {}, skipping", today);
            return;
        }
        log.debug("DailyAnalysisScheduler: generating analysis for {}", today);
        DailyAnalysis generated = aiAnalysisService.generateDailyAnalysis(
                eventService.getTodayVerifiedEvents(),
                fundPositionService.getRecentChanges(),
                marketDataService.getLatestEntity());
        analysisService.save(generated);
    }
}
