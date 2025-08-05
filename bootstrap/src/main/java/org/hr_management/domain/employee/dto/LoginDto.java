package org.hr_management.domain.employee.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginDto {
    private String userId;
    private String password;
}
