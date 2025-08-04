package org.hr_management.domain.filter.dto;


import lombok.Getter;
import lombok.Setter;

import java.util.List;


@Getter
@Setter
public class FilterDto {
    private Integer empId;
    private String tableName;
    private List<FilterDetailDto> filters;
}
