package org.hr_management.domain.task.db;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hr_management.domain.employee.db.EmployeeEntity;
import org.hr_management.domain.status.StatusEntity;

import java.util.Date;

@Entity
@Table(name = "TASK")
@Getter
@Setter
public class TaskEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "TASK_ID")
    private Long taskId;

    @Column(name = "TASK_TITLE", length = 100, nullable = false)
    private String taskTitle;

    @Column(name = "START_DATE")
    @Temporal(TemporalType.DATE)
    private Date startDate;

    @Column(name = "DUE_DATE")
    @Temporal(TemporalType.DATE)
    private Date dueDate;

    @JoinColumn(name = "STATUS_CODE")
    @ManyToOne(fetch = FetchType.LAZY)
    private StatusEntity statusCode;

    @Column(name = "PRIORITY")
    private Integer priority;

    @Lob
    @Column(name = "TASK_DESCRIPTION")
    private String taskDescription;

    @Column(name = "ASSIGNED_DATE")
    @Temporal(TemporalType.DATE)
    private Date assignedDate;

    @JoinColumn(name = "EMP_ID")
    @ManyToOne(fetch = FetchType.LAZY)
    private EmployeeEntity empId;


}
