package com.siportal.portal.domain;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "project_human_resource")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectHumanResource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "resource_allocation_id")
    private Long resourceAllocationId;

    // Project 엔티티와 다대일(N:1) 관계
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    @JsonBackReference
    private Project project;

    @Column(name = "user_id", nullable = false, length = 100)
    private String userId;
    // 만약 User 엔티티와 직접 연관관계를 맺는다면:
    // @ManyToOne(fetch = FetchType.LAZY)
    // @JoinColumn(name = "user_id", nullable = false)
    // private User user;

    // Role 엔티티와 다대일(N:1) 관계
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "role_id")
    private Role role;

    @Column(name = "planned_mm", nullable = false, precision = 5, scale = 2)
    private BigDecimal plannedMm = BigDecimal.ZERO;

    @Column(name = "actual_mm", nullable = false, precision = 5, scale = 2)
    private BigDecimal actualMm = BigDecimal.ZERO;

    @Column(name = "actual_start_date")
    private LocalDate actualStartDate;

    @Column(name = "actual_end_date")
    private LocalDate actualEndDate;

    @Column(name = "planned_start_date")
    private LocalDate plannedStartDate;

    @Column(name = "planned_end_date")
    private LocalDate plannedEndDate;
}
