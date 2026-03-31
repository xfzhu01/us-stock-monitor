package com.usmonitor.service;

import com.usmonitor.domain.Event;
import com.usmonitor.dto.request.EventQueryRequest;
import com.usmonitor.dto.response.EventVO;
import com.usmonitor.exception.BusinessException;
import com.usmonitor.repository.EventRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;

    @Transactional(readOnly = true)
    public Page<EventVO> getEvents(EventQueryRequest req) {
        Pageable pageable = PageRequest.of(req.getPage(), req.getSize());
        Specification<Event> spec = buildSpecification(req);
        return eventRepository.findAll(spec, pageable).map(this::toVo);
    }

    private Specification<Event> buildSpecification(EventQueryRequest req) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (StringUtils.hasText(req.getDate())) {
                predicates.add(cb.equal(root.get("eventDate"), LocalDate.parse(req.getDate())));
            } else if (StringUtils.hasText(req.getStartDate()) && StringUtils.hasText(req.getEndDate())) {
                predicates.add(cb.between(root.get("eventDate"),
                        LocalDate.parse(req.getStartDate()),
                        LocalDate.parse(req.getEndDate())));
            }
            if (StringUtils.hasText(req.getCategory())) {
                predicates.add(cb.equal(root.get("category"), req.getCategory()));
            }
            if (StringUtils.hasText(req.getSentiment())) {
                predicates.add(cb.equal(root.get("sentiment"), req.getSentiment()));
            }
            if (req.getVerified() != null) {
                predicates.add(cb.equal(root.get("isVerified"), req.getVerified()));
            }
            if (predicates.isEmpty()) {
                return cb.conjunction();
            }
            return cb.and(predicates.toArray(Predicate[]::new));
        };
    }

    @Transactional(readOnly = true)
    public EventVO getEventById(Long id) {
        Event e = eventRepository.findById(id)
                .orElseThrow(() -> new BusinessException(404, "Event not found: " + id));
        return toVo(e);
    }

    @Transactional(readOnly = true)
    public List<EventVO> getTodaySummary() {
        LocalDate today = LocalDate.now();
        return eventRepository.findTop10ByEventDateAndIsVerifiedTrueOrderByImpactScoreDesc(today).stream()
                .map(this::toVo)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<Event> getTodayVerifiedEvents() {
        return eventRepository.findByEventDateAndIsVerifiedTrueOrderByImpactScoreDesc(LocalDate.now());
    }

    @Transactional
    public Event saveEvent(Event event) {
        return eventRepository.save(event);
    }

    @Transactional
    public List<Event> batchSave(List<Event> events) {
        return eventRepository.saveAll(events);
    }

    @Transactional(readOnly = true)
    public boolean isDuplicate(String sourceUrl) {
        if (!StringUtils.hasText(sourceUrl)) {
            return false;
        }
        return eventRepository.existsBySourceUrl(sourceUrl);
    }

    private EventVO toVo(Event e) {
        return EventVO.builder()
                .id(e.getId())
                .eventDate(e.getEventDate())
                .category(e.getCategory())
                .title(e.getTitle())
                .summary(e.getSummary())
                .sourceUrl(e.getSourceUrl())
                .sourceName(e.getSourceName())
                .credibilityScore(e.getCredibilityScore())
                .impactScore(e.getImpactScore())
                .sentiment(e.getSentiment())
                .isVerified(e.getIsVerified())
                .rawContent(e.getRawContent())
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .build();
    }
}
