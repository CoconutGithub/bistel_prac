package org.hr_management.domain.employee.controller;

import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.hr_management.domain.department.db.DepartmentEntity;
import org.hr_management.domain.department.service.DepartmentService;
import org.hr_management.domain.employee.db.EmployeeEntity;
import org.hr_management.domain.employee.db.EmployeeSimpleDto;
import org.hr_management.domain.employee.dto.EmployeeListDto;
import org.hr_management.domain.employee.dto.EmployeeRegisterRequest;
import org.hr_management.domain.employee.dto.EmployeeUpdateDto;
import org.hr_management.domain.employee.service.EmployeeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/employee")
@Slf4j
public class EmployeeController {

    private final EmployeeService employeeService;
    private final DepartmentService departmentService;

    @Autowired
    public EmployeeController(EmployeeService employeeService, DepartmentService departmentService) {
        this.employeeService = employeeService;
        this.departmentService = departmentService;
    }

    @GetMapping("/all")
    public List<EmployeeListDto> getEmployees() {
        return employeeService.getEmployeesByList();
    }

//    @GetMapping("/info/{id}")
//    public ResponseEntity<?> getEmployeeById(@PathVariable(name = "id") Integer empId) {
//        EmployeeEntity employee = employeeService.getEmployeeDetail(empId);
//
//        return ResponseEntity.ok(employee);
//    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteEmployee(@PathVariable(name = "id") Integer empId) {
        employeeService.deleteById(empId);
        return ResponseEntity.ok("Employee deleted");
    }

    @PatchMapping("/update/{id}")
    public ResponseEntity<?> updateEmployee(@PathVariable(name = "id") Integer empId,@RequestBody EmployeeUpdateDto dto) {
        employeeService.updateEmployee(empId, dto);
        return ResponseEntity.ok("Employee updated");
    }
    @PostMapping("")
    public ResponseEntity<?> registerEmployee(@Valid @RequestBody EmployeeRegisterRequest request) {
        employeeService.registerEmployee(request);
        return ResponseEntity.ok().build();
    }


    //=======================================================직원 목록 ag grid 테스트

//
//    @Operation(
//            summary = "직원 등록 페이지 조회",
//            description = "직원 등록할 수 있는 페이지를 리턴한다."
//    )
//    @GetMapping("/register")
//    public String getRegisterForm(Model model) {
//        List<String> departmentNames = departmentService.getDepartmentNames();
//        log.info("departmentNames: {}", departmentNames);
//        model.addAttribute("departmentNames", departmentNames);
//        model.addAttribute("request", new EmployeeRegisterRequest());
//        return "employee/register";
//    }




}
