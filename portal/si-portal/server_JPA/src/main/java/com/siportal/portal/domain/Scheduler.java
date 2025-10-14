package com.siportal.portal.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import jakarta.persistence.Id;
import java.time.LocalDateTime;

@Entity
@Table(name = "P_SCHEDULER",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = "JOB_NAME", name = "P_SCHEDULER_UNIQUE_JOB_NAME"),
                @UniqueConstraint(columnNames = "TRIGGER_KEY", name = "P_SCHEDULER_UNIQUE_TRIGGER_NAME")
        }
)
@Getter
@Setter
@NoArgsConstructor
public class Scheduler {

    @Id
    @Column(name = "JOB_NAME", nullable = false)
    private String jobName;

    @Column(name = "GROUP_NAME", nullable = false)
    private String groupName;

    @Column(name = "TRIGGER_KEY", nullable = false)
    private String triggerKey;

    @Column(name = "CLASS_NAME", nullable = false)
    private String className;

    @Column(name = "CRON_TAB", nullable = false)
    private String cronTab;

    @Column(name = "CREATE_DATE")
    private LocalDateTime createDate;

    @Column(name = "CREATE_BY")
    private String createBy;

    @Column(name = "UPDATE_DATE")
    private LocalDateTime updateDate;

    @Column(name = "UPDATE_BY")
    private String updateBy;

    @Column(name = "STATUS")
    private String status;
//
//    @Column(name = "GRID_ROW_ID")
//    private String gridRowId;
}
