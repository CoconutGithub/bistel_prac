package com.siportal.portal.controller.biz;

import com.siportal.portal.dto.ResumeDTO_hdh;
import com.siportal.portal.service.ResumeService_hdh;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/biz/hdh-resumes")  // ✅ 변경
@CrossOrigin(origins = {"http://192.168.7.37:9090", "http://localhost:9090"})
@Transactional
public class ResumeController_hdh {

    private final ResumeService_hdh resumeService_hdh;

    public ResumeController_hdh(ResumeService_hdh resumeService) {
        this.resumeService_hdh = resumeService;
    }

    @GetMapping
    public ResponseEntity<List<ResumeDTO_hdh>> getAllResumes() {
        return ResponseEntity.ok(resumeService_hdh.getAllResumes());
    }
}
