package com.usmonitor.controller;

import com.usmonitor.dto.request.AnalysisQueryRequest;
import com.usmonitor.dto.response.AnalysisVO;
import com.usmonitor.dto.response.ApiResult;
import com.usmonitor.service.AnalysisService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/analysis")
@RequiredArgsConstructor
public class AnalysisController {

    private final AnalysisService analysisService;

    @GetMapping("/latest")
    public ApiResult<AnalysisVO> getLatest() {
        return ApiResult.success(analysisService.getLatest());
    }

    @GetMapping("/history")
    public ApiResult<List<AnalysisVO>> getHistory(@ModelAttribute AnalysisQueryRequest request) {
        return ApiResult.success(analysisService.getHistory(request.getDays()));
    }

    @GetMapping("/dates")
    public ApiResult<List<String>> getAnalysisDates() {
        return ApiResult.success(analysisService.getAnalysisDates());
    }

    @GetMapping("/{date}")
    public ApiResult<AnalysisVO> getByDate(@PathVariable String date) {
        LocalDate d = LocalDate.parse(date);
        return ApiResult.success(analysisService.getByDate(d));
    }
}
