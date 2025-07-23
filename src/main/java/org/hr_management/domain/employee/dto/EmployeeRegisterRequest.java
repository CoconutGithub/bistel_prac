package org.hr_management.domain.employee.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeRegisterRequest {
    @NotBlank
    private String firstName;
    @NotBlank
    private String lastName;

    private String engName;

    @NotBlank(message = "전화번호는 필수입니다.")
    @Pattern(
            regexp = "^010-\\d{4}-\\d{4}$",
            message = "전화번호 형식은 010-1234-5678 이어야 합니다."
    )
    private String phoneNumber;

    @NotBlank(message = "이메일은 필수입니다.")
    @Email(message = "올바른 이메일 형식이어야 합니다.")
    private String email;

    private String address;

    @NotBlank
    private String ssn;

    @NotBlank
    private String deptName;

    private String position;
    private Long annualSalary;

    @NotNull(message = "입사 날짜는 필수입니다.")
    private LocalDate hireDate;
}
