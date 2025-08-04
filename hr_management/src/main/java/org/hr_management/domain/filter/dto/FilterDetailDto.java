package org.hr_management.domain.filter.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class FilterDetailDto {
    private String filterName;
    private String filterType;
    private String filterValue;
    private String valueType;
}
