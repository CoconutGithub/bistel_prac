package com.siportal.portal.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
public class ExpenseRequest {
    private String userName;
    private String category;
    private String item;
    private BigDecimal price;
//    private String fileGroupId; mybatis 사용시에는 필요하다.
    private String createdBy;
    private String updatedBy;
    private List<FileRequest> files;
}
