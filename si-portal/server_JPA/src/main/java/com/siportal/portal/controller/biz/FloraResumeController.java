package com.siportal.portal.controller.biz;

import com.siportal.portal.dto.FloraResumeDto;
import com.siportal.portal.service.FloraResumeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/biz/flora-resumes")
@CrossOrigin(origins = {"http://192.168.7.37:9090", "http://localhost:9090"})
@Transactional
public class FloraResumeController {

    @Autowired
    private FloraResumeService floraResumeService;

    private static final Logger logger = LoggerFactory.getLogger(FloraResumeController.class);

    public FloraResumeController(FloraResumeService floraResumeService) {
        this.floraResumeService = floraResumeService;
    }

    @GetMapping
    public ResponseEntity<List<FloraResumeDto>> getAllResumes() {
        return ResponseEntity.ok(floraResumeService.getAllResumes());
    }

    @PostMapping("/create")
    public ResponseEntity<String> createResume(@RequestBody FloraResumeDto resumeDto) {
        logger.info("🚀 createResume 요청이 들어옴: {}", resumeDto);

        if (resumeDto.getResumeFile() == null) {
            resumeDto.setResumeFile(Optional.of(new byte[0]));
        }

        floraResumeService.createResume(resumeDto);
        return ResponseEntity.ok("이력서가 성공적으로 저장되었습니다.");
    }
}
