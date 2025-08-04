package org.hr_management.domain.filter.service;

import lombok.RequiredArgsConstructor;
import org.hr_management.domain.employee.db.EmployeeEntity;
import org.hr_management.domain.employee.db.EmployeeRepository;
import org.hr_management.domain.filter.db.FilterRepository;
import org.hr_management.domain.filter.db.UserFilterEntity;
import org.hr_management.domain.filter.dto.FilterDto;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FilterService {
    private FilterRepository filterRepository;
    private EmployeeRepository employeeRepository;

    public ResponseEntity<?> setUserFilter(FilterDto dto) {

        EmployeeEntity employee = employeeRepository.findById(dto.getEmpId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사원입니다: " + dto.getEmpId()));

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
        return ResponseEntity.ok("필터 등록 완료");
    }

    public List<UserFilterEntity> getUserFilter(Integer empId, String tableName) {
        return filterRepository.findByEmployeeAndTableName(employeeRepository.findById(empId).get(), tableName);

    }
}
