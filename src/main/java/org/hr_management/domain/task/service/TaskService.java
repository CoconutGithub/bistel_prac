package org.hr_management.domain.task.service;

import lombok.RequiredArgsConstructor;
import org.hr_management.domain.employee.db.EmployeeRepository;
import org.hr_management.domain.status.db.StatusRepository;
import org.hr_management.domain.task.db.TaskEntity;
import org.hr_management.domain.task.db.TaskId;
import org.hr_management.domain.task.db.TaskRepository;
import org.hr_management.domain.task.dto.TaskFormDto;
import org.hr_management.domain.task.dto.TaskListDto;
import org.hr_management.domain.task.dto.TaskSimpleDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@RequiredArgsConstructor
@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final StatusRepository statusRepository;
    private final EmployeeRepository employeeRepository;

//    public Page<TaskSimpleDto> getTasksByStatusPaging(String status, int page, int size) {
//        Pageable pageable = PageRequest.of(page, size);
//        return taskRepository.findByStatusCode(status, pageable);
//    }

    public List<TaskListDto> findAllTasks() {
        return taskRepository.findAllTasks();
    }
//
//    public TaskEntity getTaskDetail(Long taskId) {
//        return taskRepository.findById(taskId).orElse(null);
//    }

    public void deleteTask(Long taskId, Integer empId) {
        TaskId id = new TaskId(taskId, empId);
        taskRepository.deleteById(id);}

    public ResponseEntity<?> registerTask(TaskFormDto formDto) {
        TaskEntity task = new TaskEntity();

        if(formDto.getTaskId() != null) {
            task.setTaskId(formDto.getTaskId());
        }

        //status, emp 있으면 유효성 검증,없으면 null
        if (formDto.getStatusCode() != null && !formDto.getStatusCode().isBlank()) {
            if(statusRepository.findByStatusCode(formDto.getStatusCode()).isEmpty()) {
                return ResponseEntity.badRequest().body("존재하지 않는 상태 코드입니다.");
            }
            task.setStatusCode(statusRepository.findByStatusCode(formDto.getStatusCode()).orElse(null));
        }
        else{
            task.setStatusCode(null);
        }

        if (formDto.getEmpId() != null) {
            if (employeeRepository.findById(formDto.getEmpId()).isEmpty()) {
                return ResponseEntity.badRequest().body("존재하지 않는 사번입니다.");
            }
            task.setEmployee(employeeRepository.findById(formDto.getEmpId()).orElse(null));
        }

        // 엔티티 저장
        task.setTaskTitle(formDto.getTaskTitle());
        task.setStartDate(formDto.getStartDate());
        task.setDueDate(formDto.getDueDate());
        task.setPriority(formDto.getPriority());
        task.setTaskDescription(formDto.getTaskDescription());
        task.setAssignedDate(formDto.getAssignedDate());
        taskRepository.save(task);
        return ResponseEntity.ok().build();
    }

    public void saveTask(TaskEntity task) {
        taskRepository.save(task);
    }

    @Transactional
    public void updateTask(Long taskId, TaskFormDto dto) {
        TaskId id = new TaskId(taskId,dto.getEmpId());

        TaskEntity t = taskRepository.findById(id).orElseThrow(()->new IllegalArgumentException("Invalid taskId: " + taskId));

        t.setTaskTitle(dto.getTaskTitle());
        t.setStartDate(dto.getStartDate());
        t.setDueDate(dto.getDueDate());
        t.setStatusCode(statusRepository
                .findByStatusCode(dto.getStatusCode())
                .orElseThrow(() -> new RuntimeException("Status not found")));
        t.setPriority(dto.getPriority());
        t.setTaskDescription(dto.getTaskDescription());
        t.setAssignedDate(dto.getAssignedDate());

        taskRepository.save(t);
    }
}
