package org.hr_management.domain.employee.db;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface EmployeeRepository extends JpaRepository<EmployeeEntity, Integer> {

    @Query("""
    SELECT new org.hr_management.domain.employee.db.EmployeeSimpleDto(
        e.empId,
        CONCAT(e.firstName, ' ', e.lastName),
        d.deptName,
        e.position,
        s.statusName
    )
    FROM EmployeeEntity e
    JOIN e.dept d
    JOIN e.status s
""")
    Page<EmployeeSimpleDto> findEmployeeSummaries(Pageable pageable);
}
