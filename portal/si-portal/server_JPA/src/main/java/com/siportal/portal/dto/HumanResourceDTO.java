package com.siportal.portal.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
public class HumanResourceDTO {
    private Long projectId; // Project ID (필수는 아님, PathVariable로 받을 것이므로)
    private String userId;
    private Long roleId; // Role ID

    // LocalDate와 BigDecimal 타입으로 받도록 수정
    private LocalDate plannedStartDate;
    private LocalDate plannedEndDate;
    private BigDecimal plannedMm;

    private LocalDate actualStartDate;
    private LocalDate actualEndDate;
    private BigDecimal actualMm;
}
