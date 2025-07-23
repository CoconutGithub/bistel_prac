package org.hr_management.domain.task.service;

import lombok.RequiredArgsConstructor;
import org.hr_management.domain.task.db.TaskEntity;
import org.hr_management.domain.task.db.TaskRepository;
import org.hr_management.domain.task.dto.TaskSimpleDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class TaskService {

    private final TaskRepository taskRepository;

    public Page<TaskSimpleDto> getTasksByStatusPaging(String status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return taskRepository.findByStatusCode(status, pageable);
    }

    public TaskEntity getTaskDetail(Long taskId) {
        return taskRepository.findById(taskId).orElse(null);
    }

    public void saveTask(TaskEntity task) {
        taskRepository.save(task);
    }

}
