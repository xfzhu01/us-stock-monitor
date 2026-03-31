package com.usmonitor.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "app.crawler")
public class CrawlerProperties {

    private String userAgent = "Mozilla/5.0 (compatible; USMonitor/1.0)";
    private int timeoutMs = 10000;
    private int retryTimes = 3;
}
