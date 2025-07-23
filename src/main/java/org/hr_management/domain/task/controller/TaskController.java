package org.hr_management.domain.task.controller;

import lombok.RequiredArgsConstructor;
import org.hr_management.domain.employee.db.EmployeeEntity;
import org.hr_management.domain.employee.db.EmployeeRepository;
import org.hr_management.domain.status.db.StatusEntity;
import org.hr_management.domain.status.db.StatusRepository;
import org.hr_management.domain.task.db.TaskEntity;
import org.hr_management.domain.task.db.TaskRepository;
import org.hr_management.domain.task.dto.TaskFormDto;
import org.hr_management.domain.task.dto.TaskSimpleDto;
import org.hr_management.domain.task.service.TaskService;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@Controller
@RequestMapping("/task")
public class TaskController {

    private final TaskService taskService;
    private final EmployeeRepository  employeeRepository;
    private final StatusRepository statusRepository;

    @GetMapping("/list")
    public String listTasks(@RequestParam(defaultValue = "OPEN") String status,
                            @RequestParam(defaultValue = "0") int page,
                            @RequestParam(defaultValue = "10") int size,
                            Model model) {
        Page<TaskSimpleDto> taskPage = taskService.getTasksByStatusPaging(status, page, size);
        model.addAttribute("taskPage", taskPage);
        model.addAttribute("currentPage", page);
        model.addAttribute("totalPages", taskPage.getTotalPages());
        model.addAttribute("status", status);
        return "task/list";
    }

    @GetMapping("/info/{id}")
    public String infoTask(@PathVariable("id") Long taskId, Model model) {
        TaskEntity taskDetail = taskService.getTaskDetail(taskId);

        model.addAttribute("taskDetail", taskDetail);

        return "task/info";
    }
    @GetMapping("/new")
    public String newTaskForm(Model model) {
        model.addAttribute("taskFormDto", new TaskFormDto());
        return "task/form";
    }

    @PostMapping("/new")
    public String newTask(@ModelAttribute TaskFormDto formDto, Model model) {
        if (formDto.getTaskTitle() == null || formDto.getTaskTitle().isBlank()) {
            model.addAttribute("error", "업무 제목은 필수입니다.");
            return "task/form";
        }

        TaskEntity task = new TaskEntity();

        //status, emp 있으면 유효성 검증,없으면 null
        if (formDto.getStatusCode() != null && !formDto.getStatusCode().isBlank()) {
            if(statusRepository.findByStatusCode(formDto.getStatusCode()).isEmpty()) {
                model.addAttribute("error", "존재하지 않는 상태 코드입니다.");
                return "task/form";
            }
            task.setStatusCode(statusRepository.findByStatusCode(formDto.getStatusCode()).orElse(null));
        }
        else{
            task.setStatusCode(null);
        }

        if (formDto.getEmpId() != null) {
            if (employeeRepository.findById(formDto.getEmpId()).isEmpty()) {
                model.addAttribute("error", "존재하지 않는 직원 ID입니다.");
                return "task/form";
            }
            task.setEmpId(employeeRepository.findById(formDto.getEmpId()).orElse(null));
        }
        else {
            task.setEmpId(null);
        }

        // 엔티티 저장
        task.setTaskTitle(formDto.getTaskTitle());
        task.setStartDate(formDto.getStartDate());
        task.setDueDate(formDto.getDueDate());
        task.setPriority(formDto.getPriority());
        task.setTaskDescription(formDto.getTaskDescription());
        task.setAssignedDate(formDto.getAssignedDate());
        taskService.saveTask(task);
        return "redirect:/task/list";
    }

//    @DeleteMapping("/delete/{id}")
//    public String deleteTask(@PathVariable("id") Long taskId) {
//
//    }
}
