package org.hr_management.domain.task.db;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hr_management.domain.employee.db.EmployeeEntity;
import org.hr_management.domain.status.db.StatusEntity;

import java.time.LocalDate;
import java.util.Date;

@Entity
@Table(name = "TASK")
@Getter
@Setter
@SequenceGenerator(
        name = "task_seq_generator",
        sequenceName = "task_id_seq",
        allocationSize = 1
)
public class TaskEntity {

    @Id
    @Column(name = "TASK_ID")
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "task_seq_generator")
    private Long taskId;

    @Column(name = "TASK_TITLE", length = 100, nullable = false)
    private String taskTitle;

    @Column(name = "START_DATE")
    private LocalDate startDate;

    @Column(name = "DUE_DATE")
    private LocalDate dueDate;

    @JoinColumn(name = "STATUS_CODE")
    @ManyToOne(fetch = FetchType.LAZY)
    private StatusEntity statusCode;

    @Column(name = "PRIORITY")
    private Integer priority;

    @Lob
    @Column(name = "TASK_DESCRIPTION")
    private String taskDescription;

    @Column(name = "ASSIGNED_DATE")
    private LocalDate assignedDate;

    @JoinColumn(name = "EMP_ID")
    @ManyToOne(fetch = FetchType.LAZY)
    private EmployeeEntity empId;


}
