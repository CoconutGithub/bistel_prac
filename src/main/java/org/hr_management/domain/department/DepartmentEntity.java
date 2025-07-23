package org.hr_management.domain.department;

import jakarta.persistence.*;
import lombok.*;
import org.hr_management.domain.employee.db.EmployeeEntity;

import java.util.List;

@Entity
@Table(name = "department")
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DepartmentEntity {

    @Id
    private Integer deptId;

    private String deptName;

    @Column(length = 150, name = "DEPT_ADDRESS")
    private String deptAddress;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PARENT_DEPT_ID")
    private DepartmentEntity parentDept;

    @OneToMany(mappedBy = "parentDept")
    private List<DepartmentEntity> children;

    @ManyToOne
    @JoinColumn(name = "MANAGER_ID")
    private EmployeeEntity manager;
}
