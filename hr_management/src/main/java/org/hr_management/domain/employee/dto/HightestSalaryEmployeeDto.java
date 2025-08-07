package org.hr_management.domain.employee.dto;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import org.springframework.web.bind.annotation.GetMapping;

@Getter
@Setter
@AllArgsConstructor
@ToString//해시코드를 문자열로 오버라이딩
public class HightestSalaryEmployeeDto {
    private Integer empId;
    private String engName;
    private Long annualSalary;
    private String deptName;
}
