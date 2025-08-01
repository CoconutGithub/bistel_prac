package org.hr_management.domain.task.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
public class TaskListDto {
    private Long taskId;
    private String taskTitle;
    private LocalDate startDate;
    private LocalDate dueDate;
    private String taskDescription;
    private String statusCode;
    private String priority;
    private LocalDate assignedDate;
    private Integer empId;

}
