package com.siportal.portal.repository;

import com.siportal.portal.domain.Resume;
import com.siportal.portal.dto.CshResumeDto;
import com.siportal.portal.dto.FloraResumeDto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CshResumeRepository extends JpaRepository<Resume, Integer> {

    @Query(value = "" +
            "SELECT ID" +
            "   , FULL_NAME " +
            "   , SUMMARY" +
            "   , EMAIL" +
            "   , PHONE" +
            "   , CASE " +
            "       WHEN UPPER(GENDER) = 'FEMALE' THEN '여' " +
            "       WHEN UPPER(GENDER) = 'MALE' THEN '남' " +
            "       ELSE '-' END AS GENDER" +
            "   , CARRIER_MONTH " +
            "  FROM RESUMES " +
            "  ORDER BY ID ASC "
            , nativeQuery = true)
    List<Object[]> findResumeDefaultData();


    @Query("SELECT new com.siportal.portal.dto.CshResumeDto(" +
            "r.id, " +
            "r.fullName, " +
            "r.email, " +
            "r.phone, " +
            "r.summary, " +
            "r.company, " +
            "r.department, " +
            "r.position, " +
            "r.gender," +
            "r.address," +
            "r.carrierMonth," +
            "r.residentNumber," +
            "r.militaryService," +
            "r.education," +
            "r.license," +
            "r.skills," +
            "r.training," +
            "r.experience) " +
            "FROM Resume r WHERE r.id = :resumeId")
    CshResumeDto findResumeById(Integer resumeId);
}
