package com.usmonitor.crawler;

import com.rometools.rome.feed.synd.SyndEntry;
import com.rometools.rome.feed.synd.SyndFeed;
import com.rometools.rome.io.SyndFeedInput;
import com.usmonitor.config.CrawlerProperties;
import com.usmonitor.domain.Event;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.io.StringReader;
import java.time.Duration;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class RssFeedCrawler {

    private final CrawlerProperties crawlerProperties;
    private final WebClient.Builder webClientBuilder;

    public List<Event> fetchFromFeeds(List<String> feedUrls) {
        List<Event> out = new ArrayList<>();
        WebClient client = webClientBuilder.build();
        for (String url : feedUrls) {
            try {
                String xml = client.get()
                        .uri(url)
                        .header("User-Agent", crawlerProperties.getUserAgent())
                        .retrieve()
                        .bodyToMono(String.class)
                        .timeout(Duration.ofMillis(crawlerProperties.getTimeoutMs()))
                        .onErrorResume(e -> {
                            log.warn("RSS fetch failed for {}: {}", url, e.getMessage());
                            return Mono.empty();
                        })
                        .block();
                if (xml == null || xml.isBlank()) {
                    continue;
                }
                SyndFeedInput input = new SyndFeedInput();
                SyndFeed feed = input.build(new StringReader(xml));
                String sourceName = feed.getTitle() != null ? feed.getTitle() : "RSS";
                for (SyndEntry entry : feed.getEntries()) {
                    Event ev = new Event();
                    ev.setTitle(entry.getTitle() != null ? truncate(entry.getTitle(), 300) : "Untitled");
                    ev.setSummary(entry.getDescription() != null ? entry.getDescription().getValue() : null);
                    ev.setSourceUrl(entry.getLink() != null ? truncate(entry.getLink(), 500) : null);
                    ev.setSourceName(truncate(sourceName, 100));
                    ev.setCategory("NEWS");
                    ev.setEventDate(resolveEntryDate(entry));
                    ev.setRawContent(xml.length() > 5000 ? xml.substring(0, 5000) : xml);
                    out.add(ev);
                }
            } catch (Exception ex) {
                log.warn("RSS parse failed for {}: {}", url, ex.getMessage());
            }
        }
        return out;
    }

    public static List<String> defaultFeedUrls() {
        return List.of(
                "https://feeds.reuters.com/reuters/businessNews",
                "https://www.cnbc.com/id/100003114/device/rss/rss.html",
                "https://feeds.marketwatch.com/marketwatch/topstories/"
        );
    }

    private static String truncate(String s, int max) {
        if (s == null) {
            return null;
        }
        return s.length() <= max ? s : s.substring(0, max);
    }

    private static LocalDate resolveEntryDate(SyndEntry entry) {
        if (entry.getPublishedDate() != null) {
            return LocalDate.ofInstant(entry.getPublishedDate().toInstant(), ZoneId.of("UTC"));
        }
        if (entry.getUpdatedDate() != null) {
            return LocalDate.ofInstant(entry.getUpdatedDate().toInstant(), ZoneId.of("UTC"));
        }
        return LocalDate.now(ZoneId.of("UTC"));
    }
}
