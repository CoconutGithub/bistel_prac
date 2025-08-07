package org.hr_management.domain.employee.controller;

import io.swagger.v3.oas.annotations.Operation;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.hr_management.domain.department.db.DepartmentEntity;
import org.hr_management.domain.department.service.DepartmentService;
import org.hr_management.domain.employee.db.EmployeeEntity;
import org.hr_management.domain.employee.db.EmployeeSimpleDto;
import org.hr_management.domain.employee.dto.EmployeeListDto;
import org.hr_management.domain.employee.dto.EmployeeRegisterRequest;
import org.hr_management.domain.employee.dto.EmployeeUpdateDto;
import org.hr_management.domain.employee.dto.LoginDto;
import org.hr_management.domain.employee.service.EmployeeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Objects;

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
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginDto request, HttpServletResponse response) {
        if (!Objects.equals(employeeService.authenticate(request.getUserId(), request.getPassword()), "로그인 정보 오류")) {
            String token = employeeService.authenticate(request.getUserId(), request.getPassword());

            Cookie cookie = new Cookie("token", token);
            cookie.setMaxAge(86400);
            cookie.setPath("/");

            response.addCookie(cookie);

//            return ResponseEntity.ok(Map.of("token", "Bearer " + token)).header(HttpHeaders.SET_COOKIE, cookie.toString());
            return ResponseEntity.ok("Login successful");
            // return ResponseEntity.ok(Map.of("token", "Bearer " + token));
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        Cookie cookie = new Cookie("token", null);
        cookie.setMaxAge(0);
        cookie.setPath("/");
        response.addCookie(cookie);
        return ResponseEntity.ok("Logout successful");
    }

    @GetMapping("/check")
    public ResponseEntity<Boolean> checkIdDuplicate(@RequestParam String userId) {
        boolean isDuplicate = employeeService.isIdDuplicate(userId);
        return ResponseEntity.ok(isDuplicate);
    }

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

    @PostMapping("/excel")
    public ResponseEntity<?> inportEmployeeExcel(@RequestBody List<@Valid EmployeeRegisterRequest> requestList) {
        employeeService.excelRegister(requestList);
        return ResponseEntity.ok("직원 정보가 성공적으로 등록되었습니다.");
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        Integer empId = (Integer) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return ResponseEntity.ok(empId);
    }

    @GetMapping("/exist/{empId}")
    public ResponseEntity<?> getEmployeeExists(@PathVariable Integer empId) {
        if (employeeService.isEmpExist(empId)) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
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
