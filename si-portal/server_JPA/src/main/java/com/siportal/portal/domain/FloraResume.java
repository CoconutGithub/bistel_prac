package com.siportal.portal.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name="resumes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FloraResume {

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
    private String experience;

    @Column(columnDefinition = "jsonb")
    private String education;

    @Column(columnDefinition = "jsonb")
    private String skills;

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

}
