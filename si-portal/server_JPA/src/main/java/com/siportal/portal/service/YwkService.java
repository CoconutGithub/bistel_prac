package com.siportal.portal.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import com.siportal.portal.domain.Resume;
import com.siportal.portal.dto.ResumeRequest;
import com.siportal.portal.repository.ResumeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;
import java.util.Collections;

import java.util.Map;
import java.util.ArrayList;

@Service
public class YwkService {

    private final ResumeRepository resumeRepository;
    private final ObjectMapper objectMapper;

    @Autowired
    public YwkService(ResumeRepository resumeRepository, ObjectMapper objectMapper) {
        this.resumeRepository = resumeRepository;
        this.objectMapper = objectMapper;
    }

    public ResponseEntity<?> getResumeList() {
        try {
            // ResumeRepository에서 Object[] 형태로 반환되는 리스트를 받음
            List<Object[]> results = resumeRepository.getResumeList();

            if (results.isEmpty()) {
                return ResponseEntity.ok("조회된 데이터가 없습니다");
            }

            List<Resume> resumes = new ArrayList<>();
            for (Object[] result : results) {
                Resume resume = new Resume();

                // gridRowId와 id를 Integer로 설정
                resume.setGridRowId(((Number) result[0]).intValue());  // grid_row_id 매핑
                resume.setId(((Number) result[1]).intValue());  // id 매핑

                // 나머지 필드들 매핑
                resume.setFullName((String) result[2]);  // full_name 매핑
                resume.setEmail((String) result[3]);  // email 매핑
                resume.setPhone((String) result[4]);  // phone 매핑
                resume.setSummary((String) result[5]);  // summary 매핑
//                resume.setExperience(objectMapper.readValue((String) result[6], new TypeReference<List<Map<String, Object>>>() {}));
                String experienceJson = (String) result[6];
                List<Map<String, Object>> experienceList = (experienceJson != null)
                        ? objectMapper.readValue(experienceJson, new TypeReference<List<Map<String, Object>>>() {})
                        : Collections.emptyList();

                resume.setExperience(experienceList);

//                resume.setEducation(objectMapper.readValue((String) result[7], new TypeReference<List<Map<String, Object>>>() {}));
                String educationJson = (String) result[7];
                List<Map<String, Object>> educationList = (educationJson != null)
                        ? objectMapper.readValue(educationJson, new TypeReference<List<Map<String, Object>>>() {})
                        : Collections.emptyList();

                resume.setEducation(educationList);

//                resume.setSkills(objectMapper.readValue((String) result[8], new TypeReference<List<Object>>() {}));
                String skillsJson = (String) result[8];
                List<Map<String, Object>> skillsList = (skillsJson != null)
                        ? objectMapper.readValue(skillsJson, new TypeReference<List<Map<String, Object>>>() {})
                        : Collections.emptyList();

                resume.setSkills(skillsList);

                resume.setResumeFile((byte[]) result[9]);  // resume_file 매핑
                resume.setResumeFilename((String) result[10]);  // resume_filename 매핑

                Timestamp timestamp = (Timestamp) result[11];
                LocalDateTime createDate = (timestamp != null) ? timestamp.toLocalDateTime() : null;
                resume.setCreateDate(createDate);

//                resume.setCreateDate((LocalDateTime) result[11]);  // create_date 매핑
                resume.setCreateBy((String) result[12]);  // create_by 매핑
                Timestamp timestamp2 = (Timestamp) result[13];
                LocalDateTime updateDate = (timestamp2 != null) ? timestamp2.toLocalDateTime() : null;
                resume.setUpdateDate(updateDate);

//                resume.setUpdateDate((LocalDateTime) result[13]);  // update_date 매핑
                resume.setUpdateBy((String) result[14]);  // update_by 매핑

                resumes.add(resume);
            }

            return ResponseEntity.ok(resumes);
        } catch (NumberFormatException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Invalid menuId format: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error occurred: " + e.getMessage());
        }
    }

    public ResponseEntity<?> saveResume(@RequestBody Map<String, Object> resumeRequest) {
        try {
            Resume resume = new Resume();
            resume.setFullName((String)resumeRequest.get("fullName"));
            resume.setEmail((String)resumeRequest.get("email"));
            resume.setPhone((String)resumeRequest.get("phone"));
            resume.setSummary((String)resumeRequest.get("summary"));
            resume.setExperience((List<Map<String, Object>>)resumeRequest.get("experience"));
            resume.setEducation((List<Map<String, Object>>)resumeRequest.get("education"));
            resume.setSkills((List<Map<String, Object>>)resumeRequest.get("skills"));
            resume.setResumeFile((byte[])resumeRequest.get("resumeFile"));
            resume.setResumeFilename((String)resumeRequest.get("resumeFilename"));
            resume.setCreateDate(LocalDateTime.now());
            resume.setCreateBy((String)resumeRequest.get("createBy"));

            resumeRepository.save(resume);

            return ResponseEntity.ok(resume);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.EXPECTATION_FAILED)
                    .body("Error occurred: " + e.getMessage());
        }
    }
}
