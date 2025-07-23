package org.hr_management.domain.task.db;

import org.hr_management.domain.task.dto.TaskSimpleDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface TaskRepository extends JpaRepository<TaskEntity,Long> {


    @Query("SELECT new org.hr_management.domain.task.dto.TaskSimpleDto(t.taskId, t.taskTitle, t.taskDescription) " +
            "FROM TaskEntity t WHERE t.statusCode = :status")
    Page<TaskSimpleDto> findByStatusCode(@Param("status") String status, Pageable pageable);

}
