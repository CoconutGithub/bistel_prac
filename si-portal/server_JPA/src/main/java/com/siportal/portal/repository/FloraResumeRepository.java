package com.siportal.portal.repository;

import com.siportal.portal.domain.Resume;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FloraResumeRepository extends JpaRepository<Resume, Integer> {


}
