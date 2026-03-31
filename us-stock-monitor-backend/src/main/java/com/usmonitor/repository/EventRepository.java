package com.usmonitor.repository;

import com.usmonitor.domain.Event;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long>, JpaSpecificationExecutor<Event> {

    List<Event> findByEventDateOrderByImpactScoreDesc(LocalDate date);

    List<Event> findByEventDateAndIsVerifiedTrueOrderByImpactScoreDesc(LocalDate date);

    Page<Event> findByEventDateBetween(LocalDate start, LocalDate end, Pageable pageable);

    @Query("""
            SELECT e FROM Event e
            WHERE e.eventDate BETWEEN :start AND :end
            AND (:category IS NULL OR e.category = :category)
            AND (:sentiment IS NULL OR e.sentiment = :sentiment)
            AND (:verified IS NULL OR e.isVerified = :verified)
            """)
    Page<Event> findByEventDateBetweenAndCategoryAndSentimentAndIsVerified(
            @Param("start") LocalDate start,
            @Param("end") LocalDate end,
            @Param("category") String category,
            @Param("sentiment") String sentiment,
            @Param("verified") Boolean verified,
            Pageable pageable);

    List<Event> findTop10ByEventDateAndIsVerifiedTrueOrderByImpactScoreDesc(LocalDate date);

    boolean existsBySourceUrl(String sourceUrl);
}
