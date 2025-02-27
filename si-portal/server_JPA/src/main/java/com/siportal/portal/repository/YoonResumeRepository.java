package com.siportal.portal.repository;

import com.siportal.portal.domain.Resume;
import com.siportal.portal.dto.YoonResumeListProjection;
import com.siportal.portal.dto.YoonResumeProjection;
import com.siportal.portal.dto.YoonResumeResponse;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface YoonResumeRepository extends JpaRepository<Resume,Integer> {
  List<YoonResumeListProjection> findAllBy();

  @Query("""
    SELECT r.id AS id, r.fullName AS fullName, r.email AS email, r.phone AS phone, r.summary AS summary,
           r.experience AS experience, r.education AS education, r.skills AS skills,
           r.createDate AS createDate, r.createBy AS createBy, r.updateDate AS updateDate, r.updateBy AS updateBy,
           r.gender AS gender, r.company AS company, r.department AS department, r.position AS position,
           r.jobTitle AS jobTitle
    FROM Resume r
    WHERE r.id=:id

""")
  Optional<YoonResumeProjection> findById(int id);

}
