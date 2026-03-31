package com.usmonitor.controller;

import com.usmonitor.dto.request.AnalysisQueryRequest;
import com.usmonitor.dto.response.ApiResult;
import com.usmonitor.dto.response.MarketDataVO;
import com.usmonitor.service.MarketDataService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/market")
@RequiredArgsConstructor
public class MarketController {

    private final MarketDataService marketDataService;

    @GetMapping("/latest")
    public ApiResult<MarketDataVO> getLatest() {
        return ApiResult.success(marketDataService.getLatest());
    }

    @GetMapping("/history")
    public ApiResult<List<MarketDataVO>> getHistory(@ModelAttribute AnalysisQueryRequest request) {
        return ApiResult.success(marketDataService.getHistory(request.getDays()));
    }
}
