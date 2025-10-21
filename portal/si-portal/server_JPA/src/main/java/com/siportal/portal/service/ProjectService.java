package com.siportal.portal.service;

import com.siportal.portal.domain.Project;
import com.siportal.portal.dto.ProjectDetailDTO;
import com.siportal.portal.dto.ProjectListDTO;
import com.siportal.portal.dto.ProjectSaveDTO;
import com.siportal.portal.repository.ProjectHumanResourceRepository;
import com.siportal.portal.repository.ProjectProgressDetailRepository;
import com.siportal.portal.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
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
            // 1. Principal이 UserDetails 객체인 경우 (일반적)
            if (authentication.getPrincipal() instanceof UserDetails) {
                UserDetails userDetails = (UserDetails) authentication.getPrincipal();
                currentUsername = userDetails.getUsername(); // (또는 userDetails.getId() 등)
            }
            // 2. Principal이 단순 String인 경우
            else {
                currentUsername = authentication.getName();
            }
        }

        // 1. 삭제 (Delete)
        // deleteList에서 ID를 추출하여 삭제
        // 1. 삭제 (Delete)
        if (saveRequest.getDeleteList() != null && !saveRequest.getDeleteList().isEmpty()) {
            List<Long> deleteIds = saveRequest.getDeleteList().stream()
                    .map(Project::getProjectId)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());

            projectRepository.deleteAllByIdInBatch(deleteIds);
        }

        // 2. 생성 (Create)
        if (saveRequest.getCreateList() != null && !saveRequest.getCreateList().isEmpty()) {

            // [수정] 저장하기 전에 createBy 필드를 설정
            for (Project project : saveRequest.getCreateList()) {
                project.setCreateBy(currentUsername);
                // (참고: @CreationTimestamp가 createDate를 자동 설정합니다)
            }
            projectRepository.saveAll(saveRequest.getCreateList());
        }

        // 3. 수정 (Update)
        if (saveRequest.getUpdateList() != null && !saveRequest.getUpdateList().isEmpty()) {

            // [수정] 저장하기 전에 updateBy 필드를 설정 (updateBy도 NOT NULL일 수 있음)
            for (Project project : saveRequest.getUpdateList()) {
                project.setUpdateBy(currentUsername);
                // (참고: @UpdateTimestamp가 updateDate를 자동 설정합니다)
            }
            projectRepository.saveAll(saveRequest.getUpdateList());
        }
    }

}
