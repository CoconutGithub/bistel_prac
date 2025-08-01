package org.hr_management.domain.employee.service;

import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.hr_management.domain.department.db.DepartmentEntity;
import org.hr_management.domain.department.db.DepartmentRepository;
import org.hr_management.domain.employee.db.EmployeeEntity;
import org.hr_management.domain.employee.db.EmployeeRepository;
import org.hr_management.domain.employee.db.EmployeeSimpleDto;
import org.hr_management.domain.employee.dto.EmployeeListDto;
import org.hr_management.domain.employee.dto.EmployeeRegisterRequest;
import org.hr_management.domain.employee.dto.EmployeeUpdateDto;
import org.hr_management.domain.status.db.StatusEntity;
import org.hr_management.domain.status.db.StatusRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

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

//    public Page<EmployeeSimpleDto> getEmployeesByPaging(int page, int size) {
//        Pageable pageable = PageRequest.of(page, size);
//        return employeeRepository.findEmployeeSummaries(pageable);
//    }
    public List<EmployeeListDto> getEmployeesByList() {
//        Pageable pageable = PageRequest.of(page, size,Sort.by(Sort.Direction.ASC, "empId"));
        return employeeRepository.findAllEmployees();
    }
    public boolean authenticate(String userId, String password) {
        return employeeRepository.findByUserIdAndPassword(userId, password).isPresent();
    }
    public boolean isIdDuplicate(String id) {
        return employeeRepository.existsByUserId(id);
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
                .userId(request.getUserId())
                .password(request.getPassword())
                .build();

        return employeeRepository.save(entity);
    }
    @Transactional
    public void excelRegister(List<EmployeeRegisterRequest> requestList) {
        List<EmployeeEntity> entities = requestList.stream().map(req -> EmployeeEntity.builder()
                .firstName(req.getFirstName())
                .lastName(req.getLastName())
                .engName(req.getEngName())
                .phoneNumber(req.getPhoneNumber())
                .email(req.getEmail())
                .address(req.getAddress())
                .ssn(req.getSsn())
                .dept(departmentRepository.findDepartmentByDeptName(req.getDeptName())
                        .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 부서입니다: " + req.getDeptName())))
                .position(req.getPosition())
                .annualSalary(req.getAnnualSalary())
                .hireDate(req.getHireDate())
                .status(statusRepository.findByStatusCode("ACTIVE") // 기본적으로 재직 상태
                        .orElseThrow(() -> new IllegalArgumentException("기본 상태 코드가 존재하지 않습니다.")))
                .userId(req.getUserId())
                .password(req.getPassword())
                .build()).toList();

        employeeRepository.saveAll(entities);
    }

    @Transactional
    public void updateEmployee(Integer empId, EmployeeUpdateDto dto) {
        EmployeeEntity e = employeeRepository.findById(empId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid empId: " + empId));

        e.setEngName(dto.getEngName());
        e.setHireDate(dto.getHireDate());
        e.setQuitDate(dto.getQuitDate());

        // Department, Status 매핑
        e.setDept(departmentRepository
                .findDepartmentByDeptName(dto.getDepartment())
                .orElseThrow(() -> new RuntimeException("Department not found")));

        e.setPosition(dto.getPosition());
        e.setAnnualSalary(dto.getAnnualSalary());
        e.setPhoneNumber(dto.getPhoneNumber());
        e.setEmail(dto.getEmail());
        e.setAddress(dto.getAddress());

        e.setStatus(statusRepository
                .findByStatusCode(dto.getStatus())
                .orElseThrow(() -> new RuntimeException("Status not found")));
    }
}
