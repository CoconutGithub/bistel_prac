package org.hr_management.domain.employee_status;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "employee_status")
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeStatusEntity {

    @Id
    @Column(length = 20)
    private String statusCode;

    @Column(length = 20, nullable = false)
    private String statusName;

    @Column(length = 100)
    private String statusDescription;
}
