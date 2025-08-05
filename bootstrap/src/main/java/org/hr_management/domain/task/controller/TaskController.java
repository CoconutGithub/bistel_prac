package org.hr_management.domain.task.controller;

import lombok.RequiredArgsConstructor;
import org.hr_management.domain.employee.db.EmployeeEntity;
import org.hr_management.domain.employee.db.EmployeeRepository;
import org.hr_management.domain.status.db.StatusEntity;
import org.hr_management.domain.status.db.StatusRepository;
import org.hr_management.domain.task.db.TaskEntity;
import org.hr_management.domain.task.db.TaskRepository;
import org.hr_management.domain.task.dto.TaskFormDto;
import org.hr_management.domain.task.dto.TaskListDto;
import org.hr_management.domain.task.dto.TaskSimpleDto;
import org.hr_management.domain.task.service.TaskService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/task")
public class TaskController {

    private final TaskService taskService;
    private final EmployeeRepository  employeeRepository;
    private final StatusRepository statusRepository;

    @GetMapping("/all")
    public List<TaskListDto> listTasks() {
        return taskService.findAllTasks();
    }

//    @GetMapping("/info/{id}")
//    public String infoTask(@PathVariable("id") Long taskId, Model model) {
//        TaskEntity taskDetail = taskService.getTaskDetail(taskId);
//
//        model.addAttribute("taskDetail", taskDetail);
//
//        return "task/info";
//    }
//    @GetMapping("/new")
//    public String newTaskForm(Model model) {
//        model.addAttribute("taskFormDto", new TaskFormDto());
//        return "task/form";
//    }

    @PostMapping("/new")
    public ResponseEntity<?> newTask(@RequestBody TaskFormDto formDto) {
        return taskService.registerTask(formDto);
    }

    @DeleteMapping("/delete/{taskId}/{empId}")
    public ResponseEntity<?> deleteTask(@PathVariable("taskId") Long taskId,@PathVariable("empId") Integer empId) {
        taskService.deleteTask(taskId,empId);
        return ResponseEntity.ok("task deleted");
    }

    @PatchMapping("/update/{taskId}/{empId}")
    public ResponseEntity<?> updateTask(@PathVariable("taskId") Long taskId,@PathVariable("empId") Integer empId,@RequestBody TaskFormDto dto) {
        dto.setEmpId(empId);
        taskService.updateTask(taskId,dto);
        return ResponseEntity.ok("task updated");
    }
}
