package com.siportal.portal.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public interface FloraResumeProjection {
    Integer getId();
    String getFullName();
    String getEmail();
    String getPhone();
    String getSummary();
    List<Map<String, Object>> getExperience();
    List<Map<String, Object>> getEducation();
    List<Map<String, Object>> getSkills();
    LocalDateTime getCreateDate();
    String getCreateBy();
    LocalDateTime getUpdateDate();
    String getUpdateBy();
    String getGender();
    String getCompany();
    String getDepartment();
    String getPosition();
    String getJobTitle();
}
