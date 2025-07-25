package org.hr_management.domain.employee.controller;

import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.hr_management.domain.department.db.DepartmentEntity;
import org.hr_management.domain.department.service.DepartmentService;
import org.hr_management.domain.employee.db.EmployeeEntity;
import org.hr_management.domain.employee.db.EmployeeSimpleDto;
import org.hr_management.domain.employee.dto.EmployeeRegisterRequest;
import org.hr_management.domain.employee.dto.EmployeeUpdateRequest;
import org.hr_management.domain.employee.service.EmployeeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
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

    @GetMapping("")
    public String getEmployees(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10")  int size,
            Model model
    ) {
        Page<EmployeeSimpleDto> employeePage= employeeService.getEmployeesByPaging(page, size);

        model.addAttribute("employeePage", employeePage);
        model.addAttribute("currentPage", page);
        model.addAttribute("totalPages", employeePage.getTotalPages());

        return "employee/list"; // src/main/resources/templates/employee/list.html
    }

    @GetMapping("/{id}")
    public String getEmployeeById(
            @PathVariable(name = "id") Integer empId,
            Model model
    ) {
        EmployeeEntity employee= employeeService.getEmployeeDetail(empId);
        model.addAttribute("employee", employee);

        return "employee/info";
    }

    @DeleteMapping("/{id}")
    public String deleteEmployee(
        @PathVariable(name = "id") Integer empId,
        Model model
    ) {
        employeeService.deleteById(empId);
        return "redirect:/employee?message=deleted";
    }

    @Operation(
            summary = "직원 등록 페이지 조회",
            description = "직원 등록할 수 있는 페이지를 리턴한다."
    )
    @GetMapping("/register")
    public String getRegisterForm(Model model) {
        List<String> departmentNames = departmentService.getDepartmentNames();
        log.info("departmentNames: {}", departmentNames);
        model.addAttribute("departmentNames", departmentNames);
        model.addAttribute("request", new EmployeeRegisterRequest());
        return "employee/register";
    }


    @PostMapping("")
    public String registerEmployee(
        @Valid @ModelAttribute("request") EmployeeRegisterRequest request,
        BindingResult bindingResult,
        Model model
    ) {
        if(bindingResult.hasErrors()) {
            List<String> departmentNames = departmentService.getDepartmentNames();
            model.addAttribute("departmentNames", departmentNames);
            return "employee/register";
        }
        log.info("Employee registering request Dept Name: {}", request.getDeptName());

        employeeService.registerEmployee(request);

        return "redirect:/employee";
    }


    @PatchMapping("/{id}")
    public String updateEmployee(
            @Valid @ModelAttribute("request") EmployeeUpdateRequest request,
            BindingResult bindingResult,
            Model model
    ) {
        if(bindingResult.hasErrors()) {
            return "employee/register";
        }
        employeeService.updateEmployee(request);

        return "redirect:/employee";
    }
}
