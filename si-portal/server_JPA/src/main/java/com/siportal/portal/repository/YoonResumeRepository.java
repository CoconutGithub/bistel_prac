package com.siportal.portal.repository;

import com.siportal.portal.domain.Resume;
import com.siportal.portal.dto.YoonResumeListProjection;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface YoonResumeRepository extends JpaRepository<Resume,Integer> {
  List<YoonResumeListProjection> findAllBy();
}
