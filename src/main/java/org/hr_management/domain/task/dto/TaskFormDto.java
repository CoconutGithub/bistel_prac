package org.hr_management.domain.task.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.Date;

@Getter
@Setter
public class TaskFormDto {
    private String taskTitle;
    private LocalDate startDate;
    private LocalDate dueDate;
    private String statusCode;
    private Integer priority;
    private String taskDescription;
    private LocalDate assignedDate;
    private Integer empId;
}
