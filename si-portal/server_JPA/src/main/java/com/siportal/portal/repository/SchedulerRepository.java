package com.siportal.portal.repository;

import com.siportal.portal.domain.Scheduler;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface SchedulerRepository extends JpaRepository<Scheduler, String> {
    @Query(value = "SELECT JOB_NAME, GROUP_NAME, TRIGGER_KEY, CLASS_NAME, CRON_TAB, " +
            "TO_CHAR(CREATE_DATE, 'YYYY-MM-DD HH24:MI:SS') AS CREATE_DATE, STATUS, CREATE_BY, UPDATE_DATE, UPDATE_BY " +
            "FROM P_SCHEDULER " +
            "WHERE (:jobName IS NULL OR :jobName = '' OR JOB_NAME = :jobName) " +
            "AND (:status IS NULL OR :status = '' OR STATUS = :status) " +
            "ORDER BY JOB_NAME", nativeQuery = true)
    List<Scheduler> getScheduleList(@Param("jobName") String jobName, @Param("status") String status);

    void deleteByJobName(String jobName);

    @Modifying
    @Transactional
    @Query(value = "INSERT INTO P_SCHEDULER (JOB_NAME, GROUP_NAME, TRIGGER_KEY, CLASS_NAME, CRON_TAB, STATUS, CREATE_DATE, CREATE_BY) " +
            "VALUES (:jobName, :groupName, :triggerKey, :className, :cronTab, :status, now(), :userId)", nativeQuery = true)
    int createSchedule(@Param("jobName") String jobName,
                       @Param("groupName") String groupName,
                       @Param("triggerKey") String triggerKey,
                       @Param("className") String className,
                       @Param("cronTab") String cronTab,
                       @Param("status") String status,
                       @Param("userId") String userId); // save scheduler

    @Modifying
    @Transactional
    @Query("UPDATE Scheduler s SET s.cronTab = :cronTab, s.status = :status, s.updateDate = CURRENT_TIMESTAMP, s.updateBy = :userId " +
            "WHERE s.jobName = :jobName AND s.groupName = :groupName AND s.triggerKey = :triggerKey AND s.className = :className")
    int updateSchedule(@Param("jobName") String jobName,
                       @Param("groupName") String groupName,
                       @Param("triggerKey") String triggerKey,
                       @Param("className") String className,
                       @Param("cronTab") String cronTab,
                       @Param("status") String status,
                       @Param("userId") String userId);
}
