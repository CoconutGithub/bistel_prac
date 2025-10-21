package com.siportal.portal.service;

import com.siportal.portal.domain.Project;
import com.siportal.portal.dto.ProjectDetailDTO;
import com.siportal.portal.dto.ProjectListDTO;
import com.siportal.portal.repository.ProjectHumanResourceRepository;
import com.siportal.portal.repository.ProjectProgressDetailRepository;
import com.siportal.portal.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectHumanResourceRepository projectHumanResourceRepository;
    private final ProjectProgressDetailRepository projectProgressDetailRepository;

    public ResponseEntity<?> allProject() {
        List<Project> projects = projectRepository.findAll();

        List<ProjectListDTO> dtoList = projects.stream().map(project -> new ProjectListDTO(project)).collect(Collectors.toList());

        return ResponseEntity.ok().body(dtoList);
    }

    public ResponseEntity<?> detailProject(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found with id: " + projectId));

        // DTO 변환
        ProjectDetailDTO dto = new ProjectDetailDTO();
        dto.setProjectId(project.getProjectId());
        dto.setProjectName(project.getProjectName());
        dto.setProjectCode(project.getProjectCode());
        dto.setProjectDescription(project.getDescription()); // description -> projectDescription
        dto.setProjectStatus(project.getProjectStatus());
        dto.setStep(project.getStep());
        dto.setPmId(project.getPmId());
        dto.setStartDate(project.getStartDate());
        dto.setEndDate(project.getEndDate());
        dto.setOverallProgress(project.getOverallProgress());
        dto.setProjectProgressDetails(project.getProgressDetails()); // progressDetails -> projectProgressDetails
        dto.setProjectHumanResources(project.getHumanResources()); // humanResources 추가

        return ResponseEntity.ok(dto);
    }


}
