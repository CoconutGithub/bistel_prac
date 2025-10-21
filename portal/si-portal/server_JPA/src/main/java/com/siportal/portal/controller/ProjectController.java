package com.siportal.portal.controller;

import com.siportal.portal.domain.Project;
import com.siportal.portal.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<?> listProject(){
        return projectService.allProject();
    }

    @GetMapping("/detail/{project_id}")
    public ResponseEntity<?> detailProject(@PathVariable("project_id") Long projectId){
        return projectService.detailProject(projectId);
    }
}
