package com.siportal.portal.controller.biz;

import com.siportal.portal.dto.FloraResumeDto;
import com.siportal.portal.service.FloraResumeService;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/biz/flora-resumes")
@CrossOrigin(origins = {"http://192.168.7.37:9090", "http://localhost:9090"})
@Transactional
public class FloraResumeController {

    private final FloraResumeService floraResumeService;

    public FloraResumeController(FloraResumeService floraResumeService) {
        this.floraResumeService = floraResumeService;
    }

    @GetMapping
    public ResponseEntity<List<FloraResumeDto>> getAllResumes() {
        return ResponseEntity.ok(floraResumeService.getAllResumes());
    }
}
