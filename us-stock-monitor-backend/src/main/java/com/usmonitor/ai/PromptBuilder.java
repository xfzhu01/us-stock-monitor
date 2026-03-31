package com.usmonitor.ai;

import com.usmonitor.domain.Event;
import com.usmonitor.domain.FundPosition;
import com.usmonitor.domain.MarketData;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class PromptBuilder {

    private static final DateTimeFormatter ISO = DateTimeFormatter.ISO_LOCAL_DATE;

    public String buildVerificationPrompt(Event event) {
        StringBuilder sb = new StringBuilder();
        sb.append("You are a financial news analyst. Evaluate the following market event for US equities.\n");
        sb.append("Respond with a single JSON object only (no markdown), with keys:\n");
        sb.append("\"credibilityScore\" (0-100 integer), \"impactScore\" (0-100 integer),\n");
        sb.append("\"sentiment\" (one of: POSITIVE, NEUTRAL, NEGATIVE),\n");
        sb.append("\"isVerified\" (boolean, true if the item is a substantive market-relevant fact),\n");
        sb.append("\"rationale\" (short string).\n\n");
        sb.append("Title: ").append(nullToEmpty(event.getTitle())).append("\n");
        sb.append("Summary: ").append(nullToEmpty(event.getSummary())).append("\n");
        sb.append("Category: ").append(nullToEmpty(event.getCategory())).append("\n");
        sb.append("Source: ").append(nullToEmpty(event.getSourceName())).append("\n");
        return sb.toString();
    }

    public String buildAnalysisPrompt(List<Event> events, List<FundPosition> fundPositions, MarketData market,
                                      LocalDate analysisDate) {
        String dateStr = analysisDate != null ? analysisDate.format(ISO) : "";
        StringBuilder sb = new StringBuilder();
        sb.append("You are a senior US equity strategist. Produce a daily regime summary for ");
        sb.append(dateStr).append(".\n");
        sb.append("Respond with a single JSON object only (no markdown), keys:\n");
        sb.append("\"spxBullProb7d\", \"spxBullProb30d\", \"ndxBullProb7d\", \"ndxBullProb30d\" (integers 0-100),\n");
        sb.append("\"trendSignal\" (short string, max 15 chars),\n");
        sb.append("\"keyRisks\" (array of short strings), \"keyTailwinds\" (array of short strings),\n");
        sb.append("\"report\" (markdown string, multi-paragraph outlook).\n\n");
        sb.append("## Market snapshot\n");
        sb.append(formatMarket(market));
        sb.append("\n## Recent verified events (headlines)\n");
        sb.append(events.stream().map(e -> "- " + nullToEmpty(e.getTitle()))
                .collect(Collectors.joining("\n")));
        sb.append("\n## Notable 13F-style position changes (stub data may be empty)\n");
        sb.append(fundPositions.stream()
                .map(fp -> String.format("- %s %s %s", nullToEmpty(fp.getFundName()), nullToEmpty(fp.getTicker()),
                        nullToEmpty(fp.getAction())))
                .collect(Collectors.joining("\n")));
        return sb.toString();
    }

    private String formatMarket(MarketData m) {
        if (m == null) {
            return "(no market data)\n";
        }
        return String.format(
                "tradeDate=%s, SPX close=%s chg%%=%s, NDX close=%s chg%%=%s, VIX=%s, US10Y=%s, DXY=%s, FFR=%s%n",
                m.getTradeDate(),
                fmt(m.getSpxClose()), fmt(m.getSpxChangePct()),
                fmt(m.getNdxClose()), fmt(m.getNdxChangePct()),
                fmt(m.getVixClose()), fmt(m.getUs10yYield()), fmt(m.getDxy()), fmt(m.getFedFundsRate()));
    }

    private static String fmt(BigDecimal v) {
        return v != null ? v.toPlainString() : "n/a";
    }

    private static String nullToEmpty(String s) {
        return s != null ? s : "";
    }
}
