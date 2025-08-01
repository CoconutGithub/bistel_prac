package org.hr_management.domain.employee.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
public class EmployeeListDto {
    private Integer empId;
    private String fullName;
    private String engName;
    private LocalDate hireDate;
    private LocalDate quitDate;
    private String deptName;
    private String position;
    private Long annualSalary;
    private String phoneNumber;
    private String email;
    private String statusCode;
    private String address;
    private String ssn;
}
