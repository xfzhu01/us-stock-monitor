package com.usmonitor.controller;

import com.usmonitor.dto.response.AnalysisVO;
import com.usmonitor.dto.response.ApiResult;
import com.usmonitor.dto.response.DashboardVO;
import com.usmonitor.dto.response.EventVO;
import com.usmonitor.dto.response.MarketDataVO;
import com.usmonitor.service.AnalysisService;
import com.usmonitor.service.EventService;
import com.usmonitor.service.MarketDataService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final AnalysisService analysisService;
    private final MarketDataService marketDataService;
    private final EventService eventService;

    @GetMapping
    public ApiResult<DashboardVO> getDashboard(@RequestParam(defaultValue = "30") int days) {
        AnalysisVO latestAnalysis = analysisService.getLatestOptional().orElse(null);
        MarketDataVO latestMarket = marketDataService.getLatestOptional().orElse(null);
        List<EventVO> todayTop = eventService.getTodaySummary();

        List<AnalysisVO> trend = analysisService.getHistory(days).stream()
                .map(vo -> AnalysisVO.builder()
                        .analysisDate(vo.getAnalysisDate())
                        .spxBullProb7d(vo.getSpxBullProb7d())
                        .spxBullProb30d(vo.getSpxBullProb30d())
                        .ndxBullProb7d(vo.getNdxBullProb7d())
                        .ndxBullProb30d(vo.getNdxBullProb30d())
                        .signal(vo.getSignal())
                        .build())
                .toList();

        DashboardVO vo = DashboardVO.builder()
                .latestAnalysis(latestAnalysis)
                .latestMarket(latestMarket)
                .todayTopEvents(todayTop)
                .recentProbTrend(trend)
                .build();
        return ApiResult.success(vo);
    }
}
