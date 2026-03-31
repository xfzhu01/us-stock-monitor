package com.usmonitor.dto.request;

import lombok.Data;

@Data
public class EventQueryRequest {

    private String date;
    private String startDate;
    private String endDate;
    private String category;
    private String sentiment;
    private Boolean verified;
    private int page = 0;
    private int size = 20;
}
