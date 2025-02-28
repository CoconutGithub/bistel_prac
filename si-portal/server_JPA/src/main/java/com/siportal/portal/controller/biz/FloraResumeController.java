package com.siportal.portal.controller.biz;

import com.siportal.portal.domain.Resume;
import com.siportal.portal.dto.FloraResumeDto;
import com.siportal.portal.dto.FloraResumeProjection;
import com.siportal.portal.service.FloraResumeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/biz/flora-resumes")
@CrossOrigin(origins = {"http://192.168.7.37:9090", "http://localhost:9090"})
@Transactional
public class FloraResumeController {

    private FloraResumeService floraResumeService;

    private static final Logger logger = LoggerFactory.getLogger(FloraResumeController.class);

    public FloraResumeController(FloraResumeService floraResumeService) {
        this.floraResumeService = floraResumeService;
    }

    @GetMapping
    public ResponseEntity<List<FloraResumeProjection>> getAllResumes() {

        return ResponseEntity.ok(floraResumeService.getAllResumes());
    }

    @PostMapping("/create")
    public ResponseEntity<String> createResume(@RequestBody FloraResumeDto resumeDto) {
        try {
            floraResumeService.createResume(resumeDto);
            return ResponseEntity.ok("✅ 이력서가 성공적으로 저장되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("❌ 이력서 저장 실패: " + e.getMessage());
        }
    }

    @GetMapping("/detail/{id}")
    public ResponseEntity<FloraResumeProjection> getResume(@PathVariable Integer id) {

        try {

            FloraResumeProjection data = floraResumeService.getResumeById(id);

            if (data == null) {
                return ResponseEntity.status(404).body(null);
            }

            return ResponseEntity.ok(data);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<String> updateResume(@PathVariable Integer id, @RequestBody FloraResumeDto floraResumeDto) {
        try {
            floraResumeDto.setId(id);
            floraResumeService.updateFloraResume(floraResumeDto);
            return ResponseEntity.ok("이력서 업데이트를 성공했습니다.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }
}
