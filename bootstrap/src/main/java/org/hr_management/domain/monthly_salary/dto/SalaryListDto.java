package org.hr_management.domain.monthly_salary.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
public class SalaryListDto {
    private Long monthlySalaryId;
    private Integer empId;
    private String fullName;
    private LocalDate payDate;
    private Long baseSalary;
    private Long mealAllow;
    private Long transportAllow;
    private Long comm;
    private Long paymentOthers;
    private Long nationalPension;
    private Long healthInsurance;
    private Long employmentInsurance;
    private Long longtermCareInsurance;
    private Long incomeTax;
    private Long localIncomeTax;
    private Long deductionOthers;
}
