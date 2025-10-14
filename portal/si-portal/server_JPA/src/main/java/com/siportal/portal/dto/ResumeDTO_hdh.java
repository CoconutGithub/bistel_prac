package com.siportal.portal.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResumeDTO_hdh {

    private Integer id;
    private String fullName;
    private String email;
    private String phone;
    private String summary;
    private String experience;
    private String education;
    private String skills;
    private byte[] resumeFile;
    private String resumeFilename;
    private LocalDateTime createDate;
    private String createBy;
    private LocalDateTime updateDate;
    private String updateBy;
    private String gender;
    private String company;
    private String department;
    private String position;
    private String jobTitle;
}
