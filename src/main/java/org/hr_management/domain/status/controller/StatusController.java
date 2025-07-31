package org.hr_management.domain.status.controller;

import lombok.RequiredArgsConstructor;
import org.hr_management.domain.department.service.DepartmentService;
import org.hr_management.domain.status.service.StatusService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class StatusController {

    private final StatusService statusService;

    @GetMapping("/status/codes/task")
    public List<String> getStatusCodesTask() {
        return statusService.getStatusCodes("TASK");
    }
    @GetMapping("/status/codes/emp")
    public List<String> getStatusCodesEmp() {
        return statusService.getStatusCodes("EMPLOYEE");
    }
}
