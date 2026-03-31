package com.usmonitor.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.usmonitor.domain.DailyAnalysis;
import com.usmonitor.dto.response.AnalysisVO;
import com.usmonitor.exception.BusinessException;
import com.usmonitor.repository.DailyAnalysisRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AnalysisService {

    private final DailyAnalysisRepository dailyAnalysisRepository;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public AnalysisVO getLatest() {
        return dailyAnalysisRepository.findTopByOrderByAnalysisDateDesc()
                .map(this::toVo)
                .orElseThrow(() -> new BusinessException(404, "No analysis found"));
    }

    @Transactional(readOnly = true)
    public Optional<AnalysisVO> getLatestOptional() {
        return dailyAnalysisRepository.findTopByOrderByAnalysisDateDesc().map(this::toVo);
    }

    @Transactional(readOnly = true)
    public AnalysisVO getByDate(LocalDate date) {
        return dailyAnalysisRepository.findByAnalysisDate(date)
                .map(this::toVo)
                .orElseThrow(() -> new BusinessException(404, "No analysis for " + date));
    }

    @Transactional(readOnly = true)
    public List<AnalysisVO> getHistory(int days) {
        LocalDate end = LocalDate.now();
        LocalDate start = end.minusDays(days);
        return dailyAnalysisRepository.findByAnalysisDateBetweenOrderByAnalysisDateDesc(start, end).stream()
                .map(this::toVo)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<String> getAnalysisDates() {
        return dailyAnalysisRepository.findAnalysisDates().stream()
                .map(LocalDate::toString)
                .collect(Collectors.toList());
    }

    @Transactional
    public DailyAnalysis save(DailyAnalysis entity) {
        return dailyAnalysisRepository.save(entity);
    }

    @Transactional(readOnly = true)
    public boolean existsByDate(LocalDate date) {
        return dailyAnalysisRepository.findByAnalysisDate(date).isPresent();
    }

    public AnalysisVO toVo(DailyAnalysis d) {
        return AnalysisVO.builder()
                .id(d.getId())
                .analysisDate(d.getAnalysisDate())
                .spxBullProb7d(d.getSpxBullProb7d())
                .spxBullProb30d(d.getSpxBullProb30d())
                .ndxBullProb7d(d.getNdxBullProb7d())
                .ndxBullProb30d(d.getNdxBullProb30d())
                .trendSignal(d.getTrendSignal())
                .keyRisks(readStringList(d.getKeyRisks()))
                .keyTailwinds(readStringList(d.getKeyTailwinds()))
                .eventIdsUsed(readLongList(d.getEventIdsUsed()))
                .reportMarkdown(d.getReportMarkdown())
                .modelVersion(d.getModelVersion())
                .tokenCount(d.getTokenCount())
                .generatedAt(d.getGeneratedAt())
                .createdAt(d.getCreatedAt())
                .build();
    }

    public AnalysisVO toProbTrendVo(DailyAnalysis d) {
        return AnalysisVO.builder()
                .analysisDate(d.getAnalysisDate())
                .spxBullProb7d(d.getSpxBullProb7d())
                .spxBullProb30d(d.getSpxBullProb30d())
                .ndxBullProb7d(d.getNdxBullProb7d())
                .ndxBullProb30d(d.getNdxBullProb30d())
                .trendSignal(d.getTrendSignal())
                .build();
    }

    private List<String> readStringList(String json) {
        if (!StringUtils.hasText(json)) {
            return Collections.emptyList();
        }
        try {
            return objectMapper.readValue(json, new TypeReference<List<String>>() {
            });
        } catch (Exception e) {
            log.warn("Failed to parse string list JSON: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    private List<Long> readLongList(String json) {
        if (!StringUtils.hasText(json)) {
            return Collections.emptyList();
        }
        try {
            return objectMapper.readValue(json, new TypeReference<List<Long>>() {
            });
        } catch (Exception e) {
            log.warn("Failed to parse long list JSON: {}", e.getMessage());
            return Collections.emptyList();
        }
    }
}
