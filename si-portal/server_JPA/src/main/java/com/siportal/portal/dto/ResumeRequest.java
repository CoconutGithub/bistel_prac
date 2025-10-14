package com.siportal.portal.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ResumeRequest {
    private Integer gridRowId;

    @JsonProperty("user_name")
    private String userName;

    @JsonProperty("full_name")
    private String fullName;

    private String email;
    private String phone;
    private String summary;
    private String experience;
    private String education;
    private String skills;
    @JsonProperty("resume_filename")
    private String resumeFilename;

    @JsonProperty("create_by")
    private String createBy;

    @JsonProperty("update_by")
    private String updateBy;
}

