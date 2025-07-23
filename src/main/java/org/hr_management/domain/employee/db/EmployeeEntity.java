package org.hr_management.domain.employee.db;

import jakarta.persistence.*;
import lombok.*;
import org.hr_management.domain.department.DepartmentEntity;
import org.hr_management.domain.status.StatusEntity;

import java.time.LocalDate;

@Entity
@Table(name = "employee")
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeEntity {

    @Id
    private Integer empId;

    @Column(name = "FIRST_NAME", nullable = false, length = 10)
    private String firstName;

    @Column(name = "LAST_NAME", nullable = false, length = 10)
    private String lastName;

    @Column(name = "ENG_NAME", nullable = false, length = 10)
    private String engName;

    @Column(name = "HIRE_DATE", nullable = false)
    private LocalDate hireDate;

    @Column(name = "QUIT_DATE", nullable = false)
    private LocalDate quitDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "DEPT_ID")
    private DepartmentEntity dept;

    @Column(name = "POSITION", nullable = false, length = 20)
    private String position;

    @Column(name = "ANNUAL_SALARY", precision = 13)
    private Long annualSalary;

    @Column(name = "PHONE_NUMBER", length = 20)
    private String phoneNumber;

    @Column(name = "EMAIL", length = 50)
    private String email;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "STATUS_CODE")
    private StatusEntity status;

    @Column(name = "ADDRESS", length = 150)
    private String address;

    @Column(name = "SSN", nullable = false, length = 14)
    private String ssn;
}
