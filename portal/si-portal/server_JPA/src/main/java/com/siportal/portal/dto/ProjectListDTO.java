package com.siportal.portal.dto;

import com.siportal.portal.domain.Project;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
public class ProjectListDTO {
    private Long projectId;
    private String projectCode;
    private String projectName;
    private String description;
    private String step;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer overallProgress;
    private String projectStatus;
    private String pmId;

    // [수정] Project 엔티티를 받아서 DTO 객체로 변환하는 생성자
    public ProjectListDTO(Project project) {
        this.projectId = project.getProjectId();
        this.projectCode = project.getProjectCode();
        this.projectName = project.getProjectName();
        this.description = project.getDescription();
        this.step = project.getStep();
        this.startDate = project.getStartDate();
        this.endDate = project.getEndDate();
        this.overallProgress = project.getOverallProgress();
        this.projectStatus = project.getProjectStatus();
        this.pmId = project.getPmId();
    }
}
