package org.hr_management.domain.employee.db;

import jakarta.persistence.*;
import lombok.*;
import org.hr_management.domain.department.DepartmentEntity;
import org.hr_management.domain.employee_status.EmployeeStatusEntity;
import org.hr_management.domain.position.PositionEntity;

import java.time.LocalDate;

@Entity
@Table(name = "employee")
@SequenceGenerator(
        name = "employee_seq_generator",
        sequenceName = "employee_id_seq",
        allocationSize = 1
)
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "employee_seq_generator")
    private Integer empId;

    @Column(name = "FIRST_NAME", nullable = false, length = 10)
    private String firstName;

    @Column(name = "LAST_NAME", nullable = false, length = 10)
    private String lastName;

    @Column(name = "HIRE_DATE", nullable = false)
    private LocalDate hireDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "DEPT_ID")
    private DepartmentEntity dept;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "POSITION_ID")
    private PositionEntity position;

    @Column(name = "SALARY", precision = 13)
    private Long salary;

    @Column(name = "COMM", precision = 13)
    private Long comm;

    @Column(name = "PHONE_NUMBER", length = 20)
    private String phoneNumber;

    @Column(name = "EMAIL", length = 50)
    private String email;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "STATUS_CODE")
    private EmployeeStatusEntity status;

    @Column(name = "ADDRESS", length = 150)
    private String address;

    @Column(name = "SSN", nullable = false, length = 14)
    private String ssn;
}
