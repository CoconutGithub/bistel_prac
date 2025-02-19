package com.siportal.portal.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.siportal.portal.domain.Resume;
import com.siportal.portal.repository.CshResumeRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


@Service
@Transactional
public class CshService {

    private final CshResumeRepository repository;
    private final ObjectMapper objectMapper;

    public CshService(CshResumeRepository repository, ObjectMapper objectMapper) {
        this.repository = repository;
        this.objectMapper = objectMapper;
    }

    public ResponseEntity<?> getResumeList() {
        try {
            List<Object[]> sqlResult = repository.findResumeDefaultData();
            List<Map<String, String>> mappedResults = new ArrayList<>();

            int seq = 0;
            for (Object[] row : sqlResult) {
                Map<String, String> map = new HashMap<>();
                map.put("gridRowId", String.valueOf(seq));
                map.put("id", row[0].toString());
                map.put("fullnAME", row[1].toString());
                map.put("summary", row[2].toString());
                map.put("email", row[3].toString());
                map.put("phone", row[4].toString());
                map.put("gender", row[5].toString());
                mappedResults.add(map);

                seq++;
            }

            return ResponseEntity.ok(mappedResults);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.EXPECTATION_FAILED)
                .body("Error occurred: " + e.getMessage());
        }
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
