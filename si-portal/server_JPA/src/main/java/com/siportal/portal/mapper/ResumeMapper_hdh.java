package com.siportal.portal.mapper;

import com.siportal.portal.dto.ResumeDTO_hdh;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface ResumeMapper_hdh {

    @Select("SELECT id, full_name, create_date FROM resumes WHERE id = #{resumeId}")
    ResumeDTO_hdh findResumeById(@Param("resumeId") Integer resumeId);

    @Insert("INSERT INTO resumes (fullName, email, phone, summary, experience, education, skills, resumeFilename, company, department, position, job_title) " +
            "VALUES (#{fullName}, #{email}, #{phone}, #{summary}, #{experience}, #{education}, #{skills}, #{resumeFilename}, #{company}, #{department}, #{position}, #{job_title})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    void insertResume(ResumeDTO_hdh resumeDTO);
}
