package org.hr_management.domain.task.db;

import org.hr_management.domain.task.dto.TaskListDto;
import org.hr_management.domain.task.dto.TaskSimpleDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<TaskEntity, TaskId> {

    @Query("SELECT new org.hr_management.domain.task.dto.TaskSimpleDto(t.taskId, t.taskTitle, t.taskDescription) " +
            "FROM TaskEntity t WHERE t.statusCode.statusCode = :status")
    Page<TaskSimpleDto> findByStatusCode(@Param("status") String status, Pageable pageable);


    @Query("""
    SELECT new org.hr_management.domain.task.dto.TaskListDto(
        t.taskId,
        t.taskTitle,
        t.startDate,
        t.dueDate,
        t.taskDescription,
        s.statusCode,
        CAST(t.priority AS string),
        t.assignedDate,
        e.empId
    )
    FROM TaskEntity t
    LEFT JOIN t.statusCode s
    LEFT JOIN t.employee e
""")
    List<TaskListDto> findAllTasks();

    TaskEntity findByTaskId(Long taskId);
}
