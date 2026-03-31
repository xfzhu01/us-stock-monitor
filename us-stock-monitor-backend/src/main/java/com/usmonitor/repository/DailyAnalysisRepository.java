package com.usmonitor.repository;

import com.usmonitor.domain.DailyAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface DailyAnalysisRepository extends JpaRepository<DailyAnalysis, Long> {

    Optional<DailyAnalysis> findByAnalysisDate(LocalDate date);

    Optional<DailyAnalysis> findTopByOrderByAnalysisDateDesc();

    List<DailyAnalysis> findByAnalysisDateBetweenOrderByAnalysisDateDesc(LocalDate start, LocalDate end);

    @Query("SELECT DISTINCT d.analysisDate FROM DailyAnalysis d ORDER BY d.analysisDate DESC")
    List<LocalDate> findAnalysisDates();
}
