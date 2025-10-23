package com.siportal.portal.dto;

import com.siportal.portal.domain.ProjectHumanResource;
import com.siportal.portal.domain.ProjectProgressDetail;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
public class ProjectDetailDTO {
    private Long projectId;
    private String projectName;
    private String projectCode;
    private String projectDescription;
    private String projectStatus;
    private String step;
    private String pmId;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer overallProgress;
    private List<ProjectProgressDetail>  projectProgressDetails;
    private List<ProjectDetailHumanResourceDTO> projectHumanResources;
}
