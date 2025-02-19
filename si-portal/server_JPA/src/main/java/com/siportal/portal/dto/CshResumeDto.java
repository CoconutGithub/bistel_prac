package com.siportal.portal.dto;

import lombok.*;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CshResumeDto {

    private Integer id;
    private String fullName;
    private String email;
    private String phone;
    private String summary;
    private String company;
    private String department;
    private String position;
    private String gender;
    private String address;
    private Integer carrierMonth;
    private String residentNumber;
    private String militaryService;
    private List<Map<String, Object>> education;
    private List<Map<String, Object>> license;
    private List<Map<String, Object>> skills;
    private List<Map<String, Object>> training;
    private List<Map<String, Object>> experience;

}
