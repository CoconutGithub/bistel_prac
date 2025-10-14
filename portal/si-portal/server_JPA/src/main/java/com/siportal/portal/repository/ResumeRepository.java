package com.siportal.portal.repository;

import com.siportal.portal.domain.Resume;
import com.siportal.portal.dto.ResumeRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResumeRepository extends JpaRepository<Resume, Long> {
    @Query(value = """
        SELECT 
            ROW_NUMBER() OVER (ORDER BY b.CREATE_DATE DESC) as grid_row_id,
            b.id, 
            b.full_name, 
            b.email, 
            b.phone, 
            b.summary, 
            b.experience, 
            b.education, 
            b.skills, 
            b.resume_file, 
            b.resume_filename, 
            b.create_date, 
            b.create_by, 
            b.update_date, 
            b.update_by
          FROM dev.resumes b
          ORDER BY b.CREATE_DATE DESC
    """, nativeQuery = true)
    List<Object[]> getResumeList();
}
