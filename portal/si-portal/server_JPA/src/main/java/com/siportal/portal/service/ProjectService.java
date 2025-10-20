package com.siportal.portal.service;

import com.siportal.portal.domain.Project;
import com.siportal.portal.dto.ProjectListDTO;
import com.siportal.portal.repository.ProjectHumanResourceRepository;
import com.siportal.portal.repository.ProjectProgressDetailRepository;
import com.siportal.portal.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

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

//    public ResponseEntity<?> detailProject(Long project_id) {
//        Optional<Project> project = projectRepository.findById(project_id);
//
//    }


}
