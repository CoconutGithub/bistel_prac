package com.siportal.portal.repository;

import com.siportal.portal.domain.ProjectHumanResource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProjectHumanResourceRepository extends JpaRepository<ProjectHumanResource,Long> {
}
