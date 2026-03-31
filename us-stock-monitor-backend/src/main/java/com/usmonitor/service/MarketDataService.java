package com.usmonitor.service;

import com.usmonitor.domain.MarketData;
import com.usmonitor.dto.response.MarketDataVO;
import com.usmonitor.exception.BusinessException;
import com.usmonitor.repository.MarketDataRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MarketDataService {

    private final MarketDataRepository marketDataRepository;

    @Transactional(readOnly = true)
    public MarketDataVO getLatest() {
        return marketDataRepository.findTopByOrderByTradeDateDesc()
                .map(this::toVo)
                .orElseThrow(() -> new BusinessException(404, "No market data"));
    }

    @Transactional(readOnly = true)
    public java.util.Optional<MarketDataVO> getLatestOptional() {
        return marketDataRepository.findTopByOrderByTradeDateDesc().map(this::toVo);
    }

    @Transactional(readOnly = true)
    public List<MarketDataVO> getHistory(int days) {
        LocalDate end = LocalDate.now();
        LocalDate start = end.minusDays(days);
        return marketDataRepository.findByTradeDateBetweenOrderByTradeDateAsc(start, end).stream()
                .map(this::toVo)
                .toList();
    }

    @Transactional(readOnly = true)
    public MarketData getLatestEntity() {
        return marketDataRepository.findTopByOrderByTradeDateDesc()
                .orElse(null);
    }

    @Transactional
    public MarketData save(MarketData entity) {
        return marketDataRepository.save(entity);
    }

    private MarketDataVO toVo(MarketData m) {
        return MarketDataVO.builder()
                .id(m.getId())
                .tradeDate(m.getTradeDate())
                .spxOpen(m.getSpxOpen())
                .spxClose(m.getSpxClose())
                .spxChangePct(m.getSpxChangePct())
                .ndxOpen(m.getNdxOpen())
                .ndxClose(m.getNdxClose())
                .ndxChangePct(m.getNdxChangePct())
                .vixClose(m.getVixClose())
                .us10yYield(m.getUs10yYield())
                .dxy(m.getDxy())
                .fedFundsRate(m.getFedFundsRate())
                .createdAt(m.getCreatedAt())
                .build();
    }
}
