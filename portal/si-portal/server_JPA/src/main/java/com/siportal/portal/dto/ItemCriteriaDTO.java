package com.siportal.portal.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class ItemCriteriaDTO {
    // 아이템 그룹핑 9가지 요소
    private String itemType;           // 품목종류
    private String steelGradeL;        // 강종대분류
    private String steelGradeGroup;    // 강종그룹
    private String shape;              // 형상
    private String inhouseSteelName;   // 사내강종명
    private String orderHeatTreat;     // 주문열처리
    private String materialL;          // 소재대분류
    private String surface;            // 표면
    private BigDecimal orderOuterDia;  // 주문외경
}