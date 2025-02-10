package com.siportal.portal.repository;

import com.siportal.portal.com.result.ComResultMap;
import com.siportal.portal.domain.Scheduler;
import com.siportal.portal.dto.SchedulDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SchedulerRepository extends JpaRepository<Scheduler, String> {
    @Query(value = "SELECT JOB_NAME, GROUP_NAME, TRIGGER_KEY, CLASS_NAME, CRON_TAB, " +
            "TO_CHAR(CREATE_DATE, 'YYYY-MM-DD HH24:MI:SS') AS CREATE_DATE, STATUS, CREATE_BY, UPDATE_DATE, UPDATE_BY " +
            "FROM P_SCHEDULER " +
            "WHERE (:jobName IS NULL OR :jobName = '' OR JOB_NAME = :jobName) " +
            "AND (:status IS NULL OR :status = '' OR STATUS = :status) " +
            "ORDER BY JOB_NAME", nativeQuery = true)
    List<Scheduler> getScheduleList(@Param("jobName") String jobName, @Param("status") String status);
}
