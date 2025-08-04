package org.hr_management.domain.filter.db;

import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hr_management.domain.employee.db.EmployeeEntity;

import java.io.Serializable;

@Getter
@EqualsAndHashCode
@AllArgsConstructor
@NoArgsConstructor
public class FilterId implements Serializable {
    private EmployeeEntity employee;
    private String tableName;
    private String filterName;
    private String filterType;
}
