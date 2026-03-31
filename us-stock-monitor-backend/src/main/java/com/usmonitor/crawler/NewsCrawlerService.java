package com.usmonitor.crawler;

import com.usmonitor.domain.CrawlLog;
import com.usmonitor.domain.Event;
import com.usmonitor.repository.CrawlLogRepository;
import com.usmonitor.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class NewsCrawlerService {

    private final RssFeedCrawler rssFeedCrawler;
    private final EventRepository eventRepository;
    private final CrawlLogRepository crawlLogRepository;

    @Transactional
    public CrawlLog crawlAll() {
        long start = System.currentTimeMillis();
        CrawlLog logEntry = new CrawlLog();
        logEntry.setTaskName("crawlAll");
        logEntry.setSourceName("RSS_AGG");
        logEntry.setStatus("SUCCESS");

        List<Event> fetched = rssFeedCrawler.fetchFromFeeds(RssFeedCrawler.defaultFeedUrls());
        logEntry.setTotalFetched(fetched.size());

        int saved = 0;
        int dup = 0;
        List<Event> toSave = new ArrayList<>();
        for (Event e : fetched) {
            if (StringUtils.hasText(e.getSourceUrl()) && eventRepository.existsBySourceUrl(e.getSourceUrl())) {
                dup++;
                continue;
            }
            toSave.add(e);
        }
        if (!toSave.isEmpty()) {
            List<Event> persisted = eventRepository.saveAll(toSave);
            saved = persisted.size();
        }
        logEntry.setTotalSaved(saved);
        logEntry.setTotalDuplicate(dup);
        logEntry.setDurationMs((int) (System.currentTimeMillis() - start));
        log.info("News crawl finished: fetched={}, saved={}, duplicate={}", fetched.size(), saved, dup);
        return crawlLogRepository.save(logEntry);
    }
}
