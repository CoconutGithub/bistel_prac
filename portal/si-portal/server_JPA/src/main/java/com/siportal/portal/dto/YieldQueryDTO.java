package com.siportal.portal.dto;

import lombok.Data;

@Data
public class YieldQueryDTO {
    private String product_type; // 'bar' or 'pipe'
    private Double min_yield;
    private Double max_yield;
    private String start_date;
    private String end_date;
}
