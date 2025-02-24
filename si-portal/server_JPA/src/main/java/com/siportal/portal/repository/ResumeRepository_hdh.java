package com.siportal.portal.repository;

import com.siportal.portal.domain.Resume;
import com.siportal.portal.domain.Resume_hdh;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ResumeRepository_hdh extends JpaRepository<Resume_hdh, Integer> {

}
