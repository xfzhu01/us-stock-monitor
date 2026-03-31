package com.usmonitor.controller;

import com.usmonitor.dto.request.EventQueryRequest;
import com.usmonitor.dto.response.ApiResult;
import com.usmonitor.dto.response.EventVO;
import com.usmonitor.service.EventService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;

    @GetMapping
    public ApiResult<Page<EventVO>> getEvents(@ModelAttribute EventQueryRequest request) {
        return ApiResult.success(eventService.getEvents(request));
    }

    @GetMapping("/{id}")
    public ApiResult<EventVO> getEvent(@PathVariable Long id) {
        return ApiResult.success(eventService.getEventById(id));
    }

    @GetMapping("/today/summary")
    public ApiResult<List<EventVO>> getTodaySummary() {
        return ApiResult.success(eventService.getTodaySummary());
    }
}
