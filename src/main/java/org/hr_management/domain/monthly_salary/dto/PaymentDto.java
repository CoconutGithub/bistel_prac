package org.hr_management.domain.monthly_salary.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class PaymentDto {
    //지급 형태(default면 procedure사용해서 동일하게 지급,custom이면 아래 내용 기입)
    private String type;

    //지급 날짜
    private LocalDate payDate;

    private Integer baseSalary;

    private Integer mealAllow;

    private Integer transportAllow;

    private Integer comm;

    private Integer paymentOthers;

    private Integer nationalPension;

    private Integer healthInsurance;

    private Integer employmentInsurance;

    private Integer longtermCareInsurance;

    private Integer incomeTax;

    private Integer localIncomeTax;

    private Integer deductionOthers;
}
