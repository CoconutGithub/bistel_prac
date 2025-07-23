package org.hr_management.domain.employee.service;

import lombok.extern.slf4j.Slf4j;
import org.hr_management.domain.department.db.DepartmentEntity;
import org.hr_management.domain.department.db.DepartmentRepository;
import org.hr_management.domain.employee.db.EmployeeEntity;
import org.hr_management.domain.employee.db.EmployeeRepository;
import org.hr_management.domain.employee.db.EmployeeSimpleDto;
import org.hr_management.domain.employee.dto.EmployeeRegisterRequest;
import org.hr_management.domain.status.db.StatusEntity;
import org.hr_management.domain.status.db.StatusRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final StatusRepository statusRepository;

    @Autowired
    public EmployeeService(
            EmployeeRepository employeeRepository,
            DepartmentRepository departmentRepository,
            StatusRepository statusRepository
    ) {
        this.employeeRepository = employeeRepository;
        this.departmentRepository = departmentRepository;
        this.statusRepository = statusRepository;
    }

    public Page<EmployeeSimpleDto> getEmployeesByPaging(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return employeeRepository.findEmployeeSummaries(pageable);
    }

    // TODO null 일 때 예외처리 추가
    public EmployeeEntity findById(Integer id) {
        return employeeRepository.findById(id).orElse(null);
    }

    public EmployeeEntity save(EmployeeEntity employeeEntity) {
        return employeeRepository.save(employeeEntity);
    }

    public void deleteById(Integer id) {
        employeeRepository.deleteById(id);
    }

    public EmployeeEntity getEmployeeDetail(Integer empId) {
        return employeeRepository.findById(empId).orElse(null);
    }

    public EmployeeEntity registerEmployee(EmployeeRegisterRequest request) {
        log.info("Employee registering request {}", request);
        DepartmentEntity deptEntity = departmentRepository.findDepartmentByDeptName(request.getDeptName()).orElseThrow(() -> new RuntimeException("Department not found"));
        StatusEntity statusEntity = statusRepository.findByStatusCode("ACTIVE").orElseThrow(() -> new RuntimeException("Status not found"));

        EmployeeEntity entity = EmployeeEntity.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .engName(request.getEngName())
                .hireDate(request.getHireDate())
                .dept(deptEntity)
                .position(request.getPosition())
                .annualSalary(request.getAnnualSalary())
                .phoneNumber(request.getPhoneNumber())
                .email(request.getEmail())
                .status(statusEntity)
                .address(request.getAddress())
                .ssn(request.getSsn())
                .build()
                ;

        return employeeRepository.save(entity);
    }
}
