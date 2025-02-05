package com.siportal.portal.repository;

import com.siportal.portal.domain.Scheduler;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SchedulerRepository extends JpaRepository<Scheduler, String> {
}
