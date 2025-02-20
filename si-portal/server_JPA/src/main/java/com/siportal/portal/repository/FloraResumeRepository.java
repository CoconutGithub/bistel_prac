package com.siportal.portal.repository;

import com.siportal.portal.domain.Resume;
import com.siportal.portal.dto.FloraResumeProjection;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import org.apache.ibatis.annotations.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public interface FloraResumeRepository extends JpaRepository<Resume, Integer> {

    @Query("""
        SELECT r.id AS id, r.fullName AS fullName, r.email AS email, r.phone AS phone, r.summary AS summary,
               r.experience AS experience, r.education AS education, r.skills AS skills,
               r.createDate AS createDate, r.createBy AS createBy, r.updateDate AS updateDate, r.updateBy AS updateBy,
               r.gender AS gender, r.company AS company, r.department AS department, r.position AS position,
               r.jobTitle AS jobTitle
        FROM Resume r
    """)
    List<FloraResumeProjection> findAllProjectedBy();


    @Query(value = """
        INSERT INTO resumes (full_name, email, phone, summary, experience, education, skills, 
                             create_date, create_by, update_date, update_by, gender, company, 
                             department, position, job_title, resume_file, resume_filename, address, 
                             carrier_month, resident_number, military_service, license, training)
        VALUES (:fullName, :email, :phone, :summary, CAST(:experience AS jsonb), CAST(:education AS jsonb), CAST(:skills AS jsonb), 
                :createDate, :createBy, :updateDate, :updateBy, :gender, :company, 
                :department, :position, :jobTitle, NULL, NULL, NULL, 
                NULL, NULL, NULL, NULL, NULL)
        RETURNING id
    """, nativeQuery = true)
    Integer insertResume(
            @Param("fullName") String fullName,
            @Param("email") String email,
            @Param("phone") String phone,
            @Param("summary") String summary,
            @Param("experience") String experience,
            @Param("education") String education,
            @Param("skills") String skills,
            @Param("createDate") LocalDateTime createDate,
            @Param("createBy") String createBy,
            @Param("updateDate") LocalDateTime updateDate,
            @Param("updateBy") String updateBy,
            @Param("gender") String gender,
            @Param("company") String company,
            @Param("department") String department,
            @Param("position") String position,
            @Param("jobTitle") String jobTitle
    );
}

