package org.hr_management.domain.monthly_salary.controller;


import lombok.RequiredArgsConstructor;
import org.hr_management.domain.monthly_salary.dto.PaymentDto;
import org.hr_management.domain.monthly_salary.service.MonthlySalaryService;
import org.hr_management.domain.task.db.TaskEntity;
import org.hr_management.domain.task.service.TaskService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@Controller
@RequestMapping("/salary")
public class MonthlySalaryController {

    private final MonthlySalaryService monthlySalaryService;

    @GetMapping("/pay/{id}")
    public String paymentForm(@PathVariable("id") Long m_salId, Model model) {
        model.addAttribute("paymentDto", new PaymentDto());
        model.addAttribute("empId", m_salId);
        return "/salary/pay";
    }

    @PostMapping("/pay/{id}")
    public String employeePayment(@PathVariable(name = "id") Integer empId,
                                  @ModelAttribute PaymentDto paymentDto
    ) {
        if (paymentDto.getType().equals("default")) {
            monthlySalaryService.defaultPayment();
        } else {
            monthlySalaryService.customPayment(paymentDto,empId);
        }

        return "redirect:/employee/list";
    }
}
