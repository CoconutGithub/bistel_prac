package com.siportal.portal.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.siportal.portal.controller.biz.FloraResumeController;
import com.siportal.portal.domain.Resume;
import com.siportal.portal.dto.FloraResumeDto;
import com.siportal.portal.dto.FloraResumeProjection;
import com.siportal.portal.repository.FloraResumeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class FloraResumeService {
    private static final Logger logger = LoggerFactory.getLogger(FloraResumeController.class);

    private final FloraResumeRepository floraResumeRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public FloraResumeService(FloraResumeRepository floraResumeRepository) {
        this.floraResumeRepository = floraResumeRepository;
    }

    public List<FloraResumeProjection> getAllResumes() {
        
        return floraResumeRepository.findAllProjectedBy();
    }

    public void createResume(FloraResumeDto resumeDto) {
        try {

            String experienceJson = objectMapper.writeValueAsString(resumeDto.getExperience());
            String educationJson = objectMapper.writeValueAsString(resumeDto.getEducation());
            String skillsJson = objectMapper.writeValueAsString(resumeDto.getSkills());

            Integer insertedId = floraResumeRepository.insertResume(
                    resumeDto.getFullName(),
                    resumeDto.getEmail(),
                    resumeDto.getPhone(),
                    resumeDto.getSummary(),
                    experienceJson,
                    educationJson,
                    skillsJson,
                    resumeDto.getCreateDate(),
                    resumeDto.getCreateBy(),
                    resumeDto.getUpdateDate(),
                    resumeDto.getUpdateBy(),
                    resumeDto.getGender(),
                    resumeDto.getCompany(),
                    resumeDto.getDepartment(),
                    resumeDto.getPosition(),
                    resumeDto.getJobTitle()
            );

            if (insertedId == null || insertedId <= 0) {
                throw new RuntimeException("데이터 저장 실패: 반환된 ID가 유효하지 않음");
            }

            logger.info("✅✅ INSERT 완료! ID: {}", insertedId);
        } catch (Exception e) {
            logger.error("❌ INSERT 실패: {}", e.getMessage(), e);
            throw new RuntimeException("이력서 저장 중 오류 발생: " + e.getMessage());
        }
    }

    public FloraResumeProjection getResumeById(Integer id) {
        return floraResumeRepository.findProjectedById(id).orElse(null);
    }

    public void deleteFloraResume(Integer id) {
        floraResumeRepository.deleteById(id);
    }

    public void updateFloraResume(FloraResumeDto floraResumeDto) {
        try {
            Resume floraResume = floraResumeRepository.findById(floraResumeDto.getId()).orElseThrow(() -> new IllegalArgumentException("이력서를 찾을 수 없습니다." + floraResumeDto.getId()));
            String experienceString = objectMapper.writeValueAsString(floraResumeDto.getExperience());
            String educationString = objectMapper.writeValueAsString(floraResumeDto.getEducation());
            String skillsString = objectMapper.writeValueAsString(floraResumeDto.getSkills());


            if (floraResumeDto.getFullName() != null) {
                floraResume.setFullName(floraResumeDto.getFullName());
            }
            if (floraResumeDto.getEmail() != null) {
                floraResume.setEmail(floraResumeDto.getEmail());
            }
            if (floraResumeDto.getPhone() != null) {
                floraResume.setPhone(floraResumeDto.getPhone());
            }
            if (floraResumeDto.getSummary() != null) {
                floraResume.setSummary(floraResumeDto.getSummary());
            }
            if (experienceString != null) {
                floraResume.setExperience(objectMapper.readValue(experienceString, List.class));
            }
            if (educationString != null) {
                floraResume.setEducation(objectMapper.readValue(educationString, List.class));
            }
            if (skillsString != null) {
                floraResume.setSkills(objectMapper.readValue(skillsString, List.class));
            }
            if (floraResumeDto.getGender() != null) {
                floraResume.setGender(floraResume.getGender());
            }
            if (floraResumeDto.getCompany() != null) {
                floraResume.setCompany(floraResume.getCompany());
            }
            if (floraResumeDto.getDepartment() != null) {
                floraResume.setDepartment(floraResume.getDepartment());
            }
            if (floraResumeDto.getPosition() != null) {
                floraResume.setPosition(floraResume.getPosition());
            }
            if (floraResumeDto.getJobTitle() != null) {
                floraResume.setJobTitle(floraResume.getJobTitle());
            }

            floraResume.setUpdateDate(LocalDateTime.now());



        } catch (Exception e) {
            throw new RuntimeException("이력서 수정 중 오류가 발생했습니다." + e.getMessage());
        }
    }

}
