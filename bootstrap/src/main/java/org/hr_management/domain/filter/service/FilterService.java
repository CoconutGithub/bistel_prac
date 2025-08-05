package org.hr_management.domain.filter.service;

import lombok.RequiredArgsConstructor;
import org.hr_management.domain.employee.db.EmployeeEntity;
import org.hr_management.domain.employee.db.EmployeeRepository;
import org.hr_management.domain.filter.db.FilterRepository;
import org.hr_management.domain.filter.db.UserFilterEntity;
import org.hr_management.domain.filter.dto.FilterDto;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FilterService {
    private final FilterRepository filterRepository;
    private final EmployeeRepository employeeRepository;

    @Transactional
    public ResponseEntity<?> setUserFilter(FilterDto dto) {

        EmployeeEntity employee = employeeRepository.findById(dto.getEmpId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사원입니다: " + dto.getEmpId()));

        filterRepository.deleteByEmployeeAndTableName(employee, dto.getTableName());

        List<UserFilterEntity> filters = dto.getFilters().stream()
                .map(f -> {
                    UserFilterEntity entity = new UserFilterEntity();
                    entity.setEmployee(employee);
                    entity.setTableName(dto.getTableName());
                    entity.setFilterName(f.getFilterName());
                    entity.setFilterType(f.getFilterType());
                    entity.setFilterValue(f.getFilterValue());
                    entity.setValueType(f.getValueType());
                    return entity;
                }).collect(Collectors.toList());

        filterRepository.saveAll(filters);
//        System.out.println(filterRepository.findByEmployee(employee));
        return ResponseEntity.ok(filterRepository.findByEmployeeAndTableName(employee, dto.getTableName()));
    }

    public List<UserFilterEntity> getUserFilter(Integer empId, String tableName) {
        EmployeeEntity employee = employeeRepository.findById(empId)
                .orElseThrow(() -> new IllegalArgumentException("해당 사원이 존재하지 않습니다: " + empId));

        List<UserFilterEntity> filters = filterRepository.findByEmployeeAndTableName(employee, tableName);

        if (filters.isEmpty()) {
            UserFilterEntity defaultFilter = new UserFilterEntity();
            defaultFilter.setEmployee(employee);
            defaultFilter.setTableName(tableName);
            defaultFilter.setFilterName("default");
            defaultFilter.setFilterType("equals");
            defaultFilter.setFilterValue("");
            defaultFilter.setValueType("text");

            filterRepository.save(defaultFilter);

            return List.of(defaultFilter);
        }

        return filters;
    }
}
