package com.siportal.portal.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.siportal.portal.domain.Resume;
import com.siportal.portal.repository.CshResumeRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.postgresql.util.PGobject;


@Service
@Transactional
public class CshService {

    private final CshResumeRepository repository;
    private final ObjectMapper objectMapper;

    public CshService(CshResumeRepository repository, ObjectMapper objectMapper) {
        this.repository = repository;
        this.objectMapper = objectMapper;
    }

    public ResponseEntity<?> updateResume(Map<String, Object> requestData) {
        try {

            Resume resume = repository.findById((Integer) requestData.get("id"))
                    .orElseThrow(() -> new RuntimeException("There is no resume"));

            resume.setFullName((String)requestData.get("fullName"));
            resume.setEmail((String)requestData.get("email"));
            resume.setPhone((String)requestData.get("phone"));
            resume.setSummary((String)requestData.get("summary"));
            resume.setEducation( objectMapper.readValue((String)requestData.get("education"),List.class) );
            resume.setExperience( objectMapper.readValue((String)requestData.get("experience"),List.class) );
            resume.setSkills( objectMapper.readValue((String)requestData.get("skills"),List.class) );

            Map<String, Object> response = new HashMap<>();
            response.put("messageCode", "success");
            response.put("message", "모든 작업이 성공적으로 처리되었습니다.");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.EXPECTATION_FAILED)
                    .body("Error occurred: " + e.getMessage());
        }
    }
}
