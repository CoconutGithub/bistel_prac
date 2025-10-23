package com.siportal.portal.service;

import com.siportal.portal.domain.Project;
import com.siportal.portal.domain.ProjectHumanResource;
import com.siportal.portal.domain.ProjectProgressDetail;
import com.siportal.portal.domain.Role;
import com.siportal.portal.dto.*;
import com.siportal.portal.repository.ProjectHumanResourceRepository;
import com.siportal.portal.repository.ProjectProgressDetailRepository;
import com.siportal.portal.repository.ProjectRepository;
import com.siportal.portal.repository.RoleRepository;
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
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
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
    private final RoleRepository roleRepository;

    public ResponseEntity<?> allProject() {
        List<Project> projects = projectRepository.findAll();

        List<ProjectListDTO> dtoList = projects.stream().map(project -> new ProjectListDTO(project)).collect(Collectors.toList());

        return ResponseEntity.ok().body(dtoList);
    }

    public ProjectDetailDTO detailProject(Long projectId) {
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
        if (project.getHumanResources() != null) {
            dto.setProjectHumanResources(
                    project.getHumanResources().stream()
                            .map(ProjectDetailHumanResourceDTO::fromEntity) // 메소드 레퍼런스 사용
                            .collect(Collectors.toList())
            );
        }

        return dto;
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

    @Transactional
    public void saveProgressDetails(Long projectId, ProgressSaveDTO payload) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = "SYSTEM"; // 기본값
        if (authentication != null && !(authentication instanceof AnonymousAuthenticationToken)) {
            currentUsername = authentication.getName();
        }

        Project project = getProjectAndCheckPMAccess(projectId, currentUsername);

        //create 진행상세
        if (payload.getCreateList() != null) {
            for (ProjectProgressDetail detail : payload.getCreateList()) {
                detail.setProject(project);
                detail.setCreateBy(currentUsername);
                projectProgressDetailRepository.save(detail);
            }
        }

        //update 진행상세
        if (payload.getUpdateList() != null) {
            for (ProjectProgressDetail detail : payload.getUpdateList()) {
                if (detail.getDetailId() == null) continue;

                ProjectProgressDetail existingDetail = projectProgressDetailRepository.findById(detail.getDetailId())
                        .orElseThrow(() -> new EntityNotFoundException("Progress detail not found: " + detail.getDetailId()));

                if (!existingDetail.getProject().getProjectId().equals(project.getProjectId())) {
                    throw new AccessDeniedException("이 프로젝트에 속한 상세 항목이 아닙니다.");
                }

                existingDetail.setTaskName(detail.getTaskName());
                existingDetail.setAssigneeId(detail.getAssigneeId());
                existingDetail.setProgressPercentage(detail.getProgressPercentage());
                existingDetail.setWeight(detail.getWeight());
                existingDetail.setDescription(detail.getDescription());
                existingDetail.setUpdateBy(currentUsername);
            }
        }

        //delete 진행상세
        if (payload.getDeleteList() != null) {
            for (ProjectProgressDetail detail : payload.getDeleteList()) {
                if (detail.getDetailId() != null) {
                    projectProgressDetailRepository.deleteById(detail.getDetailId());
                }
            }
        }
        List<ProjectProgressDetail> latestDetails = projectProgressDetailRepository.findByProject(project);

        double overallProgress = 0.0;
        int totalWeight = 0;

        if (!latestDetails.isEmpty()) {
            //가중치 총합 계산
            totalWeight = latestDetails.stream()
                    .mapToInt(ProjectProgressDetail::getWeight)
                    .sum();

            //가중치 총합이 100이 아닌 경우 예외 발생
            if (totalWeight != 100) {
                throw new WeightValidationException("가중치의 총합은 100이어야 합니다. (현재 합계: " + totalWeight + ")");
            }

            //전체 진행률 계산
            for (ProjectProgressDetail detail : latestDetails) {
                // (진행률 * (가중치 / 100.0))
                overallProgress += (double) detail.getProgressPercentage() * ((double) detail.getWeight() / totalWeight);
            }
        }

        //전체 진행률 저장
        project.setOverallProgress((int) Math.round(overallProgress));
        project.setUpdateBy(currentUsername); // 프로젝트도 수정되었으므로 updateBy 설정
        projectRepository.save(project);
    }

    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public class WeightValidationException extends RuntimeException {
        public WeightValidationException(String message) {
            super(message);
        }
    }

    @Transactional
    public ProjectHumanResource addHumanResource(HumanResourceDTO requestDTO) {
        // 1. 사용자 인증 및 프로젝트 권한 확인 (기존 헬퍼 재사용)
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = "SYSTEM"; // 기본값
        if (authentication != null && !(authentication instanceof AnonymousAuthenticationToken)) {
            currentUsername = authentication.getName();
        }
        Project project = getProjectAndCheckPMAccess(requestDTO.getProjectId(), currentUsername);

        // 2. Role 엔티티 조회 (roleId가 null이 아닐 경우)
        Role role = null;
        if (requestDTO.getRoleId() != null) {
            role = roleRepository.findById(Math.toIntExact(requestDTO.getRoleId()))
                    .orElseThrow(() -> new EntityNotFoundException("Role not found with id: " + requestDTO.getRoleId()));
        }

        // 3. DTO -> Entity 변환
        ProjectHumanResource newResource = ProjectHumanResource.builder()
                .project(project) // 연관관계 설정
                .userId(requestDTO.getUserId())
                .role(role) // 조회된 Role 엔티티 설정
                .plannedStartDate(requestDTO.getPlannedStartDate())
                .plannedEndDate(requestDTO.getPlannedEndDate())
                .plannedMm(requestDTO.getPlannedMm() != null ? requestDTO.getPlannedMm() : BigDecimal.ZERO) // Null 방지
                .actualStartDate(requestDTO.getActualStartDate())
                .actualEndDate(requestDTO.getActualEndDate())
                .actualMm(requestDTO.getActualMm() != null ? requestDTO.getActualMm() : BigDecimal.ZERO) // Null 방지
                .build();

        // 4. 저장 및 반환 (ID가 채번된 객체 반환)
        return projectHumanResourceRepository.save(newResource);
    }

    // ########## [추가] 투입 인력(Human Resource) 삭제 로직 ##########
    @Transactional
    public void deleteHumanResource(Long resourceId) {
        // 1. 삭제할 리소스 조회
        ProjectHumanResource resource = projectHumanResourceRepository.findById(resourceId)
                .orElseThrow(() -> new EntityNotFoundException("Human resource not found with id: " + resourceId));

        // 2. 해당 리소스가 속한 프로젝트에 대한 PM 권한 확인
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = "SYSTEM"; // 기본값
        if (authentication != null && !(authentication instanceof AnonymousAuthenticationToken)) {
            currentUsername = authentication.getName();
        }
        // 리소스 객체에서 Project ID를 가져와 권한 확인
        getProjectAndCheckPMAccess(resource.getProject().getProjectId(), currentUsername);

        // 3. 삭제 수행
        projectHumanResourceRepository.delete(resource);
    }

}
