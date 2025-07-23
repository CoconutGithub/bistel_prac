package org.hr_management.domain.monthly_salary.controller;


import lombok.RequiredArgsConstructor;
import org.hr_management.domain.monthly_salary.service.MonthlySalaryService;
import org.hr_management.domain.task.service.TaskService;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@RequiredArgsConstructor
@Controller
@RequestMapping("/salary")
public class MonthlySalaryController {

    private final MonthlySalaryService monthlySalaryService;

}
