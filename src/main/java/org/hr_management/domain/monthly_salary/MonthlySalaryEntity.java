package org.hr_management.domain.monthly_salary;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hr_management.domain.employee.db.EmployeeEntity;

@Entity
@Getter
@Setter
@Table(name = "MONTHLY_SALARY")
public class MonthlySalaryEntity {
    @Id
    @Column(name = "MONTHLY_SALARY_ID")
    private Long monthlySalaryId;

    @Column(name = "BASE_SALARY")
    private Long baseSalary;

    @Column(name = "MEAL_ALLOW")
    private Long mealAllow;

    @Column(name = "TRANSPORT_ALLOW")
    private Long transportAllow;

    @Column(name = "COMM")
    private Long comm;

    @Column(name = "PAYMENT_OTHERS")
    private Long paymentOthers;

    @Column(name = "NATIONAL_PENSION")
    private Long nationalPension;

    @Column(name = "HEALTH_INSURANCE")
    private Long healthInsurance;

    @Column(name = "EMPLOYMENT_INSURANCE")
    private Long employmentInsurance;

    @Column(name = "LONGTERM_CARE_INSURANCE")
    private Long longtermCareInsurance;

    @Column(name = "INCOME_TAX")
    private Long incomeTax;

    @Column(name = "LOCAL_INCOME_TAX")
    private Long localIncomeTax;

    @Column(name = "DEDUCTION_OTHERS")
    private Long deductionOthers;

    @JoinColumn(name = "EMP_ID", nullable = false)
    @ManyToOne(fetch = FetchType.LAZY)
    private EmployeeEntity empId;
}
