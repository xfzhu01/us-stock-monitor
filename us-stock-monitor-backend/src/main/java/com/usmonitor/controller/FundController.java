package com.usmonitor.controller;

import com.usmonitor.dto.response.ApiResult;
import com.usmonitor.dto.response.FundPositionVO;
import com.usmonitor.service.FundPositionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/funds")
@RequiredArgsConstructor
public class FundController {

    private final FundPositionService fundPositionService;

    @GetMapping("/positions")
    public ApiResult<Page<FundPositionVO>> getPositions(
            @RequestParam(required = false) String fundName,
            @RequestParam(required = false) String ticker,
            @RequestParam(required = false) String quarter,
            @RequestParam(required = false) String action,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResult.success(fundPositionService.getPositions(fundName, ticker, quarter, action, page, size));
    }

    @GetMapping("/list")
    public ApiResult<List<String>> getFundList() {
        return ApiResult.success(fundPositionService.getFundList());
    }

    @GetMapping("/quarters")
    public ApiResult<List<String>> getQuarterList() {
        return ApiResult.success(fundPositionService.getQuarterList());
    }
}
