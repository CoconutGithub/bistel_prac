package org.hr_management.domain.department;

import jakarta.persistence.*;
import lombok.*;
import org.hr_management.domain.location.LocationEntity;

import java.util.List;

@Entity
@Table(name = "department")
@SequenceGenerator(
        name = "department_seq_generator",
        sequenceName = "department_id_seq",
        allocationSize = 1
)
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DepartmentEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "department_seq_generator")
    private Integer deptId;

    private String deptName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "LOCATION_ID")
    private LocationEntity location;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PARENT_DEPT_ID")
    private DepartmentEntity parentDept;

    @OneToMany(mappedBy = "parentDept")
    private List<DepartmentEntity> children;

    // TODO Employee 추가

}
