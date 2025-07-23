package org.hr_management.domain.employee.db;

public record EmployeeSimpleDto(
        Integer empId,
        String fullName,
        String deptName,
        String position,
        String statusName
) {
}
