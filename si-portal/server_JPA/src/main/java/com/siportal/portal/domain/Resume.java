package com.siportal.portal.domain;

import com.vladmihalcea.hibernate.type.json.JsonBinaryType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Type;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

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
public class Resume {

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

    @Type(JsonBinaryType.class)
    @Column(columnDefinition = "jsonb")
    private List<Map<String, Object>> experience;

    @Type(JsonBinaryType.class)
    @Column(columnDefinition = "jsonb")
    private List<Map<String, Object>> education;

    @Type(JsonBinaryType.class)
    @Column(columnDefinition = "jsonb")
    private List<Map<String, Object>> skills;

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


    private static final ObjectMapper objectMapper = new ObjectMapper();

    public static String toJson(List<Map<String, Object>> list) {
        try {
            return objectMapper.writeValueAsString(list);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("JSON 변환 오류", e);
        }
    }

    public static List<Map<String, Object>> fromJson(String json) {
        try {
            return objectMapper.readValue(json, List.class);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("JSON 변환 오류", e);
        }
    }

}
