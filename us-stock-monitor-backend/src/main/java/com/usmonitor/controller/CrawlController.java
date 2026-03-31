package com.usmonitor.controller;

import com.usmonitor.crawler.MarketDataCrawler;
import com.usmonitor.crawler.NewsCrawlerService;
import com.usmonitor.domain.CrawlLog;
import com.usmonitor.domain.DailyAnalysis;
import com.usmonitor.dto.response.ApiResult;
import com.usmonitor.service.AiAnalysisService;
import com.usmonitor.service.AnalysisService;
import com.usmonitor.service.EventService;
import com.usmonitor.service.FundPositionService;
import com.usmonitor.service.MarketDataService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1/crawl")
@RequiredArgsConstructor
public class CrawlController {

    private final NewsCrawlerService newsCrawlerService;
    private final MarketDataCrawler marketDataCrawler;
    private final MarketDataService marketDataService;
    private final EventService eventService;
    private final FundPositionService fundPositionService;
    private final AiAnalysisService aiAnalysisService;
    private final AnalysisService analysisService;

    @PostMapping("/news")
    public ApiResult<Map<String, Object>> triggerNewsCrawl() {
        log.info("Manual trigger: news crawl");
        CrawlLog result = newsCrawlerService.crawlAll();
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("status", result.getStatus());
        data.put("totalFetched", result.getTotalFetched());
        data.put("totalSaved", result.getTotalSaved());
        data.put("totalDuplicate", result.getTotalDuplicate());
        data.put("durationMs", result.getDurationMs());
        return ApiResult.success(data);
    }

    @PostMapping("/market")
    public ApiResult<String> triggerMarketData() {
        log.info("Manual trigger: market data");
        try {
            marketDataService.save(marketDataCrawler.fetchLatestMarketData());
            return ApiResult.success("Market data ingested");
        } catch (Exception e) {
            log.error("Market data crawl failed", e);
            return ApiResult.error(500, "Market data crawl failed: " + e.getMessage());
        }
    }

    @PostMapping("/analysis")
    public ApiResult<String> triggerAnalysis() {
        LocalDate today = LocalDate.now();
        log.info("Manual trigger: daily analysis for {}", today);
        if (analysisService.existsByDate(today)) {
            return ApiResult.success("Analysis already exists for " + today);
        }
        try {
            DailyAnalysis generated = aiAnalysisService.generateDailyAnalysis(
                    eventService.getTodayVerifiedEvents(),
                    fundPositionService.getRecentChanges(),
                    marketDataService.getLatestEntity());
            analysisService.save(generated);
            return ApiResult.success("Analysis generated for " + today);
        } catch (Exception e) {
            log.error("Analysis generation failed", e);
            return ApiResult.error(500, "Analysis generation failed: " + e.getMessage());
        }
    }

    @PostMapping("/all")
    public ApiResult<Map<String, Object>> triggerAll() {
        log.info("Manual trigger: full pipeline (news → market → analysis)");
        Map<String, Object> results = new LinkedHashMap<>();

        try {
            CrawlLog newsResult = newsCrawlerService.crawlAll();
            results.put("news", Map.of(
                    "status", newsResult.getStatus(),
                    "fetched", newsResult.getTotalFetched(),
                    "saved", newsResult.getTotalSaved()));
        } catch (Exception e) {
            log.error("News crawl step failed", e);
            results.put("news", Map.of("status", "FAILED", "error", e.getMessage()));
        }

        try {
            marketDataService.save(marketDataCrawler.fetchLatestMarketData());
            results.put("market", Map.of("status", "SUCCESS"));
        } catch (Exception e) {
            log.error("Market data step failed", e);
            results.put("market", Map.of("status", "FAILED", "error", e.getMessage()));
        }

        LocalDate today = LocalDate.now();
        if (analysisService.existsByDate(today)) {
            results.put("analysis", Map.of("status", "SKIPPED", "reason", "already exists"));
        } else {
            try {
                DailyAnalysis generated = aiAnalysisService.generateDailyAnalysis(
                        eventService.getTodayVerifiedEvents(),
                        fundPositionService.getRecentChanges(),
                        marketDataService.getLatestEntity());
                analysisService.save(generated);
                results.put("analysis", Map.of("status", "SUCCESS"));
            } catch (Exception e) {
                log.error("Analysis step failed", e);
                results.put("analysis", Map.of("status", "FAILED", "error", e.getMessage()));
            }
        }

        return ApiResult.success(results);
    }
}
