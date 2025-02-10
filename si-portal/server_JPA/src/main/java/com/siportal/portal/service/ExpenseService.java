package com.siportal.portal.service;

import com.siportal.portal.domain.Expense;
import com.siportal.portal.domain.File;
import com.siportal.portal.repository.ExpenseRepository;
import com.siportal.portal.dto.ExpenseRequest;
import com.siportal.portal.mapper.ExpenseMapper;
import com.siportal.portal.repository.FileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
public class ExpenseService {

    @Autowired
    private ExpenseRepository expenseRepository;

    @Transactional
    public String saveExpense(ExpenseRequest request) {
        String fileGroupId = Expense.generateFileGroupId();

        Expense expense = new Expense();
        expense.setUserName(request.getUserName());
        expense.setCategory(request.getCategory());
        expense.setItem(request.getItem());
        expense.setPrice(request.getPrice() != null ? request.getPrice() : BigDecimal.ZERO);
        expense.setFileGroupId(fileGroupId);
        expense.setCreatedBy("system");
        expense.setUpdatedBy("system");

        expenseRepository.save(expense);
        return fileGroupId;

//        Mybatis 방식
//        @Autowired
//        private ExpenseMapper expenseMapper;

//        @Transactional
//        public long saveExpense(ExpenseRequest request){
//        request.setFileGroupId(System.currentTimeMillis());
//        request.setCreatedBy("system");
//        request.setUpdatedBy("system");
//
//        expenseMapper.insertExpense(request);
//
//
//        return request.getFileGroupId();
//        }
    }
}
