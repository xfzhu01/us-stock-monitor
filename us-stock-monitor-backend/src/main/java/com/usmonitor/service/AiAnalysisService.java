package com.usmonitor.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.usmonitor.ai.AiClient;
import com.usmonitor.ai.PromptBuilder;
import com.usmonitor.ai.dto.AnalysisResult;
import com.usmonitor.domain.DailyAnalysis;
import com.usmonitor.domain.Event;
import com.usmonitor.domain.FundPosition;
import com.usmonitor.domain.MarketData;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiAnalysisService {

    private static final String SYSTEM_JSON = "You reply with a single JSON object only. No markdown fences, no commentary.";

    private final AiClient aiClient;
    private final PromptBuilder promptBuilder;
    private final ObjectMapper objectMapper;

    public Event verifyEvent(Event event) {
        String user = promptBuilder.buildVerificationPrompt(event);
        String raw = aiClient.chat(SYSTEM_JSON, user);
        if (!StringUtils.hasText(raw)) {
            applyVerificationDefaults(event);
            return event;
        }
        try {
            JsonNode node = objectMapper.readTree(stripCodeFence(raw));
            if (node.hasNonNull("credibilityScore")) {
                event.setCredibilityScore(node.get("credibilityScore").asInt());
            }
            if (node.hasNonNull("impactScore")) {
                event.setImpactScore(node.get("impactScore").asInt());
            }
            if (node.hasNonNull("sentiment")) {
                event.setSentiment(node.get("sentiment").asText());
            }
            if (node.has("isVerified")) {
                event.setIsVerified(node.get("isVerified").asBoolean());
            }
        } catch (Exception e) {
            log.warn("Failed to parse verification JSON: {}", e.getMessage());
            applyVerificationDefaults(event);
        }
        return event;
    }

    public List<Event> batchVerify(List<Event> events) {
        List<Event> out = new ArrayList<>();
        for (Event e : events) {
            out.add(verifyEvent(e));
        }
        return out;
    }

    public DailyAnalysis generateDailyAnalysis(List<Event> events, List<FundPosition> fundPositions, MarketData market) {
        LocalDate analysisDate = LocalDate.now();
        String user = promptBuilder.buildAnalysisPrompt(
                events != null ? events : List.of(),
                fundPositions != null ? fundPositions : List.of(),
                market,
                analysisDate);

        AiClient.ChatResult result = aiClient.chatWithMeta(SYSTEM_JSON, user);
        String raw = result.text();

        DailyAnalysis d = new DailyAnalysis();
        d.setAnalysisDate(analysisDate);
        d.setModelVersion(aiClient.getModelName());
        d.setTokenCount(result.totalTokens());
        d.setGeneratedAt(LocalDateTime.now());

        if (!StringUtils.hasText(raw)) {
            fillStubAnalysis(d, events);
            return d;
        }
        try {
            AnalysisResult ar = objectMapper.readValue(stripCodeFence(raw), AnalysisResult.class);
            d.setSpxBullProb7d(ar.getSpxBullProb7d());
            d.setSpxBullProb30d(ar.getSpxBullProb30d());
            d.setNdxBullProb7d(ar.getNdxBullProb7d());
            d.setNdxBullProb30d(ar.getNdxBullProb30d());
            d.setSignal(ar.getSignal());
            d.setKeyRisks(objectMapper.writeValueAsString(ar.getKeyRisks() != null ? ar.getKeyRisks() : List.of()));
            d.setKeyTailwinds(objectMapper.writeValueAsString(ar.getKeyTailwinds() != null ? ar.getKeyTailwinds() : List.of()));
            d.setReportMarkdown(ar.getReport());
        } catch (Exception e) {
            log.warn("Failed to parse daily analysis JSON: {}", e.getMessage());
            fillStubAnalysis(d, events);
        }

        try {
            List<Long> ids = new ArrayList<>();
            for (Event ev : events != null ? events : List.<Event>of()) {
                if (ev.getId() != null) {
                    ids.add(ev.getId());
                }
            }
            d.setEventIdsUsed(objectMapper.writeValueAsString(ids));
        } catch (Exception e) {
            d.setEventIdsUsed("[]");
        }

        return d;
    }

    private void applyVerificationDefaults(Event event) {
        if (event.getCredibilityScore() == null) {
            event.setCredibilityScore(50);
        }
        if (event.getImpactScore() == null) {
            event.setImpactScore(50);
        }
        if (!StringUtils.hasText(event.getSentiment())) {
            event.setSentiment("NEUTRAL");
        }
        if (event.getIsVerified() == null) {
            event.setIsVerified(false);
        }
    }

    private void fillStubAnalysis(DailyAnalysis d, List<Event> events) {
        d.setSpxBullProb7d(50);
        d.setSpxBullProb30d(50);
        d.setNdxBullProb7d(50);
        d.setNdxBullProb30d(50);
        d.setSignal("NEUTRAL");
        try {
            d.setKeyRisks(objectMapper.writeValueAsString(List.of("Data unavailable — stub")));
            d.setKeyTailwinds(objectMapper.writeValueAsString(List.of()));
            d.setReportMarkdown("_(Analysis unavailable: model returned empty or invalid response.)_");
            List<Long> ids = new ArrayList<>();
            for (Event ev : events != null ? events : List.<Event>of()) {
                if (ev.getId() != null) {
                    ids.add(ev.getId());
                }
            }
            d.setEventIdsUsed(objectMapper.writeValueAsString(ids));
        } catch (Exception e) {
            d.setKeyRisks("[]");
            d.setKeyTailwinds("[]");
            d.setEventIdsUsed("[]");
        }
    }

    private static String stripCodeFence(String raw) {
        String s = raw.trim();
        if (s.startsWith("```")) {
            int firstNl = s.indexOf('\n');
            int lastFence = s.lastIndexOf("```");
            if (firstNl > 0 && lastFence > firstNl) {
                s = s.substring(firstNl + 1, lastFence).trim();
            }
        }
        return s;
    }
}
