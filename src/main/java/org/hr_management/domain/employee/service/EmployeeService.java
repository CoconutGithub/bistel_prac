package org.hr_management.domain.employee.service;

import org.hr_management.domain.employee.db.EmployeeEntity;
import org.hr_management.domain.employee.db.EmployeeRepository;
import org.hr_management.domain.employee.db.EmployeeSimpleDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class EmployeeService {

    private final EmployeeRepository employeeRepository;

    @Autowired
    public EmployeeService(
            EmployeeRepository employeeRepository
    ) {
        this.employeeRepository = employeeRepository;
    }

    public Page<EmployeeSimpleDto> getEmployeesByPaging(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return employeeRepository.findEmployeeSummaries(pageable);
    }

    public EmployeeEntity findById(Integer id) {
        return employeeRepository.findById(id).orElse(null);
    }

    public EmployeeEntity save(EmployeeEntity employeeEntity) {
        return employeeRepository.save(employeeEntity);
    }

    public void deleteById(Integer id) {
        employeeRepository.deleteById(id);
    }
}
