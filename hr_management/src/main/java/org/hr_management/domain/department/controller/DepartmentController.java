package org.hr_management.domain.department.controller;

import lombok.RequiredArgsConstructor;
import org.hr_management.domain.department.db.DepartmentRepository;
import org.hr_management.domain.department.service.DepartmentService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class DepartmentController {

    private final DepartmentService departmentService;

    @GetMapping("/department/names")
    public List<String> getDepartmentNames() {
        return departmentService.getDepartmentNames();
    }
}
