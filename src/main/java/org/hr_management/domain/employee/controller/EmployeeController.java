package org.hr_management.domain.employee.controller;

import org.hr_management.domain.employee.db.EmployeeEntity;
import org.hr_management.domain.employee.db.EmployeeSimpleDto;
import org.hr_management.domain.employee.service.EmployeeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping("/employee")
public class EmployeeController {

    private final EmployeeService employeeService;

    @Autowired
    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
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
}
