package org.hr_management.domain.task.controller;

import lombok.RequiredArgsConstructor;
import org.hr_management.domain.task.db.TaskEntity;
import org.hr_management.domain.task.db.TaskRepository;
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

//    @PostMapping("/new")
//    public String newTask(@ModelAttribute TaskEntity taskEntity) {
//
//    }
}
