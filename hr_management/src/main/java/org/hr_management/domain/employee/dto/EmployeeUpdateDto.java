package org.hr_management.domain.employee.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class EmployeeUpdateDto {
    private String engName;
    private LocalDate hireDate;
    private LocalDate quitDate;
    private String department;
    private String position;
    private Long annualSalary;
    private String phoneNumber;
    private String email;
    private String status;
    private String address;
}