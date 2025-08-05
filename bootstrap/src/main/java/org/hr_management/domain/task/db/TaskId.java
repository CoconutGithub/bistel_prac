package org.hr_management.domain.task.db;
import lombok.EqualsAndHashCode;
import java.io.Serializable;
@EqualsAndHashCode
public class TaskId implements Serializable {
    private Long taskId;
    private Integer employee;

    public TaskId() {}

    public TaskId(Long taskId, Integer employee) {
        this.taskId = taskId;
        this.employee = employee;
    }
}

