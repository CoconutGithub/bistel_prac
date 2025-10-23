package com.siportal.portal.controller;

import com.siportal.portal.domain.Project;
import com.siportal.portal.dto.ProgressSaveDTO;
import com.siportal.portal.dto.ProjectDetailDTO;
import com.siportal.portal.dto.ProjectSaveDTO;
import com.siportal.portal.service.ProjectService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = {"http://192.168.7.37:9090", "http://localhost:9090"})
@RequestMapping("/project")
@RequiredArgsConstructor
public class ProjectController {
    private final ProjectService projectService;

    @GetMapping("/list")
    public ResponseEntity<?> listProject() {
        return projectService.allProject();
    }

    @GetMapping("/detail/{project_id}")
    public ResponseEntity<?> detailProject(@PathVariable("project_id") Long projectId) {
        return projectService.detailProject(projectId);
    }

    @PostMapping("/save")
    public ResponseEntity<?> saveProjects(@RequestBody ProjectSaveDTO saveRequest) {
        try {
            projectService.saveProjects(saveRequest);
            return ResponseEntity.ok().body("프로젝트 목록 저장 완료.");
        } catch (Exception e) {
            // 예외 발생 시 500 에러와 메시지 반환
            return ResponseEntity
                    .internalServerError()
                    .body("Error saving projects: " + e.getMessage());
        }
    }

    @PutMapping("/update/{project_id}")
    public ResponseEntity<?> updateProject(@RequestBody ProjectDetailDTO projectDTO, @PathVariable("project_id") Long projectId) {
        try {
            Project updatedProject = projectService.updateProject(projectDTO, projectId);
            // 성공 시 업데이트된 객체 정보와 함께 200 OK 응답
            return ResponseEntity.ok().body(updatedProject);
        } catch (EntityNotFoundException e) {
            // 프로젝트를 찾지 못했을 경우 404 Not Found 응답
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (AccessDeniedException e) {
            // 서비스에서 권한 없음을 확인한 경우 403 Forbidden 응답
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity
                    .internalServerError()
                    .body("Error updating project: " + e.getMessage());
        }
    }

    @DeleteMapping("/delete/{project_id}")
    public ResponseEntity<?> deleteProject(@PathVariable("project_id") Long projectId) {
        try {
            projectService.deleteProject(projectId);
            // 성공 시 업데이트된 객체 정보와 함께 200 OK 응답
            return ResponseEntity.ok().body("프로젝트 삭제 완료.");
        } catch (EntityNotFoundException e) {
            // 프로젝트를 찾지 못했을 경우 404 Not Found 응답
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (AccessDeniedException e) {
            // 서비스에서 권한 없음을 확인한 경우 403 Forbidden 응답
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity
                    .internalServerError()
                    .body("Error deleting project: " + e.getMessage());
        }
    }

    @PostMapping("/progress/save/{project_id}")
    public ResponseEntity<?> saveProgressDetails(@RequestBody ProgressSaveDTO progressSaveDTO, @PathVariable("project_id") Long projectId) {
        try {
            projectService.saveProgressDetails(projectId,progressSaveDTO);
            return ResponseEntity.ok().body("진행 상세가 저장되었습니다.");

        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (AccessDeniedException e) {
            // PM 권한이 없는 경우
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (ProjectService.WeightValidationException e) {
            // 상세 항목들의 가중치 합이 100이 안되는 경우
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity
                    .internalServerError()
                    .body("Error saving progress details: " + e.getMessage());
        }
    }

}
