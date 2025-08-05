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
    private String filterName;//컬럼명
    private String filterType;//필터종류
    private String filterValue;//필터값
    private String valueType;//필터타입
}
