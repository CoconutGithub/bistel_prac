package com.siportal.portal.domain;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.DynamicUpdate;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Entity
@Table(name="resumes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@DynamicUpdate
public class Resume {

    // JSON 변환을 위한 ObjectMapper 인스턴스 생성 (static으로 선언하여 재사용 가능)
    private static final ObjectMapper objectMapper = new ObjectMapper();

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 100)
    private String fullName;

    @Column(nullable = false, length = 255)
    private String email;

    @Column(nullable = false, length = 20)
    private String phone;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @Column(columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON) // Hibernate 6.x에서 JSONB 타입을 올바르게 매핑
    private List<Map<String, Object>> experience;

    @Column(columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON) // Hibernate 6.x에서 JSONB 타입을 올바르게 매핑
    private List<Map<String, Object>> education;


    @Column(columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON) // Hibernate 6.x에서 JSONB 타입을 올바르게 매핑
    private List<Object> skills;

    @Lob
    @Column(name = "resume_file")
    private byte[] resumeFile;

    @Column(length = 255)
    private String resumeFilename;

    @Column(updatable = false)
    @Builder.Default
    private LocalDateTime createDate = LocalDateTime.now();

    @Column(length = 100)
    private String createBy;

    private LocalDateTime updateDate;

    @Column(length = 100)
    private String updateBy;

    @Column(length = 10)
    private String gender;

    @Column(length = 255)
    private String company;

    @Column(length = 255)
    private String department;

    @Column(length = 255)
    private String position;

    @Column(length = 255)
    private String jobTitle;

    @Column(length = 300)
    private String address;

    @Column(name="carrier_month")
    private Integer carrierMonth;

    @Column(name="resident_number")
    private String residentNumber;

    @Column(name="military_service")
    private String militaryService;

    public String getExperience() {
        try {
            // List<Map<String, Object>> → JSON 문자열 변환
            return objectMapper.writeValueAsString(experience);
        } catch (JsonProcessingException e) {
            e.printStackTrace();
            return null;  // 변환 실패 시 null 반환 (예외 처리 가능)
        }
    }

    public String getEducation() {
        try {
            // List<Map<String, Object>> → JSON 문자열 변환
            return objectMapper.writeValueAsString(education);
        } catch (JsonProcessingException e) {
            e.printStackTrace();
            return null;  // 변환 실패 시 null 반환 (예외 처리 가능)
        }
    }

    public String getSkills() {
        try {
            // List<Map<String, Object>> → JSON 문자열 변환
            return objectMapper.writeValueAsString(skills);
        } catch (JsonProcessingException e) {
            e.printStackTrace();
            return null;  // 변환 실패 시 null 반환 (예외 처리 가능)
        }
    }

}
