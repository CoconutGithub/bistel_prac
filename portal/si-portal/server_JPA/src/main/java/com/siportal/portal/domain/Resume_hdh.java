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
public class Resume_hdh {

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
    @JdbcTypeCode(SqlTypes.JSON)
    private List<Map<String, Object>> experience;

    @Column(columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private List<Map<String, Object>> education;

    @Column(columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
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

    public String getExperience() {
        try {
            return objectMapper.writeValueAsString(experience);
        } catch (JsonProcessingException e) {
            e.printStackTrace();
            return null;
        }
    }

    public String getEducation() {
        try {
            return objectMapper.writeValueAsString(education);
        } catch (JsonProcessingException e) {
            e.printStackTrace();
            return null;
        }
    }

    public String getSkills() {
        try {
            return objectMapper.writeValueAsString(skills);
        } catch (JsonProcessingException e) {
            e.printStackTrace();
            return null;
        }
    }
}
