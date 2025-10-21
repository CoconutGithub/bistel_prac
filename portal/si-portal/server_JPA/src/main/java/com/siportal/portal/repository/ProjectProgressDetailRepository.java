package com.siportal.portal.repository;

import com.siportal.portal.domain.ProjectProgressDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProjectProgressDetailRepository extends JpaRepository<ProjectProgressDetail,Long> {
}
