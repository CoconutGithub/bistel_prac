package com.siportal.portal.dto;

import com.siportal.portal.domain.Resume;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class YoonResumeResponse {
    private Integer id;
    private String fullName;
    private String email;
    private String phone;
    private String summary;
    private List<Map<String, Object>> experience;
    private List<Map<String, Object>> education;
    private List<Map<String, Object>> skills;
    private LocalDateTime createDate;
    private String createBy;
    private LocalDateTime updateDate;
    private String updateBy;
    private String gender;
    private String company;
    private String department;
    private String position;
    private String jobTitle;

    public YoonResumeResponse(YoonResumeProjection yoonResumeProjection){
        id=yoonResumeProjection.getId();
        fullName=yoonResumeProjection.getFullName();
        email=yoonResumeProjection.getEmail();
        phone= yoonResumeProjection.getPhone();
        summary=yoonResumeProjection.getSummary();
        experience=yoonResumeProjection.getExperience();
        education=yoonResumeProjection.getEducation();
        skills=yoonResumeProjection.getSkills();
        createDate=yoonResumeProjection.getCreateDate();
        createBy=yoonResumeProjection.getCreateBy();
        updateBy=yoonResumeProjection.getUpdateBy();
        gender=yoonResumeProjection.getGender();
        company=yoonResumeProjection.getCompany();
        department=yoonResumeProjection.getDepartment();
        position=yoonResumeProjection.getPosition();
        jobTitle=yoonResumeProjection.getJobTitle();

    }

}
