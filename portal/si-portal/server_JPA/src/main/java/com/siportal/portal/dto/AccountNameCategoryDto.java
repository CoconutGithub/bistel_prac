package com.siportal.portal.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AccountNameCategoryDto {
    private Integer categoryId;
    private String categoryName;
    private Integer categoryCode;
    private Integer level;
    private Integer parentId;
    private List<AccountNameCategoryDto> children;
}
