package org.hr_management.domain.monthly_salary.dto;


import jakarta.persistence.Column;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.Setter;
import org.hr_management.domain.employee.db.EmployeeEntity;

import java.time.LocalDate;

@Getter
@Setter
public class SalaryUpdateDto{

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

    private LocalDate payDate;
}
