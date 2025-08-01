package org.hr_management.domain.task.db;

import jakarta.persistence.*;
import lombok.*;
import org.hr_management.domain.employee.db.EmployeeEntity;
import org.hr_management.domain.status.db.StatusEntity;

import java.time.LocalDate;
import java.util.Date;

@Entity
@Table(name = "TASK")
@IdClass(TaskId.class)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
//@SequenceGenerator(
//        name = "task_seq_generator",
//        sequenceName = "task_id_seq",
//        allocationSize = 1
//)
public class TaskEntity {

    @Id
    @Column(name = "TASK_ID")
//    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "task_seq_generator")
    private Long taskId;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "EMP_ID", nullable = false)
    private EmployeeEntity employee;

    @Column(name = "TASK_TITLE", length = 100, nullable = false)
    private String taskTitle;

    @Column(name = "START_DATE")
    private LocalDate startDate;

    @Column(name = "DUE_DATE")
    private LocalDate dueDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "STATUS_CODE")
    private StatusEntity statusCode;

    @Column(name = "PRIORITY")
    private Integer priority;

    @Lob
    @Column(name = "TASK_DESCRIPTION")
    private String taskDescription;

    @Column(name = "ASSIGNED_DATE")
    private LocalDate assignedDate;
}
