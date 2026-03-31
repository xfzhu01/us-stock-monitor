package com.usmonitor.crawler;

import com.usmonitor.domain.FundPosition;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
public class SecEdgarCrawler {

    public List<FundPosition> fetchLatest13F() {
        log.info("SecEdgarCrawler.fetchLatest13F: stub — would fetch and parse latest 13F filings from SEC EDGAR");
        return List.of();
    }
}
