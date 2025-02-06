package com.siportal.portal.dto;

import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
public class ExpenseRequest {
    private String gridRowId;
    private String userName;
    private String category;
    private String item;
    private BigDecimal price;
    private Long fileGroupId;
    private List<FileRequest> files;
}
