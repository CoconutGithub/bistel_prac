package com.siportal.portal.service;

import com.siportal.portal.domain.Project;
import com.siportal.portal.dto.ProjectDetailDTO;
import com.siportal.portal.dto.ProjectListDTO;
import com.siportal.portal.dto.ProjectSaveDTO;
import com.siportal.portal.repository.ProjectHumanResourceRepository;
import com.siportal.portal.repository.ProjectProgressDetailRepository;
import com.siportal.portal.repository.ProjectRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Objects;
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

    @Transactional
    public void saveProjects(ProjectSaveDTO saveRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        String currentUsername = "SYSTEM";
        // 로그인한 사용자인지 확인
        if (authentication != null && !(authentication instanceof AnonymousAuthenticationToken)) {

            if (authentication.getPrincipal() instanceof UserDetails) {
                UserDetails userDetails = (UserDetails) authentication.getPrincipal();
                currentUsername = userDetails.getUsername();
            }
            else {
                currentUsername = authentication.getName();
            }
        }

        if (saveRequest.getDeleteList() != null && !saveRequest.getDeleteList().isEmpty()) {
            List<Long> deleteIds = saveRequest.getDeleteList().stream()
                    .map(Project::getProjectId)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());

            projectRepository.deleteAllByIdInBatch(deleteIds);
        }

        if (saveRequest.getCreateList() != null && !saveRequest.getCreateList().isEmpty()) {

            for (Project project : saveRequest.getCreateList()) {
                project.setCreateBy(currentUsername);
            }
            projectRepository.saveAll(saveRequest.getCreateList());
        }

        if (saveRequest.getUpdateList() != null && !saveRequest.getUpdateList().isEmpty()) {

            for (Project project : saveRequest.getUpdateList()) {
                project.setUpdateBy(currentUsername);
            }
            projectRepository.saveAll(saveRequest.getUpdateList());
        }
    }

    @Transactional
    public Project updateProject(ProjectDetailDTO projectDTO, Long projectId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = "SYSTEM"; // 기본값
        if (authentication != null && !(authentication instanceof AnonymousAuthenticationToken)) {
            currentUsername = authentication.getName();
        }

        Project project = getProjectAndCheckPMAccess(projectId, currentUsername);

        project.setProjectName(projectDTO.getProjectName());
        project.setProjectStatus(projectDTO.getProjectStatus());
        project.setStep(projectDTO.getStep());
        project.setPmId(projectDTO.getPmId());
        project.setDescription(projectDTO.getProjectDescription());
        project.setStartDate(projectDTO.getStartDate());
        project.setEndDate(projectDTO.getEndDate());
        project.setUpdateBy(currentUsername);

        return project;
    }

    @Transactional
    public void deleteProject(Long projectId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = "SYSTEM"; // 기본값
        if (authentication != null && !(authentication instanceof AnonymousAuthenticationToken)) {
            currentUsername = authentication.getName();
        }

        Project project = getProjectAndCheckPMAccess(projectId, currentUsername);

        projectRepository.delete(project);
    }



    private Project getProjectAndCheckPMAccess(Long projectId, String currentUsername) {
        //프로젝트 조회
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new EntityNotFoundException("Project not found with id: " + projectId));

        String pmId = project.getPmId();

        // 권한 확인 로직
        // pmId가 "존재하는데(hasText)" "현재 사용자와 다르면" -> 예외 발생
        if (StringUtils.hasText(pmId) && !pmId.equals(currentUsername)) {
            throw new AccessDeniedException("해당 프로젝트의 PM만 이 작업을 수행할 수 있습니다.");
        }

        // 권한이 있거나 PM이 없으면 프로젝트 반환
        return project;
    }
}
