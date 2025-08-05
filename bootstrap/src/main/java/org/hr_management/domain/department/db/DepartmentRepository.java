package org.hr_management.domain.department.db;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface DepartmentRepository extends JpaRepository<DepartmentEntity, Integer> {

    @Query("SELECT d.deptName " +
            "FROM DepartmentEntity d ")
    List<String> findDepartmentNames();

    Optional<DepartmentEntity> findDepartmentByDeptName(String name);
}
