package org.hr_management.domain.filter.db;

import org.hr_management.domain.employee.db.EmployeeEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.logging.Filter;

public interface FilterRepository extends JpaRepository<UserFilterEntity, FilterId> {
    List<UserFilterEntity> findByEmployeeAndTableName(EmployeeEntity employee, String tableName);

}
