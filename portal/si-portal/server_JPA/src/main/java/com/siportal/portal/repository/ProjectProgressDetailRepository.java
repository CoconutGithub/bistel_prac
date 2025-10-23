package com.siportal.portal.repository;

import com.siportal.portal.domain.Project;
import com.siportal.portal.domain.ProjectProgressDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectProgressDetailRepository extends JpaRepository<ProjectProgressDetail,Long> {

    List<ProjectProgressDetail> findByProject(Project project);

}
