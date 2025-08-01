package org.hr_management.domain.monthly_salary.controller;


import lombok.RequiredArgsConstructor;
import org.hr_management.domain.employee.dto.EmployeeUpdateDto;
import org.hr_management.domain.monthly_salary.db.MonthlySalaryEntity;
import org.hr_management.domain.monthly_salary.dto.PaymentDto;
import org.hr_management.domain.monthly_salary.dto.SalaryListDto;
import org.hr_management.domain.monthly_salary.dto.SalaryUpdateDto;
import org.hr_management.domain.monthly_salary.service.MonthlySalaryService;
import org.hr_management.domain.task.db.TaskEntity;
import org.hr_management.domain.task.service.TaskService;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/salary")
public class MonthlySalaryController {

    private final MonthlySalaryService monthlySalaryService;

    @GetMapping("/all")
    public List<SalaryListDto> getAllPayments() {
        return monthlySalaryService.getAll();
    }

    @DeleteMapping("/cleanup")
    public void cleanupMonthlySalary() {
        monthlySalaryService.cleanMonthlySalary();
    }

    @PostMapping("/pay/{id}")
    public ResponseEntity<?> payCustomSalary(@PathVariable Integer id, @RequestBody PaymentDto dto) {
        monthlySalaryService.customPayment(dto, id);
        return ResponseEntity.ok("지급 완료");
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteEmployee(@PathVariable(name = "id") Long salaryId) {
        monthlySalaryService.deleteBySalaryId(salaryId);
        return ResponseEntity.ok("Monthly Salary deleted");
    }

    @PatchMapping("/update/{id}")
    public ResponseEntity<?> updateMonthlySalary(@PathVariable(name = "id") Long salaryId,@RequestBody SalaryUpdateDto dto) {
        monthlySalaryService.updateSalary(salaryId, dto);
        return ResponseEntity.ok("Monthly Salary updated");
    }
}
