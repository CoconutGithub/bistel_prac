package com.siportal.portal.mapper;

import com.siportal.portal.dto.ExpenseRequest;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface ExpenseMapper {
    void insertExpense(ExpenseRequest expenseRequest);
}
