package com.siportal.portal.repository;

import com.siportal.portal.domain.Resume;
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
            "  FROM RESUMES " +
            "  ORDER BY ID ASC "
            , nativeQuery = true)
    List<Object[]> findResumeDefaultData();
}
