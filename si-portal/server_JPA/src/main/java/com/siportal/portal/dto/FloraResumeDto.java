package com.siportal.portal.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
@JsonIgnoreProperties(ignoreUnknown = true)
public class FloraResumeDto {
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
}
