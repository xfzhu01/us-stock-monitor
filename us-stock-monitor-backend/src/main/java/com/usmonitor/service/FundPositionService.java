package com.usmonitor.service;

import com.usmonitor.domain.FundPosition;
import com.usmonitor.dto.response.FundPositionVO;
import com.usmonitor.repository.FundPositionRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FundPositionService {

    private final FundPositionRepository fundPositionRepository;

    @Transactional(readOnly = true)
    public Page<FundPositionVO> getPositions(String fundName, String ticker, String quarter, String action,
                                             int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Specification<FundPosition> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (StringUtils.hasText(fundName)) {
                predicates.add(cb.equal(root.get("fundName"), fundName));
            }
            if (StringUtils.hasText(ticker)) {
                predicates.add(cb.equal(root.get("ticker"), ticker));
            }
            if (StringUtils.hasText(quarter)) {
                predicates.add(cb.equal(root.get("quarter"), quarter));
            }
            if (StringUtils.hasText(action)) {
                predicates.add(cb.equal(root.get("action"), action));
            }
            if (predicates.isEmpty()) {
                return cb.conjunction();
            }
            return cb.and(predicates.toArray(Predicate[]::new));
        };
        return fundPositionRepository.findAll(spec, pageable).map(this::toVo);
    }

    @Transactional(readOnly = true)
    public List<String> getFundList() {
        return fundPositionRepository.findDistinctFundNames();
    }

    @Transactional(readOnly = true)
    public List<String> getQuarterList() {
        return fundPositionRepository.findDistinctQuarters();
    }

    @Transactional(readOnly = true)
    public List<FundPosition> getRecentChanges() {
        List<String> quarters = fundPositionRepository.findDistinctQuarters();
        if (quarters.isEmpty()) {
            return List.of();
        }
        String latest = quarters.get(0);
        return fundPositionRepository.findByQuarter(latest);
    }

    @Transactional
    public List<FundPosition> batchSave(List<FundPosition> positions) {
        return fundPositionRepository.saveAll(positions);
    }

    private FundPositionVO toVo(FundPosition fp) {
        return FundPositionVO.builder()
                .id(fp.getId())
                .fundName(fp.getFundName())
                .managerName(fp.getManagerName())
                .ticker(fp.getTicker())
                .companyName(fp.getCompanyName())
                .action(fp.getAction())
                .sharesChange(fp.getSharesChange())
                .sharesTotal(fp.getSharesTotal())
                .valueUsd(fp.getValueUsd())
                .portfolioPct(fp.getPortfolioPct())
                .quarter(fp.getQuarter())
                .filingDate(fp.getFilingDate())
                .sourceUrl(fp.getSourceUrl())
                .createdAt(fp.getCreatedAt())
                .build();
    }
}
