package com.siportal.portal.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "project")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "project_id")
    private Long projectId;

    @Column(name = "project_code", unique = true, nullable = false, length = 50)
    private String projectCode;

    @Column(name = "project_name", nullable = false, length = 200)
    private String projectName;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "step", length = 50)
    private String step;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "overall_progress", nullable = false)
    private Integer overallProgress = 0;

    @Column(name = "project_status", nullable = false, length = 20)
    private String projectStatus = "PLANNING";

    @Column(name = "pm_id", length = 100)
    private String pmId;
    // 만약 User 엔티티와 직접 연관관계를 맺는다면:
    // @ManyToOne(fetch = FetchType.LAZY)
    // @JoinColumn(name = "pm_id")
    // private User projectManager;

    @CreationTimestamp
    @Column(name = "create_date", nullable = false, updatable = false)
    private LocalDateTime createDate;

    @Column(name = "create_by", nullable = false, length = 100)
    private String createBy;

    @UpdateTimestamp
    @Column(name = "update_date")
    private LocalDateTime updateDate;

    @Column(name = "update_by", length = 100)
    private String updateBy;

    // 양방향 연관관계 설정 (Project가 삭제될 때 하위 항목도 함께 삭제)
    @Builder.Default
    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProjectProgressDetail> progressDetails = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProjectHumanResource> humanResources = new ArrayList<>();
}
