package com.usmonitor.controller;

import com.usmonitor.dto.request.AiConfigUpdateRequest;
import com.usmonitor.dto.response.AiConfigVO;
import com.usmonitor.dto.response.ApiResult;
import com.usmonitor.service.UserAiConfigService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/ai/config")
@RequiredArgsConstructor
public class AiConfigController {

    private final UserAiConfigService userAiConfigService;

    @GetMapping
    public ApiResult<AiConfigVO> getConfig() {
        return ApiResult.success(userAiConfigService.getConfig());
    }

    @PutMapping
    public ApiResult<AiConfigVO> updateConfig(@Valid @RequestBody AiConfigUpdateRequest request) {
        return ApiResult.success(userAiConfigService.saveConfig(request));
    }
}
