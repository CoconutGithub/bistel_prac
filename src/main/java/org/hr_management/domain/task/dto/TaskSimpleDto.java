package org.hr_management.domain.task.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@AllArgsConstructor
@Getter
@Setter
public class TaskSimpleDto {
    private Long taskId;
    private String taskTitle;
    private String taskDescription;
}
