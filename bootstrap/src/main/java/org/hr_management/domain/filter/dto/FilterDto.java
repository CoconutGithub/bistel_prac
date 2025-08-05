package org.hr_management.domain.filter.dto;


import lombok.Getter;
import lombok.Setter;

import java.util.List;


@Getter
@Setter
public class FilterDto {
    private Integer empId;//사원
    private String tableName;//메뉴 테이블
    private List<FilterDetailDto> filters;
}
