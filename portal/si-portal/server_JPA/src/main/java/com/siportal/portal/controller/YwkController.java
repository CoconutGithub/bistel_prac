package com.siportal.portal.controller;

import com.siportal.portal.domain.Resume;
import com.siportal.portal.dto.ResumeRequest;
import com.siportal.portal.service.YwkService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.util.*;

import java.util.Optional;

@RestController
@CrossOrigin(origins = {"http://192.168.7.37:9090", "http://localhost:9090"})
@RequestMapping("/admin") // API 기본 경로
@Transactional
public class YwkController {

    private final YwkService ywkService;

    @Autowired
    public YwkController(YwkService ywkService) {
        this.ywkService = ywkService;
    }

    @GetMapping("/api/get-ywk-resume")
    public ResponseEntity<?> getResume() {
        return ywkService.getResumeList();
    }

    @PostMapping("/api/save-ywk-resume")
    public ResponseEntity<?> saveResume(@RequestBody Map<String, Object> resumeRequest) {
        return ywkService.saveResume(resumeRequest);
    }
}
